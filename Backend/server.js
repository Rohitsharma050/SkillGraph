import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./Config/db.js";
import { userRouter } from "./Routes/UserRouter.js";

const result = dotenv.config({ path: "./.env" });

console.log("cwd:", process.cwd());
console.log("dotenv result:", result);
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("PORT:", process.env.PORT);

const app = express();

connectDb();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from backend");
});

app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}....`);
});