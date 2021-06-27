import { Document, Schema, model, Model } from "mongoose";

import messageSchema, { IMessage } from "./Message";
import { IUser } from "./User";

const chatSchema: Schema = new Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: "User"
    }],
    messages: [messageSchema],
    avatarUrl: String,
    name: String,
    createdAt: {
        type: Number,
        default: new Date().getTime()
    },
}, { toJSON: { virtuals: true } });

export enum ChatType {
    Single,
    Dual,
    Group,
}

chatSchema.virtual("type").get(function (this: IChat) {
    return this.participants.length == 1 ? ChatType.Single : (this.participants.length < 2 ? ChatType.Dual : ChatType.Group);
})

export interface IChat extends Document {
    participants: IUser[],
    messages: IMessage[],
    avatarUrl: string,
    type: number,
    name: string,
    createdAt: number,
}

const ChatModel = model<IChat>("Chat", chatSchema);
export default ChatModel;