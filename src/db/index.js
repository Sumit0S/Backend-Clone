import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import {DB_NAME} from '../constants.js'

const connectDB= async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log("DATABASE CONNECTED")
    }
    catch(error){
        console.log(error);
    }
}
export default connectDB

