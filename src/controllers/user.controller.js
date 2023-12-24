// import { mongoose } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


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


export {
     registerUser,
}