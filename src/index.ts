import express from "express";
import dotenv from "dotenv";
dotenv.config();
require('./db/db');

const PORT = process.env.PORT || 3000;

const app: express.Application = express();

app.use(express.json());

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("<h1>Hello from server</h1>");
});

app.listen(PORT, () => {
    console.log(`Server listens at localhost:${PORT}`);
})