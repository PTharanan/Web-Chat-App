import { RateLimiterMemory } from "rate-limiter-flexible";
import { ENV } from "../utils/env.js"
import ApiResponse from "../utils/ApiResponse.js";

const MAX_REQUESTS = ENV.NUM_OF_REQUESTS;
const WINDOW_SECONDS = ENV.RATE_LIMIT_TIME_MINUTES; // 1 minute
const BLOCK_SECONDS = ENV.BLOCK_TIME_MINUTES; // 15 minutes

const loginLimiter = new RateLimiterMemory({
    points: MAX_REQUESTS,        // 10 requests allowed
    duration: WINDOW_SECONDS,    // within 1 minute (60s)
    blockDuration: BLOCK_SECONDS // if exceeded, block IP for 15 minutes (900s)
});

export const loginRateLimiter = async (req, res, next) => {
    try {
        await loginLimiter.consume(req.ip);
        return next();
    } catch (rateLimiterRes) {
        const remainingSeconds = Math.max(1, Math.ceil(rateLimiterRes.msBeforeNext / 1000));
        const timeDisplay = remainingSeconds >= 60
            ? `${Math.ceil(remainingSeconds / 60)} minute(s)`
            : `${remainingSeconds} second(s)`;

        return res
            .status(429)
            .json(new ApiResponse(429, `Too many login attempts from this IP, please try again after ${timeDisplay}.`));
    }
};