import "dotenv/config";
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables.");
        }

        // Await the connection promise
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        return conn;

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Exit process with failure code if DB connection fails
        process.exit(1);
    }
};

// Monitor connection lifecycle after initial connection
mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB connection lost/disconnected.");
});

mongoose.connection.on("error", (err) => {
    console.error(`MongoDB runtime error: ${err.message}`);
});

// Graceful shutdown handling (e.g., Ctrl+C or Docker stop)
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to application termination.");
    process.exit(0);
});

export default connectDB;