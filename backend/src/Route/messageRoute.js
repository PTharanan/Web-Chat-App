import express from "express"
import { auth } from "../middleware/authMiddleware.js"
import { getMessages, sendMessage } from "../Controller/messageController.js"

const route = express.Router()

route.get("/:receiver", auth, getMessages)
route.post("/", auth, sendMessage)

export default route