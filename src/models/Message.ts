import {Schema, model,} from "mongoose";

import {IUser} from "./User";

const messageSchema: Schema = new Schema({
    text: String,
    from: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    time: {
        type: Number,
        default: new Date().getTime()
    }
},);

export interface IMessage{
    text: string,
    from: IUser,
    time: number,
}

export default messageSchema;