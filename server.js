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
  });

  socket.on("chat", (msg) => {
    if (!msg) return;

    io.emit("chat", {
      user: users[socket.id] || "anon",
      text: String(msg) // 🔥 FIXED HERE
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });
});

server.listen(10000, () => {
  console.log("SERVER RUNNING ON 10000");
});
