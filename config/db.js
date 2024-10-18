import mongoose from "mongoose";

export const connectDB = async() => {
    await mongoose.connect('mongodb+srv://michaelscott8786:87868786Mm@cluster0.g2pzj.mongodb.net/mern_project').then(()=>console.log("DB Connected"));
}