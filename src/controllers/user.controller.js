import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import {User} from "../models/user.model.js"
import {uploadcloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiresponse.js"
const registerUser = asyncHandler(async (req, res) => 
{
    // Below are the steps to follow
    // get user details from frontend
    // all possible validation ex-:not empty
    // check if user alredy exist
    // check for images and check for avatar
    // upload them to cloudinary,avatar
    // create user object-create entry in db
    // removed password and refresh token feild from response
    // check for user creating
    // return res if user create successfull

    const {fullname,email,username,password}=req.body;
    if([fullname,email,username,password].some((feild)=>feild?.trim()==="")){
        throw new ApiError(400,"All fields are required");
    }

    const existedUser=User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(400,"All fields are required");
    }

    const avatarLocalPath=req.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avtar file is required");
    }
    const avatar=await uploadcloudinary(avatarLocalPath);
    const coverImage=await uploadcloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400,"Avtar file is required");
    }

    const user=await User.create({
        fullname,
        avatar:avatar.url,
        coverimage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })
    const createduser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createduser){
        throw new ApiError(500,"Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200,createduser,"user registered succesfully")
    );
});

export { registerUser }
