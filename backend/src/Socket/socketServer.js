// import { Server } from "socket.io";

// export const createSocketServer = (server) => {
//     const io = new Server(server, {
//         cors: {
//             origin: process.env.CLIENT_URL,
//             methods: ["GET", "POST"],
//             credentials: true
//         },
//         transports: ["websocket", "polling"]
//     });

//     const users = []

//     io.on("connection", (socket) => {
//         console.log("User connected", socket.id);

//         socket.on("join", (username) => {

//             if (!users.some((user) => user.id === socket.id)) {
//                 users.push({
//                     id: socket.id,
//                     username
//                 })
//             }

//             io.emit("user", users.map(user => user.username))

//             io.emit("message", {
//                 username: "System",
//                 message: `${username} has joined the chat`
//             })

//         });
//     });

//     return io;
// };

