import User from "../Model/userSchema.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import ApiResponse from "../utils/ApiResponse.js"
import { enqueueWelcomeEmail } from "../queues/emailQueue.js"
import { ENV } from "../utils/env.js"

const getAuthCookieOptions = () => {
    const isProduction = ENV.NODE_ENV === "production";

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    };
};

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

// Get All by username not in current user
export const getUserByName = async (req, res) => {
    try {
        const users = await User.find({ username: { $ne: req.user?.username } }).select("username").lean();
        res.status(200).json(new ApiResponse(200, "Users successfully get", users))

    } catch (error) {
        console.error(`UserController GetUserByName error: ${error.message}`)
        return res.status(500).json(new ApiResponse(500, "Failed to Get all users"))
    }
}

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

        try {
            await enqueueWelcomeEmail({
                userId: newUser._id.toString(),
                email,
                name: username,
                clientURL: ENV.CLIENT_URL
            });
        } catch (emailQueueError) {
            console.error("Failed to enqueue welcome email:", emailQueueError);
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
            const MAX_ATTEMPTS = ENV.MAX_ATTEMPTS
            const LOCK_TIME_HOURS = ENV.LOCK_TIME_HOURS

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
            ENV.JWT_SECRET,
            { expiresIn: ENV.JWT_EXPIRES_IN || "1d" }
        )

        return res.status(200)
            .cookie("jwt", token, {
                ...getAuthCookieOptions(),
                maxAge: ENV.COOKIE_EXPIRES_DAYS,
            })
            .json(new ApiResponse(200, "Successfully login user", { username: user?.username }));

    } catch (error) {
        console.error(`UserController loginUser error: ${error.message}`)
        return res.status(500).json(new ApiResponse(500, "Failed to Login user"))
    }
}

export const logoutUser = (_, res) => {
    return res.clearCookie("jwt", getAuthCookieOptions())
        .status(200)
        .json(new ApiResponse(200, "Successfully logout"));
}



