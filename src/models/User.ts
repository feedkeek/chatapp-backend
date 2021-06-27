import { Document, Schema, model, Model } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";
import jwt from "jsonwebtoken";

import NotificationSchema, {INotification} from "./Notification";
import ChatModel, { IChat } from "./Chat";

const userSchema: Schema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: (value: string) => {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email Address");
            }
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 8
    },
    registration_date: {
        type: Date,
        default: Date.now()
    },
    profileImg: String,
    about: String,
    friends: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        default: []
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    status: {
        type: Number,
        enum: [0, 1, 2, 3, 4]
    },
    notifications: [NotificationSchema]
});

userSchema.pre("save", async function (this: IUser, next) {
    const user: IUser = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

userSchema.methods.generateAuthToken = async function (this: IUser) {
    const user: IUser = this;
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY);
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user: IUser = await UserModel.findOne({ email });
    if (!user) {
        throw new Error("Invalid login credentials");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error("Invalid login credentials");
    }
    return user;
}

userSchema.virtual("chats").get(async function(this: IUser){
    const chats: IChat[] = await ChatModel.find({participants: this}).populate("participants");
    chats.sort(function(a: IChat, b: IChat) {
        const val1 = a.messages.length > 0 ? a.messages[a.messages.length].time : a.createdAt;
        const val2 = b.messages.length > 0 ? b.messages[b.messages.length].time : b.createdAt;
        return val2 - val1;
    });
    return chats;
});

export interface IUser extends Document {
    username: string,
    email: string,
    password: string,
    registration_date: Date,
    profileImg: string,
    about: string,
    friends: IUser[],
    tokens: Array<{ token: string }>,
    status: Status,
    notifications: INotification[],
    generateAuthToken(): string,
    chats: IChat[],
}

export interface IUserModel extends Model<IUser> {
    findByCredentials(email: string, password: string): IUser,
}

export enum Status {
    Offline,
    Online,
    Busy,
    Sleep,
    DontDisturb
}

const UserModel = model<IUser, IUserModel>('User', userSchema);

export default UserModel;