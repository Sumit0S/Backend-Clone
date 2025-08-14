import dotenv from 'dotenv'
dotenv.config();
import mongoose from 'mongoose'
import {DB_NAME} from './constants.js';
import connectDB from './db/index.js';
import {app} from './app.js'
import { error } from 'console';
import asyncHandler  from './utils/asyncHandler.js';



connectDB()
  .then(() => {
    try{
        app.on("error",(error)=>{
            console.log(error);
            throw error
        })
        app.listen(process.env.PORT || 8000,()=>{
            console.log(`server is running at port ${process.env.PORT}`)
        });
        console.log("Hii, I am connected");
    }
    catch(error){
        console.log("Find error during listen")
    }

  })
  .catch((error) => {
    console.error("Connection failed:", error);
});




/*
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log("connected");
    }
    catch(error){
        console.log(error);
        throw error
    }
})()
*/

console.log("connected succesfully")