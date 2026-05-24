import mongoose  from "mongoose";

const connectDb = async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Database connected successfull")
    } catch (error) {
        console.log(error)
    }
}

export default connectDb