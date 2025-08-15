
import dotenv from 'dotenv'
dotenv.config();
import express, { urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app=express();
const valw=process.env.PORT;
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    Credential:true
}));

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())


// routes

import userRouter from './routes/user.routes.js'


app.get('/',(req,res)=>{
    res.send("hiii");
})
// routes declaration

app.use("/api/v1/users",userRouter)

export {app};
