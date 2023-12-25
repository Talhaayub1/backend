// import { mongoose } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { response } from "express";


const generateAccessAndRefreshToken = async (userId) => {
     try {
          const user = await User.findById(userId);
          const accessToken =  user.generateAccessToken();
          const refreshToken = user.generateRefreshToken();

          user.refreshToken = refreshToken;
          await user.save({ validateBeforeSave: false });

          return {accessToken, refreshToken}

     } catch (error) {
          throw new ApiError(500, "Something went wrong While generating access and refresh tokens");
     }
}



const registerUser = asyncHandler( async (req, res) => {

     // 1) get user details from frontend (Postman)
     // 2) Validate the user
     // 3) check if the user already exists: check username and email 
     // 4) check for images, check for avatar
     // 5) upload to cloudniary, avatar 
     // 6) create user object - create entry in DataBase
     // 7) remove password and refresh token field from response 
     // 8) return response

     const { fullName, email, username, password} = req.body;
     // console.log("email: " + email);

     // console.log(req.body);

     if(
          [fullName, email, username, password].some( (field) => field?.trim()=== "")
     ){
          throw new ApiError(400, "All fields is required");
     }

     const existedUser = await User.findOne({
          $or: [{username}, {email}]
     })

     if(existedUser){
          throw new ApiError(409, "User exist with username and email");
     }


     const avatarLocalPath = req.files?.avatar[0]?.path;
     // const coverImageLocalPath = req.files?.coverImage[0]?.path;

     let coverImageLocalPath;
     if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
          coverImageLocalPath = req.files.coverImage[0].path;
     }


     if(!avatarLocalPath){
          throw new ApiError(400, "Avatar files is required");
     }
     
     const avatar = await uploadOnCloudinary(avatarLocalPath);
     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    
     if(!avatar){
          throw new ApiError(400, "Avatar file must be required");
     }

     // console.log(req.files);
     
     const user = await User.create({
          fullName,
          avatar: avatar.url,
          coverImage: coverImage?.url || "",
          email,
          password,
          username: username.toLowerCase(),

     })

     const createdUser = await User.findById(user._id).select(
          "-password -refreshToken"
     )

     if(!createdUser){
     throw new ApiError(500, "Something went wrong while registering user");
     }


     return res.status(201).json(
          new ApiResponse(200, createdUser, "User registered successfully")
     )

})


const loginUser = asyncHandler ( async (req, res) => {
     // req body -> data
     // access base on username or email (but we want access on both ones)
     // find the user
     // check the password
     // generate access token and refresh token
     // send this access token and refresh token via Secure cookies!
     // send response that user login successfully


     const {username, email, password} = req.body;

     if(!(username || email)){
          throw new ApiError(400, "username or email is required");
     }

     // find the user 
     const user = await User.findByOne({
          $or: [{username}, {email}]
     });

     if(!user){
          throw new ApiError(404, "User does not exist"); 
     }

     const isPasswordCorrect = await user.isPasswordCorrect(password);

     if(!isPasswordCorrect){
          throw new ApiError(404, "Password is Invalid");
     }


     const {accessToken, refreshToken}  =await generateAccessAndRefreshToken(user._id);

     const loggedInUser = await User.findById(user._id).
     select("-password -refreshToken");

     const options = {
          httpOnly: true,
          secure: true,
     }

     return res
     .status(200)
     .cookie("accessToken", accessToken, options).
     cookie("refreshToken", refreshToken, options).
     json(
          new ApiResponse(
          200, 
          {
               user: loggedInUser, accessToken, refreshToken
          },
          "User Logged In Successfully"
          )
     )

})   

const logoutUser = asyncHandler (async (req,res) => {
     await User.findByIdAndUpdate(
          req.user._id,
          {
               $set:{
                    refreshToken: undefined,
               }
          },
          {
               new: true,
          }
     )


     const options = {
          httpOnly: true,
          secure: true,
     }

     return res.status(200).
     clearCookie("accessToken", options).
     clearCookie("refreshToken", options).
     json(new ApiResponse(200, {}, "User Logout Successfully"));

})

export {
     registerUser,
     loginUser,
     logoutUser,
}