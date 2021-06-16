import mongoose from "mongoose";

mongoose.connect(process.env.MONGODB_URL, { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true }, (error) => {
    console.log(error);
    console.log("Connected to db");
})