import jwt from "jsonwebtoken"

export const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided!"
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "The token is in an invalid format!"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

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
