import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  Container,
  TextField,
  Typography,
  Button,
  Box,
} from "@mui/material";

function App() {
  const socket = useMemo(() => io("http://localhost:3000"), []);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketID, setSocketID] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      setSocketID(socket.id);
    });

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("Welcome", (msg) => {
      setMessages((prev) => [...prev, { message: msg, from: "Server" }]);
    });

    return () => {
      socket.off("connect");
      socket.off("Welcome");
      socket.off("receive-message");
    };
  }, [socket]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    socket.emit("message", { message, room });
    setMessage("");
  };

  const joinRoom = () => {
    if (room.trim() !== "") {
      socket.emit("join-room", room);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h2" align="center" sx={{ mt: 5 }}>
        Testing WebSocket.io
      </Typography>
      <Typography variant="h6">Socket ID: {socketID}</Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Enter the message"
          variant="outlined"
          fullWidth
          margin="normal"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <TextField
          label="Enter the room"
          variant="outlined"
          fullWidth
          margin="normal"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          <Button type="submit" variant="outlined">
            Send
          </Button>
          <Button onClick={joinRoom} variant="outlined">
            Join Room
          </Button>
        </Box>
      </form>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Messages:</Typography>
        {messages.map((m, i) => (
          <Typography key={i}>
            <strong>{m.from}:</strong> {m.message}
          </Typography>
        ))}
      </Box>
    </Container>
  );
}

export default App;
