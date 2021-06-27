import express from "express";
import { Types } from "mongoose";

import UserModel, { IUser, Status } from "../models/User";
import auth from "../middleware/auth";
import ChatModel, { ChatType, IChat } from "../models/Chat";
import socket from "socket.io";
import { IMessage } from "../models/Message";
const router: express.Router = express.Router();

router.get("/chats", auth, async (req: any, res: any) => {
    try {
        const user: IUser = req.user;
        res.status(200).send(user.chats);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post("/chats", auth, async (req: any, res: any) => {
    try {
        const type: number = req.body["type"];
        const user: IUser = req.user;
        const chat: IChat = new ChatModel();
        chat.populate("participants");
        if (type == ChatType.Dual) {
            const friend: IUser = await UserModel.findById(req.body["userId"]);
            chat.participants.push(user, friend);
        }
        else if (type == ChatType.Group) {
            const ids: string[] = req.body['userIds'];
            const friends: IUser[] = await UserModel.find({
                '_id': {
                    $in: ids.map((val) => Types.ObjectId(val))
                }
            });
            chat.participants.concat(friends);
        }
        await chat.save();
        res.status(200).send("Created");
    } catch (error) {
        res.status(400).send(error);
    }
})


exports = module.exports = function (io: socket.Server) {
    io.sockets.on("connection", function (socket) {
        console.log("Connected");
        socket.on("message", async function(data) {
            await ChatModel.updateOne({ _id: data.chatId }, {
                $push: {
                    messages: <IMessage>{
                        text: data.text,
                        from: data.userId,
                        time: data.timestamp,
                    }
                }
            });
            socket.emit("event", {kek: "LOL"});
        })
    })
}