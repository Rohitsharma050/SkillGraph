import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:
    {
        type:String,
        required:true,
    },
    password:{
        type:String,
        default:""
     
    },
    authProvider:{
        type:String,
        enum:["local","google"],
        default:"local"
    },
    profilePicture: {
        type:String,
        default:""
    },
    targetRole: {
      type: String,
      default: "",
    }


})
const userModel = mongoose.model("User",userSchema)
export default userModel;