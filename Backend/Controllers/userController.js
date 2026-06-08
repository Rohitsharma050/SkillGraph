import userModel from "../Models/userModel.js"
import bcrypt from 'bcrypt'
import { OAuth2Client } from "google-auth-library"
import jwt from 'jsonwebtoken'
import axios from 'axios'
import { uploadToCloudinary } from "../Config/Cloudinary.js"

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
        } else if (!user.profilePicture && picture) {
            // Update Google picture if user has no profile picture stored
            user.profilePicture = picture;
            await user.save();
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


// ------------ GET /api/user/profile ------------
export const getProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId).select("-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                role: user.targetRole,
                image: user.profilePicture,
                resumeUrl: user.resumeUrl,
                skills: user.skills,
                authProvider: user.authProvider,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};


// ------------ PUT /api/user/profile ------------
export const updateProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Parse fields from body
        const { name, role, skills } = req.body;

        if (name !== undefined) user.name = name.trim();
        if (role !== undefined) user.targetRole = role;

        // Skills come as JSON string from FormData
        if (skills !== undefined) {
            try {
                user.skills = typeof skills === "string" ? JSON.parse(skills) : skills;
            } catch {
                user.skills = [];
            }
        }

        // Handle profile image upload to Cloudinary
        if (req.files && req.files.image && req.files.image[0]) {
            const imageBuffer = req.files.image[0].buffer;
            const result = await uploadToCloudinary(imageBuffer, {
                folder: "skillgraph/profile-images",
                transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
            });
            user.profilePicture = result.secure_url;
        }

        // Handle resume upload to Cloudinary
        if (req.files && req.files.resume && req.files.resume[0]) {
            const resumeBuffer = req.files.resume[0].buffer;
            const resumeOriginalName = req.files.resume[0].originalname;
            const result = await uploadToCloudinary(resumeBuffer, {
                folder: "skillgraph/resumes",
                resource_type: "raw",
                public_id: `resume_${req.userId}_${Date.now()}`,
            });
            user.resumeUrl = result.secure_url;
        }

        await user.save();

        return res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                name: user.name,
                email: user.email,
                role: user.targetRole,
                image: user.profilePicture,
                resumeUrl: user.resumeUrl,
                skills: user.skills,
                authProvider: user.authProvider,
            },
        });
    } catch (error) {
        console.error("Profile update error:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};