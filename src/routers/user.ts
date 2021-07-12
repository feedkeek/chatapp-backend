import express from "express";
import UserModel, { IUser, Status } from "../models/User";
import NotificationSchema, { INotification } from "../models/Notification";
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
        const { email, password } = req.body;
        const user: IUser = await UserModel.findByCredentials(email, password);
        if (!user) {
            return res.status(401).send({ error: "Invalid credentials" });
        }
        const token = await user.generateAuthToken();
        res.status(200).send({ user, token });
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
        const friend = await UserModel.findOne({ email: req.body['email'] });
        if (user.friends.find((value) => value == friend) || user.notifications.find((notif) => notif.from == friend)) {
            throw new Error("User is already in friends or notifications");
        }
        user.notifications.push(<INotification>{ from: friend });
        await user.save();
        res.status(200).send("OK");
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/users/resolveNotification", auth, async (req: any, res: any) => {
    try {
        const action: number = req.body["action"]; // 0 or 1
        const index = req.body["index"];
        const user: IUser = req.user;
        const friend = user.notifications[index].from;
        if (action == 0) {
            user.friends.push(friend);
        }
        user.notifications = user.notifications.filter((notif: INotification) => notif.from != friend);
        friend.friends.push(user);
        await user.save();
        await friend.save();
        res.status(200).send("OK");
    } catch (error) {
        res.status(400).send(error);
    }
})

export default router;