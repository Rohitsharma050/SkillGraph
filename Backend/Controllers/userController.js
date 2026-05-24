import userModel from "../Models/userModel.js"
import bcrypt from 'bcrypt'
import { OAuth2Client } from "google-auth-library"
import jwt from 'jsonwebtoken'
import axios from 'axios'

// ------------ Normal user Register/signup 
export const registerUser = async (req,res)=>{

    try {

        const {name,email,password} = req.body
        if(!name || !email || !password)
        {
           return res.json({
                success:false,
                message:"Missing Field"
    
            })
        }

        const exist = await userModel.findOne({email});
        if(exist)
        {
           return res.json({
                success:false,
                message:"User already exists"

            })
        }

        const hashedPassword = await bcrypt.hash(password,10)

        const user = await userModel.create({
            name,
            email,
            password:hashedPassword,
            authProvider:"local"

        });
        const payload = {id:user._id}
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
           { expiresIn:"7d"}
        )

        res.json({
            success:true,
            token
        })
        
    } catch (error) {
       return res.json({
            success:false,
            message:error.message
        })
    }
}       


// ------ google register-----------

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export const googleLogin = async (req,res)=>{

    try {
        
        const {access_token} = req.body
        // Fetch user data from Google
        const response = await axios.get(

            "https://www.googleapis.com/oauth2/v1/userinfo",

            {
                headers: {
                    Authorization: `Bearer ${access_token}`
                }
            }
        );
    
         const { email, name, picture } = response.data;
    
        let user = await userModel.findOne({email})
        if(!user)
        {
            user = await userModel.create({
                name,
                email,
                authProvider:"google",
                profilePicture:picture
            })
        }
        const payload = {id:user._id}
        const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn:"7d"}
        )
    
      return  res.json({
            success:true,
            token
        })
    } catch (error) {
         console.error("Google login error:", error.message);
       return res.json({
            success:false,
            message:"Google login failed"
        })
    }
}


export const loginUser = async (req,res)=>{
    try {

        const {email,password} = req.body

        const user = await userModel.findOne({email})

        if(!user)
        {
           return res.json({
                success:false,
                message:"User not find"
            })
        }

        if(user.authProvider==="google")
        {
           return res.json({
                success:false,
                message:"Please login using google"
            })
        }

        const match = await bcrypt.compare(password,user.password)
        if(!match)
        {
           return res.json({
                success:false,
                message:"Invalid credential"
            })
        }

        const payload = {id:user._id}
        const token = jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn:"7d"}
        )
    
       return res.json({
            success:true,
            token
        })

        
    } catch (error) {
        
       return res.json({
            success:false,
            message:error.message
        })
    }
}   