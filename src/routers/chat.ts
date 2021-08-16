import express from "express";
import { Types } from "mongoose";

import UserModel, { IUser, Status } from "../models/User";
import auth from "../middleware/auth";
import ChatModel, { ChatType, IChat } from "../models/Chat";
// import io from "../index";
import { IMessage } from "../models/Message";
const router: express.Router = express.Router();

router.get("/chats", auth, async (req: any, res: any) => {
        const user: IUser = req.user;
        res.status(200).send(await user.chats);
    
})

router.post("/chats", auth, async (req: any, res: any) => {
    try {
        const type: number = req.body["type"];
        const user: IUser = req.user;
        const chat: IChat = new ChatModel();
        chat.populate("participants");
        if (type == ChatType.Dual) {
            const friend: IUser = await UserModel.findOne({email: req.body['email']});
            chat.participants.push(user);
            chat.participants.push(friend);
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
    
        res.status(200).send(chat);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post("/chats/:id/", auth, async (req: any, res: any) => {
    try {
        const chat: IChat = await ChatModel.findById(req.params.id);
        const text: string = req.body['text'];
        const message = {
            from: req.user.email, 
            text: text, 
            time: new Date().getTime()
        };
        chat.messages.push(
            <IMessage>message,
        );
        await chat.save();
        // io.to(`room_${req.params.id}`).emit("messageSend");
        res.status(200).send("Sended");
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
})

router.delete("/chats/:id/", auth, async (req: any, res: any) => {
    try {
        await ChatModel.findByIdAndDelete(req.params.id);
        res.status(200).send("Deleted");
    } catch (error) {
        res.status(400).send(error);
    }
})

// io.on('connection', (socket) => {
//     console.log('User connected');

//     socket.on("join-chat", (chatId) => {
//         console.log(`JOIN CHAT socket:${socket.id} room:${chatId}`);
//         socket.join(chatId);
//         console.log('SOCKET ROOMS', io.sockets.adapter.rooms);
//     })

//     io.of("/").adapter.on("join-room", (room, id) => {
//         console.log(`${id} joined ${room}`);
//     });
// })

export default router;

// export function chatSocket(io: socket.Server) {
//     io.sockets.on("connection", function (socket) {
//         console.log("Connected");
//         socket.on("message", async function(data: any) {
//             // await ChatModel.updateOne({ _id: data.chatId }, {
//             //     $push: {
//             //         messages: <IMessage>{
//             //             text: data.text,
//             //             from: data.userId,
//             //             time: data.timestamp,
//             //         }
//             //     }
//             // });
//             io.emit("event", {kek: "BRUUUUH"});
//         })
//     })
// }