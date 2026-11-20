import User from "../Model/userSchema.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import ApiResponse from "../utils/ApiResponse.js"
import "dotenv/config"
import { sendWelcomeEmail } from "../emails/emailHandlers.js"

export const findUserByUsername = async (username, selectFields = "_id") => {
    try {
        return await User.findOne({ username }).select(selectFields).lean();

    } catch (error) {
        console.error(`UserController findUserByUsername error: ${error.message}`)
        throw error;
    }
}

export const findUserByEmail = async (email, selectFields = "_id") => {
    try {
        return await User.findOne({ email }).select(selectFields).lean();

    } catch (error) {
        console.error(`UserController findUserByEmail error: ${error.message}`)
        throw error;
    }
}

// Get All Users by username not in current user
export const getUserByName = async (req, res) => {
    try {
        const users = await User.find({ username: { $ne: req.user?.username } }).select("username").lean();
        res.status(200).json(new ApiResponse(200, "Users successfully get", users))

    } catch (error) {
        console.error(`UserController GetUserByName error: ${error.message}`)
        return res.status(500).json(new ApiResponse(500, "Failed to Get all users"))
    }
}

// Add New User
export const addNewUser = async (req, res) => {
    try {
        const { username, email, password } = req.validatedData
        const existingUser = await User.findOne(
            { $or: [{ username }, { email }] },
            "username email"
        ).lean();

        if (existingUser) {
            const message = existingUser.username === username
                ? "Username is already taken"
                : "Email is already taken";
            return res.status(409).json(new ApiResponse(409, message));
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({ username, email, password: hashPassword })

        if (newUser) {
            try {
                Promise.resolve(sendWelcomeEmail(email, username, process.env.CLIENT_URL))
                    .catch((err) => console.error("Async email error:", err));
            } catch (emailErr) {
                console.error("Sync email error:", emailErr);
            }
        }

        return res.status(201).json(new ApiResponse(201, "Successfully created user"));


    } catch (error) {
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0];
            const message = duplicateField === "email"
                ? "Email is already taken"
                : "Username is already taken";
            return res.status(409).json(new ApiResponse(409, message));
        }
        console.error(`UserController AddNewUser error: ${error.message}`)
        return res.status(500).json(new ApiResponse(500, "Failed to Add user"))
    }
}

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.validatedData

        const user = await findUserByUsername(username, "username password loginAttempts lockUntil")

        if (!user) {
            return res.status(401).json(new ApiResponse(401, "Invalid Username or Password"));
        }

        const now = Date.now();
        const lockUntilTime = user.lockUntil ? new Date(user.lockUntil).getTime() : 0;

        // CHECK IF ACCOUNT IS LOCKED
        if (lockUntilTime > now) {
            const remainingTimeInMinutes = Math.ceil((lockUntilTime - now) / (1000 * 60));

            return res.status(429).json(new ApiResponse(429, `Account is temporarily locked. Try again after ${remainingTimeInMinutes} minutes.`));
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS) || 5
            const LOCK_TIME_HOURS = Number(process.env.LOCK_TIME_HOURS) * 60 * 60 * 1000 || 5 * 60 * 60 * 1000

            const isLockExpired = lockUntilTime > 0 && lockUntilTime <= now;
            const newAttempts = isLockExpired ? 1 : (user.loginAttempts || 0) + 1;

            let updateData = { loginAttempts: newAttempts };
            let unsetData = {};

            if (newAttempts >= MAX_ATTEMPTS) {
                updateData.lockUntil = new Date(now + LOCK_TIME_HOURS);
            } else if (isLockExpired) {
                unsetData.lockUntil = 1;
            }


            const updateQuery = Object.keys(unsetData).length > 0
                ? { $set: updateData, $unset: unsetData }
                : { $set: updateData };

            await User.updateOne({ _id: user._id }, updateQuery);


            return res.status(401).json(new ApiResponse(401, "Invalid Username or Password"));
        }

        // SUCCESSFUL LOGIN
        if (user.loginAttempts > 0 || user.lockUntil) {
            await User.updateOne(
                { _id: user._id },
                {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                }
            );
        }

        // JWT Token
        const token = jwt.sign(
            { id: user._id, username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
        )

        const isProduction = process.env.NODE_ENV === "production";

        return res.status(200)
            .cookie("jwt", token, {
                maxAge: Number(process.env.COOKIE_EXPIRES_DAYS) * 24 * 60 * 60 * 1000 || 1 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "strict" : "lax"
            })
            .json(new ApiResponse(200, "Successfully login user", { username: user?.username }));

    } catch (error) {
        console.error(`UserController loginUser error: ${error.message}`)
        return res.status(500).json(new ApiResponse(500, "Failed to Login user"))
    }
}



