const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected");

  // 💬 CHAT
  socket.on("chat", (msg) => {
    if (!msg) return;
    io.emit("chat", msg);
  });

  // ❤️ HEART
  socket.on("heart", () => {
    io.emit("heart");
  });

  // 🎁 GIFT
  socket.on("gift", () => {
    io.emit("gift");
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
