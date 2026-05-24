import express from "express";
import { googleLogin, loginUser, registerUser } from "../Controllers/UserController.js";

export const userRouter = express.Router()


userRouter.post('/signup',registerUser)
userRouter.post('/login',loginUser)

userRouter.post('/googleAuth',googleLogin)

