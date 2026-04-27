const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};
let likes = 0;

function sendUserList() {
  io.emit("userList", users);
}

io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("chat", `🔥 ${username} joined`);
    sendUserList();
  });

  socket.on("chat", (msg) => {
    const name = users[socket.id] || "User";
    io.emit("chat", `${name}: ${msg}`);
  });

  socket.on("like", () => {
    likes++;
    io.emit("likes", likes);
  });

  socket.on("muteUser", (id) => {
    const target = io.sockets.sockets.get(id);
    if (target) {
      target.emit("muted", 3);
      setTimeout(() => target.emit("unmuted"), 180000);
    }
  });

  socket.on("kickUser", (id) => {
    const target = io.sockets.sockets.get(id);
    if (target) target.disconnect(true);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    sendUserList();
  });

});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log("RUNNING ON PORT", PORT));
