const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {
  console.log("CONNECTED:", socket.id);

  socket.on("join", (username) => {
    users[socket.id] = username || "anon";
    console.log("JOIN:", username);
  });

  socket.on("chat", (msg) => {
    console.log("MESSAGE RECEIVED:", msg);

    if (!msg) return;

    io.emit("chat", {
      user: users[socket.id] || "anon",
      text: msg
    });
  });
});

server.listen(10000, () => {
  console.log("SERVER RUNNING");
});
