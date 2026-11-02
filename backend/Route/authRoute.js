import express from "express"
import auth from "../middleware/authMiddleware.js"
import { getUserByName, addNewUser, loginUser } from "../Controller/userController.js"
import { validateUsername, validatePassword } from "../validations/userValidation.js"
import { loginRateLimiter } from "../middleware/rateLimiter.js";

const route = express.Router()

route.get("/users", auth, getUserByName)
route.post("/register", validateUsername, validatePassword, addNewUser)
route.post("/login", validateUsername, validatePassword, loginRateLimiter, loginUser)

export default route