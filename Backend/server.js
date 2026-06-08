import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./Config/db.js";
import { userRouter } from "./Routes/UserRouter.js";
import dns from "dns";
const result = dotenv.config({ path: "./.env" });
 dns.setServers(["1.1.1.1", "8.8.8.8"]);

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