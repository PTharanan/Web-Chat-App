import express from "express"
import { auth } from "../middleware/authMiddleware.js"
import { getUserByName, addNewUser, loginUser, logoutUser } from "../Controller/userController.js"
import { validateUsername, validatePassword, validateEmail } from "../validations/userValidation.js"
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import { registrationGuard } from "../middleware/registrationMiddleware.js";

const route = express.Router()

route.get("/users", auth, getUserByName)
route.post("/register", registrationGuard, validateUsername, validateEmail, validatePassword, addNewUser)
route.post("/login", loginRateLimiter, validateUsername, validatePassword, loginUser)
route.post("/logout", logoutUser)

export default route