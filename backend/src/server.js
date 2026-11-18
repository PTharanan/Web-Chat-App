import "dotenv/config"
import express from "express"
import cors from "cors"
import http from "http"
import connectDB from "./Config/db.js"
import authRoute from "./Route/authRoute.js"
import messageRoute from "./Route/messageRoute.js"
// import createSocketServer from "./Socket/socketServer.js"


const app = express()
const server = http.createServer(app)
// const io = createSocketServer(server);

app.use(cors())
app.use(express.json())
const port = Number(process.env.PORT)

app.use("/api/auth", authRoute)
app.use("/api/messages", messageRoute)

const startServer = async () => {
  try {
    await connectDB();
    server.listen(port, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port: ${port}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();