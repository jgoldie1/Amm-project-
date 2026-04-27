const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve frontend
app.use(express.static("public"));

let users = {};
let likes = 0;

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("chat", `🔥 ${username} joined`);
  });

  socket.on("chat", (msg) => {
    const name = users[socket.id] || "User";
    io.emit("chat", `${name}: ${msg}`);
  });

  socket.on("like", () => {
    likes++;
    io.emit("likes", likes);
  });

  socket.on("muteUser", ({ id, time }) => {
    const target = io.sockets.sockets.get(id);
    if (target) {
      target.muted = true;
      target.emit("muted", time);

      setTimeout(() => {
        target.muted = false;
        target.emit("unmuted");
      }, time * 60000);
    }
  });

  socket.on("kickUser", (id) => {
    const target = io.sockets.sockets.get(id);
    if (target) target.disconnect(true);
  });

  socket.on("reportUser", ({ id, reason }) => {
    console.log("REPORT:", {
      user: users[id],
      by: users[socket.id],
      reason
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("RUNNING ON PORT", PORT));
