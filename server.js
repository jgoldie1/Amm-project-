const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("."));

// 🔥 GLOBAL STATE
let heartCount = 0;
let users = [];

// 🔌 CONNECTION
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ❤️ HEART SYSTEM (LOCKED)
  socket.on("heart", () => {
    heartCount++;
    io.emit("heart", heartCount);
  });

  // 💬 COMMENTS
  socket.on("comment", (msg) => {
    io.emit("comment", msg);
  });

  // 👥 JOIN ROOM (MAX 3)
  socket.on("join", (username) => {
    if (users.length >= 3) {
      socket.emit("roomFull");
      return;
    }

    users.push({ id: socket.id, name: username });
    io.emit("updateUsers", users);
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    users = users.filter(u => u.id !== socket.id);
    io.emit("updateUsers", users);
  });
});

// 🤖 BOT COMMENTS
setInterval(() => {
  io.emit("comment", "🤖 bot: this is fire 🔥");
}, 10000);

// 🚀 START
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("RUNNING ON PORT " + PORT);
});
