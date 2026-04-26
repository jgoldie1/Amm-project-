const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// serve your frontend
app.use(express.static(".")); // serves index.html

// TEST ROUTE (optional)
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// 🔴 REAL-TIME SYSTEM
io.on("connection", (socket) => {
  console.log("User connected");

  // 💬 COMMENTS
  socket.on("comment", (msg) => {
    io.emit("comment", msg);
  });

  // ❤️ HEARTS
  socket.on("heart", () => {
    io.emit("heart");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// 🚀 START SERVER
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("RUNNING ON PORT " + PORT);
});
