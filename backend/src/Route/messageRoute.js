import express from "express"
import { auth } from "../middleware/authMiddleware.js"
import { getAllContacts, getMessages, sendMessage } from "../Controller/messageController.js"

const route = express.Router()

route.get("/contacts", auth, getAllContacts)
// route.get("/chats", auth, getChatPartners)
// route.get("/:id", auth, getMessagesByUserId)
// route.post("/", auth, sendMessage)

export default route