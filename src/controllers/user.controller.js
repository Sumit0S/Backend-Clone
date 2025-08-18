import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import {User} from "../models/user.model.js"
import {uploadcloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apiresponse.js"
import jwt from 'jsonwebtoken'
import { access } from "fs";

const generateAccessAndRefreshToken=async(userId)=>{
    try{
        const user=await User.findById(userId);
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
    }
    catch(error){
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}
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
    console.log(req.body);
    console.log(req.files);
    const {fullname,email,username,password}=req.body;

    if([fullname,email,username,password].some((feild)=>feild?.trim()==="")){ throw new ApiError(400,"All fields are required"); }


    const existedUser=await User.findOne({
        $or: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
        ]
    })

    if(existedUser){
        throw new ApiError(400,"user already existed");
    }

    console.log("req.body:", req.body);
    console.log("req.file:", req.file);
    console.log("req.files:", req.files);
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

const loginUser=asyncHandler(async(req,res)=>{
    console.log("'sfsfsfvsfds")
    // console.log(req.body);
    // get user detail from the frontend
    // all possible validation 
    // check user exist on database find user and password check
    // access and refresh token
    // send cookies

    const {email,username,password}=req.body;

    if (!email && !password) {
        throw new ApiError(400, "Email and password are required");
    }


    const user=await User.findOne(
       {$or: [
            { username: username.toLowerCase() },
            { email: email.toLowerCase() }
        ]
       }
    );

    if(!user){
         throw new ApiError(400,"User not found");
    }

    const isPasswordValid=await user.isPasswordcorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"u enter wrong password")
    }


    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);

    const loggedInUser=await User.findById(user._id).select("-password -refreshToken");

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,
        {
        user:loggedInUser,accessToken,
        refreshToken
        },
        "user logged in successfully"
    ))
})

const logoutUser=asyncHandler(async(req,res)=>{
    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined

            }
        },
        {
            new:true
        }
    );
    const options={
        httpOnly:true,
        secure:true
    }
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"user logged out succesfully"),
        
    )
})

const refreshAccessToken=asyncHandler(async(req,res)=>
{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken
    console.log(req.cookies.refreshToken)
    if(!incomingRefreshToken){
        throw new ApiError(402,"refreshToken not defiend")
    }
    try {
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user=await User.findById(decodedToken._id)
        console.log(user)
        if(!user)
        {
            throw new ApiError(400,"Invalid refresh token")
        }
        if(user?.refreshToken!==incomingRefreshToken){
            throw new ApiError(400,"Refresh token is expired")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
        const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id);
        console.log("new. ",accessToken)
        return res
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,{accessToken,refreshToken},"Acess token refreshed")
        )
    } catch (error) {
        throw new ApiError(401,"Invalid hai bhiaya") 
}
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { password, newpassword } = req.body;

    if (!password || !newpassword) {
        throw new ApiError(400, "Both current and new password are required");
    }
    if (password === newpassword) {
        throw new ApiError(400, "New password must be different from current password");
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(401, "Login first");
    }

    const isPasswordCorrect = await user.isPasswordcorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid current password");
    }

    user.password = newpassword;
    await user.save(); // triggers hashing

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

export { logoutUser,registerUser ,changeCurrentPassword,loginUser,refreshAccessToken}