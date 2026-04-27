const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {

  console.log("Connected:", socket.id);

  // JOIN
  socket.on("join", (username) => {
    users[socket.id] = username || "anon";
    io.emit("userList", users);
  });

  // CHAT (ONLY THIS — CLEAN)
  socket.on("chat", (msg) => {
    if (!msg || msg.trim() === "") return;

    const data = {
      user: users[socket.id] || "anon",
      text: msg
    };

    io.emit("chat", data);
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", users);
    console.log("Disconnected:", socket.id);
  });

});

server.listen(10000, () => {
  console.log("RUNNING ON PORT 10000");
});
