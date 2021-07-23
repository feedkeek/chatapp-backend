import jwt from "jsonwebtoken";
import UserModel, { IUser } from "../models/User";

const auth = async (req: any, res: any, next: any) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const data: any = await jwt.verify(token, process.env.JWT_KEY);
        const user: IUser = await UserModel.findOne({ _id: data._id, 'tokens.token': token }).populate("friends").populate("notifications"); //.populate('chats');
        if (!user) {
            throw new Error("No such user");
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({ error: "Not authorized to access this resource", err: error});
    }
}

export default auth;