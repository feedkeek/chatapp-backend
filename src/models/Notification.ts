import { Schema, Model, model, } from "mongoose";
import { IUser } from "../models/User";

const NotificationSchema: Schema = new Schema({
    from: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
});

export interface INotification{
    from: IUser,
}

export default NotificationSchema;