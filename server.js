import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import eventRoutes from "./routes/eventRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app); // ✅ Attach HTTP server for Socket.io
const io = new Server(server, {
    cors: { origin: "*" } // ✅ Allow frontend connections
});

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// ✅ Real-time updates with Socket.io
io.on("connection", (socket) => {
    console.log("🟢 A user connected:", socket.id);

    socket.on("register", (eventId) => {
        io.emit("updateEvent", eventId); // 🔥 Notify all users
    });

    socket.on("unregister", (eventId) => {
        io.emit("updateEvent", eventId); // 🔥 Notify all users
    });

    socket.on("newEvent", (event) => {
        io.emit("eventCreated", event); // 🔥 Notify users about new event
    });

    socket.on("disconnect", () => {
        console.log("🔴 User disconnected:", socket.id);
    });
});

// ✅ Use `server.listen` instead of `app.listen`
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { io }; // ✅ Export io to use it in controllers
