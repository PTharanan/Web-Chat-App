import Message from "../Model/messageSchema.js"

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
        res.status(200).json({
            status: "success",
            message: "Messages successfully get",
            data: message
        })
    } catch (error) {
        console.error(`MessageController getMessges error: ${error.message}`)
        res.status(500).json({
            status: "error",
            message: "Failed to get messages"
        })
    }
}

// Send message  to a specific user
export const sendMessage = async (req, res) => {
    try {
        const { text, receiver } = req.body;
        const message = await Message.create({
            sender: req.use.username,
            receiver,
            text

        })
        res.status(201).json({
            status: "success",
            message: "Messages successfully send",
            data: message
        })
    } catch (error) {
        console.error(`MessageController sendMessge error: ${error.message}`)
        res.status(500).json({
            status: "error",
            message: "Failed to send message"
        })
    }
}