import express from "express";
import dotenv from "dotenv";
require('./db/db');
dotenv.config();

const PORT = 3000 || process.env.PORT;

const app: express.Application = express();

app.use(express.json());

app.get('/', (req: express.Request, res: express.Response) => {
    res.send("<h1>Hello from server</h1>");
});

app.listen(PORT, () => {
    console.log(`Server listens at localhost:${PORT}`);
})