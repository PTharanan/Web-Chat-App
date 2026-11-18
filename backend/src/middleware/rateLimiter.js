import rateLimit from "express-rate-limit";
import "dotenv/config"

// Login endpoint's IP Limit
export const loginRateLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_TIME_MS) * 60 * 1000 || 1 * 60 * 1000,
    max: Number(process.env.NUM_OF_REQUESTS) || 10,
    message: {
        status: "error",
        message: "Too many login attempts from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});