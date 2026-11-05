import User from "../Model/userSchema.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import "dotenv/config"

export const findUserByUsername = async (username, selectFields = "_id") => {
    try {
        return await User.findOne({ username }).select(selectFields).lean();

    } catch (error) {
        console.error(`UserController findUserByUsername error: ${error.message}`)
        res.status(500).json({
            status: "error",
            message: "Failed to find user"
        })
    }
}

// Get All Users by username not in current user
export const getUserByName = async (req, res) => {
    try {
        const users = await User.find({ username: { $ne: req.user.username } }).select("username").lean();
        res.status(200).json({
            status: "success",
            message: "Users successfully get",
            data: users
        })

    } catch (error) {
        console.error(`UserController GetUserByName error: ${error.message}`)
        res.status(500).json({
            status: "error",
            message: "Failed to Get all users",
            data: null
        })
    }
}

// Add New User
export const addNewUser = async (req, res) => {
    try {
        const { username, password } = req.validatedData
        const existingUser = await findUserByUsername(username, "_id")

        if (existingUser) {
            return res.status(409).json({
                status: "error",
                message: "Username is already taken"
            });
        }

        const hashPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ username, password: hashPassword })

        if (!user) {
            return res.status(409).json({
                status: "error",
                message: "Can not create user"
            });
        }

        return res.status(201).json({
            status: "success",
            message: "Successfully created user"
        });


    } catch (error) {
        console.error(`UserController AddNewUser error: ${error.message}`)
        res.status(500).json({
            status: "error",
            message: "Failed to Add user"
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.validatedData

        const user = await findUserByUsername(username, "username password loginAttempts lockUntil")

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid Username or Password"
            });
        }

        // CHECK IF ACCOUNT IS LOCKED
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remainingTimeInMinutes = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));

            return res.status(429).json({
                status: "error",
                message: `Account is temporarily locked. Try again after ${remainingTimeInMinutes} minutes.`
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            const MAX_ATTEMPTS = process.env.MAX_ATTEMPTS
            const LOCK_TIME_MS = process.env.LOCK_TIME_MS

            const newAttempts = (user.loginAttempts || 0) + 1;
            let updateData = { loginAttempts: newAttempts };

            if (newAttempts >= MAX_ATTEMPTS) {
                updateData.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
            }

            await User.updateOne({ _id: user._id }, { $set: updateData });

            return res.status(401).json({
                status: "error",
                message: "Invalid Username or Password",
                remainingAttempts: Math.max(0, MAX_ATTEMPTS - newAttempts)
            });
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

        return res.status(200).json({
            status: "success",
            message: "Successfully login user",
            data: { username, token }
        });

    } catch (error) {
        console.error(`UserController loginUser error: ${error.message}`)
        res.status(500).json({
            status: "error",
            message: "Failed to Login user"
        })
    }
}



