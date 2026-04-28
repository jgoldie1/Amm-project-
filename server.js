const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve frontend
app.use(express.static("public"));

// ✅ EVERYTHING MUST BE INSIDE THIS BLOCK
io.on("connection", (socket) => {
  console.log("User connected");

  // chat
  socket.on("chat", (msg) => {
    io.emit("chat", msg);
  });

  // heart
  socket.on("heart", () => {
    io.emit("heart");
  });

  // gift
  socket.on("gift", () => {
    io.emit("gift");
  });
});

// start server
server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
