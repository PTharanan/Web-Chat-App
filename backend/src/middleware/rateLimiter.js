import rateLimit from "express-rate-limit";
import "dotenv/config"

// Login endpoint's IP Limit
export const loginRateLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_TIME_MS),
    max: Number(process.env.NUM_OF_REQUESTS),
    message: {
        status: "error",
        message: "Too many login attempts from this IP, please try again after 15 minutes."
    },
    standardHeaders: true,
    legacyHeaders: false
});