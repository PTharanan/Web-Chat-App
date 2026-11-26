import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true
        },
        text: {
            type: String,
            require: true
        }
    },
    { timestamps: true }
)

export default mongoose.model("Message", messageSchema)
