import express from "express";
import { googleLogin, loginUser, registerUser, getProfile, updateProfile } from "../Controllers/userController.js";
import authMiddleware from "../Middleware/authMiddleware.js";
import { uploadProfile } from "../Config/Cloudinary.js";

export const userRouter = express.Router()


// ---- Auth routes (unchanged) ----
userRouter.post('/signup', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/googleAuth', googleLogin)

// ---- Profile routes (protected) ----
userRouter.get('/profile', authMiddleware, getProfile)
userRouter.put('/profile', authMiddleware, uploadProfile, updateProfile)
