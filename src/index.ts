import express from "express";
import dotenv from "dotenv";
dotenv.config();
require('./db/db');
import cors from "cors";
import socket, { Server } from "socket.io";
import http from "http";

import userRouter from "./routers/user";
import chatRouter from "./routers/chat";
const PORT = process.env.PORT || 3000;
const app: express.Application = express();

app.use(cors());
app.use(express.json());
app.use(userRouter);
app.use(chatRouter);

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("<h1>Hello from api server</h1>");
});

const server = http.createServer(app);
const io: socket.Server = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

interface socketUser{
    "socketId": string,
    "email": string,
}

const usersOnline: any = {};

io.on('connection', (socket) => {
    console.log('User connected');

    socket.on("userJoined", (email) => {
        console.log("kek");
        usersOnline[email] = socket.id;
        console.log(usersOnline);
    });
    socket.on("joinroom", (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`${socket.id} joined chat chat_${chatId}`);
        socket.on(`sendMessage_${chatId}`, (data) => {
            socket.broadcast.to(`chat_${chatId}`).emit(`receiveMessage_${chatId}`, data);
        });
        socket.on(`startWriting_${chatId}`, (data) => {
            socket.broadcast.to(`chat_${chatId}`).emit(`writing_${chatId}`, true);
        })
        socket.on(`endWriting_${chatId}`, (data) => {
            socket.broadcast.to(`chat_${chatId}`).emit(`stopWriting_${chatId}`, false);
        })
    })
    socket.on("chatCreated", (email) => {
        console.log("chatCreated endpoint socket");
        io.to(usersOnline[email]).emit("reloadChats");
    })
    socket.on('disconnect', () => {
        console.log("disconnect endpoint socket");
    })
})


server.listen(PORT, () => {
    console.log(`Server listens at localhost:${PORT}`);
})