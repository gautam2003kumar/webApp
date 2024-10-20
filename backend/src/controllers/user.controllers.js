import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResposnse.js";

const registerUser = asyncHandler(async (req, res) =>{
    //get user detils from frontend
    const {fullName, email, username, password} = req.body
    console.log(`email: ${email} fullName: ${fullName}  username: ${username}  password: ${password}`);

    //validation - not empty

    // if(fullName === ""){
    //     throw new ApiError(400, "fullname is required")
    // }

    if(
        [fullName, email, username, password].some((field) =>{
            field.trim() === ""
        })
    ) {
        throw new ApiError(400, "All fields are required")
    }

    //check if user alrady exists : username, email
    const exitsedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(exitsedUser){
        throw new ApiError (409, "User already exits with given email or username")
    }

    //check for images, check for avtar
    const avtarLocalPath =  req.files?.avtar[0]?.path;
    const coverImageLoacklPath = req.files?.coverImage[0]?.path;

    if(!avtarLocalPath){
        throw new ApiError(400, "Avtar file is required");
    }

    const avatar = await uploadOnCloudinary(avtarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLoacklPath);

    //upload then cloudinary , avatar
    if(!avtr ){
        throw new ApiError(400, "Avtar file is required");
    }
    //create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    

    //remove password and refresh token fiedld from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation 
    if(!createdUser){
        throw new ApiError(500, "Somting went worng while registering the user")
    }

    //return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export {registerUser}