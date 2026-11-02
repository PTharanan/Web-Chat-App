import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [4, "Username must be at least 4 characters"],
            maxlength: [29, "Username must be less than 30 characters"]
        },
        password: {
            type: String,
            required: [true, "Password is required"]
        },
        loginAttempts: { type: Number, required: true, default: 0 },
        lockUntil: { type: Date }
    },
    { timestamps: true }
);

export default mongoose.model("User", userSchema);