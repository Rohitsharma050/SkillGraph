import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDb from './Config/db.js'
import { userRouter } from './Routes/UserRouter.js'

dotenv.config()
connectDb()
const app = express()
app.use(cors())

app.use(express.json())


app.get('/',(req,res)=>{

    res.send("Hello from backend")

})

app.use('/api/user',userRouter)

const PORT = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`server started on port ${PORT}....`)
})