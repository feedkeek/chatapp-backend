import {Schema, model,} from "mongoose";

import {IUser} from "./User";

const messageSchema: Schema = new Schema({
    text: String,
    from: String,
    time: {
        type: Number,
        default: new Date().getTime()
    }
},);

export interface IMessage{
    text: string,
    from: string,
    time: number,
}

export default messageSchema;