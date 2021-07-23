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
// const file1 = chatSocket(io);
io.on('connection', (socket) => {
    console.log('User connected');
})

io.on('connection', (socket) => {
    console.log('User connected');

    // socket.on("join-chat", (chatId) => {
    //     console.log(`JOIN CHAT socket:${socket.id} room:${chatId}`);
    //     socket.join(chatId);
    //     console.log('SOCKET ROOMS', io.sockets.adapter.rooms);
    // })

    // io.of("/").adapter.on("join-room", (room, id) => {
    //     console.log(`${id} joined ${room}`);
    // });

    socket.on("joinroom", (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`${socket.id} joined chat chat_${chatId}`);
        socket.on(`sendMessage_${chatId}`, (data) => {
            console.log("Message sended");
            io.to(`chat_${chatId}`).emit('receiveMessage', data);
        });
        
    })

})


// export default io;

// console.log("Connected");
// socket.on("message", async function(data) {
//     // await ChatModel.updateOne({ _id: data.chatId }, {
//     //     $push: {
//     //         messages: <IMessage>{
//     //             text: data.text,
//     //             from: data.userId,
//     //             time: data.timestamp,
//     //         }
//     //     }
//     // });
//     socket.emit("event", {"kek": "BRUUUUH"});
// })

server.listen(PORT, () => {
    console.log(`Server listens at localhost:${PORT}`);
})