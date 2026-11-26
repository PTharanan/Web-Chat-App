import jwt from "jsonwebtoken"
import { ENV } from "../utils/env.js"

export const auth = (req, res, next) => {
    try {
        const token = req.cookies?.jwt;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided!"
            });
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET)

        req.user = decoded;

        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message)
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token!",
        });
    }
}
