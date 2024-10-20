import mongoose, {model, Schema} from "mongoose"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String, 
            required: true,
            lowercase: true,
            trim: true,
            index: true // For search
        },
        email: {
            type: String, 
            required: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String, 
            lowercase: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,  // Cloudinary URL
            required: true
        },
        coverImage: {
            type: String // Cloudinary URL
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "video" // Assuming the correct model is "video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

// Hash password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next(); // Fixed condition

    // If password is modified, hash it
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Check if password is correct
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Generate access token
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);



/*
 Jwt :- jwt is bearer token

*/