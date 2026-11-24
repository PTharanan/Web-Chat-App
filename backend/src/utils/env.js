import "dotenv/config"

export const ENV = Object.freeze({
    PORT: Number(process.env.PORT || 3000),
    NODE_ENV: process.env.NODE_ENV || "development",
    MONGO_URI: process.env.MONGO_URI,
    CLIENT_URL: process.env.CLIENT_URL,
    ALLOW_REGISTRATION: process.env.ALLOW_REGISTRATION,

    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

    MAX_ATTEMPTS: Number(process.env.MAX_ATTEMPTS || 5),
    LOCK_TIME_HOURS: Number(process.env.LOCK_TIME_HOURS || 5) * 60 * 60 * 1000,

    COOKIE_EXPIRES_DAYS: Number(process.env.COOKIE_EXPIRES_DAYS || 1) * 24 * 60 * 60 * 1000,

    RATE_LIMIT_TIME_MINUTES: Number(process.env.RATE_LIMIT_TIME_MINUTES || 1) * 60,
    NUM_OF_REQUESTS: Number(process.env.NUM_OF_REQUESTS) || 10,
    BLOCK_TIME_MINUTES: Number(process.env.BLOCK_TIME_MINUTES || 15) * 60,

    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    REDIS_URL: process.env.REDIS_URL
})
