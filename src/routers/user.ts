import express from "express";
import UserModel, { IUser, Status } from "../models/User";
import auth from "../middleware/auth";

const router: express.Router = express.Router();

router.post("/users", async (req: express.Request, res: express.Response) => {
    try {
        const user = new UserModel(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/users/login", async (req: express.Request, res: express.Response) => {
    try {
        const {email, password} = req.body;
        const user: IUser = await UserModel.findByCredentials(email, password);
        if(!user) {
            return res.status(401).send({error: "Invalid credentials"});
        }
        const token = await user.generateAuthToken();
        res.send({user, token});
    } catch (error) {
        res.status(400).send(error);
    }
})

router.get("/users", async (req: express.Request, res: express.Response) => {
    try {
        const users: IUser[] = await UserModel.find({}).populate("friends");
        res.status(200).send(users);
    } catch (error) {
        res.status(400).send(error);
    }
})

router.post("/users/addFriend", auth, async (req: any, res: any) => {
    try {
        const user: IUser = req.user;
        const friend = await UserModel.findOne({email: req.body['email']});
        user.friends.push(friend);
        await user.save();
        res.status(200).send("OK");
    } catch (error) {
        res.status(400).send(error);
    }
});

export default router;