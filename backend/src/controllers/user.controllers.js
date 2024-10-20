import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"; // Fixed typo in import

const generateAccessAndRefreshToken = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Somthing went wrong while generating refersh and accecc token");
    }
}

// const registerUser = asyncHandler(async (req, res) => {
//     // Get user details from frontend
//     const { fullName, email, username, password } = req.body;
//     console.log(`email: ${email} fullName: ${fullName}  username: ${username}  password: ${password}`);

//     // Validation - not empty
//     if ([fullName, email, username, password].some(field => field.trim() === "")) {
//         throw new ApiError(400, "All fields are required");
//     }

//     // Check if user already exists: username, email
//     const existingUser = await User.findOne({
//         $or: [{ username }, { email }]
//     });

//     if (existingUser) {
//         throw new ApiError(409, "User already exists with given email or username");
//     }

//     // Check for avatar and cover image
//     const avatarLocalPath = req.files?.avatar?.[0]?.path; // Fixed typo "avtar" to "avatar"
//     const coverImageLocalPath = req.files?.coverImage?.[0]?.path; // Fixed typo "LoacklPath"

//     if (!avatarLocalPath) {
//         throw new ApiError(400, "Avatar file is required");
//     }

//     // Upload to Cloudinary
//     const avatar = await uploadOnCloudinary(avatarLocalPath);
//     const coverImage = await uploadOnCloudinary(coverImageLocalPath);

//     // Check if avatar upload was successful
//     if (!avatar) {
//         throw new ApiError(400, "Failed to upload avatar file");
//     }

//     // Create user object - create entry in DB
//     const user = await User.create({
//         fullName,
//         avatar: avatar.url,
//         coverImage: coverImage?.url || "",
//         email,
//         password,
//         username: username.toLowerCase()
//     });

//     // Remove password and refreshToken fields from response
//     const createdUser = await User.findById(user._id).select("-password -refreshToken");

//     // Check if user creation was successful
//     if (!createdUser) {
//         throw new ApiError(500, "Something went wrong while registering the user");
//     }

//     // Return response
//     return res.status(201).json(
//         new ApiResponse(200, createdUser, "User registered successfully")
//     );
// });

// 

const registerUser = asyncHandler(async (req, res) => {
    console.log("Start registering user");

    const { fullName, email, username, password } = req.body;
    console.log("Received data:", { fullName, email, username, password });

    if ([fullName, email, username, password].some(field => field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });
    console.log("Checked if user exists");

    if (existingUser) {
        throw new ApiError(409, "User already exists with given email or username");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log("File paths:", { avatarLocalPath, coverImageLocalPath });

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    console.log("Uploaded files to Cloudinary");

    // Create user object
    try {
        const user = await User.create({
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        });
        console.log("User created:", user);

        // Remove sensitive data like password
        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering the user");
        }

        // Return success response
        return res.status(201).json(
            new ApiResponse(201, createdUser, "User registered successfully")
        );

    } catch (error) {
        console.error("Error creating user:", error);
        throw new ApiError(500, "Internal Server Error");
    }
});

// const loginUser = asyncHandler(async (req, res) =>{
//     // req body -> data
//     const {email, username, password} = req.body
//     console.log("Received data:", { email, username, password });
    

//     //username or email
//     if(!username && !email){
//         throw new ApiError(400, "username or email is required")
//     }

//     //find the user
//     const user = await User.findOne({
//         $or: [ { username }, { email } ]
//     })

//     if(!user){
//         throw new ApiError(404, "user does not exit")
//     }

//     //password check
//     const isPasswordValid = await user.isPasswordCorrect(password)

//     if(!isPasswordValid){
//         throw new ApiError(401, "Invalid user credentials")
//     }

//     //access and resfress token
//     const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

//     //send cookie
//     const loggedInUser = await User.findById(user._id).select( "-password -refreshToken")

//     const options = {
//         httpOnly: true,
//         secure: true
//     }

//     return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//         new ApiResponse(
//             200,
//             {
//                 user: loggedInUser, accessToken ,refreshToken
//             },
//             "User logged in Successfully"
//         )
//     )
// })

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    const { email, username, password } = req.body;
    console.log("Received data:", { email, username, password });
    
    // username or email
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    // find the user
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });
    console.log(user.fullName);

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // password check
    const isPasswordValid = await user.isPasswordCorrect(password);
    console.log(isPasswordValid);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    console.log("Token : ",{accessToken, refreshToken});

    // send cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); // Await here

    const options = {
        httpOnly: true,
        secure: true // Set to false for local development if using HTTP
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});


const logoutUser = asyncHandler(async (req, res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})

export { 
    registerUser,
    loginUser,
    logoutUser
};