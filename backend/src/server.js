import { ENV } from "./utils/env.js"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import http from "http"
import mongoose from "mongoose"
import connectDB from "./Config/db.js"
import authRoute from "./Route/authRoute.js"
import messageRoute from "./Route/messageRoute.js"
import { closeWelcomeEmailQueue, startWelcomeEmailWorker } from "./queues/emailQueue.js"
// import createSocketServer from "./Socket/socketServer.js"


const app = express()
const server = http.createServer(app)
// const io = createSocketServer(server);
let shutdownStarted = false;

app.use(cors())
app.use(cookieParser())
app.use(express.json())
const port = Number(ENV.PORT)

app.use("/api/auth", authRoute)
app.use("/api/messages", messageRoute)

const shutdown = async (signal) => {
  if (shutdownStarted) {
    return;
  }
  shutdownStarted = true;
  console.log(`${signal} received; shutting down gracefully`);

  let shutdownFailed = false;

  if (server.listening) {
    try {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      shutdownFailed = true;
      console.error(`Failed to close HTTP server: ${error.message}`);
    }
  }

  try {
    await closeWelcomeEmailQueue();
  } catch (error) {
    shutdownFailed = true;
    console.error(`Failed to close welcome email queue: ${error.message}`);
  }

  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  } catch (error) {
    shutdownFailed = true;
    console.error(`Failed to close MongoDB connection: ${error.message}`);
  }

  process.exitCode = shutdownFailed ? 1 : 0;
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

const startServer = async () => {
  try {
    await connectDB();
    await startWelcomeEmailWorker();
    server.listen(port, () => {
      console.log(`Server running in ${ENV.NODE_ENV} mode on port: ${port}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();