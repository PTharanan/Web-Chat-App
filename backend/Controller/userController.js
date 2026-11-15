import User from "../Model/userSchema.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import ApiResponse from "../utils/ApiResponse.js"
import "dotenv/config"

export const findUserByUsername = async (username, selectFields = "_id") => {
    try {
        return await User.findOne({ username }).select(selectFields).lean();

    } catch (error) {
        console.error(`UserController findUserByUsername error: ${error.message}`)
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
        res.status(500).json(new ApiResponse(500, "Failed to Get all users"))
    }
}

// Add New User
export const addNewUser = async (req, res) => {
    try {
        const { username, password } = req.validatedData
        const existingUser = await findUserByUsername(username, "_id")

        if (existingUser) {
            return res.status(409).json(new ApiResponse(409, "Username is already taken"));
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ username, password: hashPassword })

        return res.status(201).json(new ApiResponse(201, "Successfully created user"));


    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json(new ApiResponse(409, "Username is already taken"));
        }
        console.error(`UserController AddNewUser error: ${error.message}`)
        res.status(500).json(new ApiResponse(500, "Failed to Add user"))
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
            const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS)
            const LOCK_TIME_MS = Number(process.env.LOCK_TIME_MS)

            const isLockExpired = lockUntilTime > 0 && lockUntilTime <= now;
            const newAttempts = isLockExpired ? 1 : (user.loginAttempts || 0) + 1;

            let updateData = { loginAttempts: newAttempts };
            let unsetData = {};

            if (newAttempts >= MAX_ATTEMPTS) {
                updateData.lockUntil = new Date(now + LOCK_TIME_MS);
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
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        return res.status(200).json(new ApiResponse(
            200,
            "Successfully login user",
            { username, token }
        ));

    } catch (error) {
        console.error(`UserController loginUser error: ${error.message}`)
        res.status(500).json(new ApiResponse(500, "Failed to Login user"))
    }
}



