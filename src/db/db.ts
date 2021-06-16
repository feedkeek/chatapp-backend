import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URL, (error) => {
    console.log(error);
})