import Message from "../Model/messageSchema.js"
import User from "../Model/userSchema.js"
import ApiResponse from "../utils/ApiResponse.js"

// Get messages between 2 users
export const getMessages = async (req, res) => {
    try {
        const { receiver } = req.params;
        const sender = req.user.username;
        const message = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        }).sort({ timestamps: 1 });
        res.status(200).json(new ApiResponse(200, "Messages successfully get", message))
    } catch (error) {
        console.error(`MessageController getMessges error: ${error.message}`)
        res.status(500).json(new ApiResponse(500, "Failed to get messages"))
    }
}

// Send message  to a specific user
export const sendMessage = async (req, res) => {
    try {
        const { text, receiver } = req.body;
        const message = await Message.create({
            sender: req.user.username,
            receiver,
            text

        })
        res.status(201).json(new ApiResponse(201, "Messages successfully send", message))
    } catch (error) {
        console.error(`MessageController sendMessge error: ${error.message}`)
        res.status(500).json(new ApiResponse(500, "Failed to send message"))
    }
}

export const getAllContacts = async (req, res) => {
    try {
        const loggedInUserId = req.user.id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password")
        res.status(200).json(new ApiResponse(200, "Successfully getAllContacts", filteredUsers))

    } catch (error) {
        console.error(`MessageController getAllContacts error: ${error.message}`)
        res.status(500).json(new ApiResponse(500, "Sever error"))
    }
}