import { strict } from 'assert';
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
import { type } from 'os';

const videoSchema=new Schema
(
    {
        videoFile:{
            type:String,
            required:true
        },
        thumbnail:{
            type:String,
            required:true
        },
        tittle:{
            type:String,
            required:true
        },
        discription:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:Boolean,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {
        timestamps:true
    }
)

export const Video=mongoose.model('Video',videoSchema);