import express from "express";
import dotenv from "dotenv";
dotenv.config();
require('./db/db');
import cors from "cors";
import socket, { Server } from "socket.io";
import http from "http";

const PORT = process.env.PORT || 3000;
const app: express.Application = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("<h1>Hello from server</h1>");
});
const server = http.createServer(app);
const io: socket.Server = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('User connected');
})

server.listen(PORT, () => {
    console.log(`Server listens at localhost:${PORT}`);
})