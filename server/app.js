import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Hello from server");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("Welcome", "Welcome to the WebSocket server!");
  socket.broadcast.emit("Welcome", `New user joined: ${socket.id}`);

  socket.on("message", ({ message, room }) => {
    console.log(`Message: ${message} | Room: ${room}`);
    if (room === "") {
      io.emit("receive-message", { message, from: socket.id });
    } else {
      io.to(room).emit("receive-message", { message, from: socket.id });
    }
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`${socket.id} joined room: ${room}`);
    socket.to(room).emit("Welcome", `${socket.id} joined the room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
