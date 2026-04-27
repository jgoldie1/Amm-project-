const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {

  // join with username
  socket.on("join", (name) => {
    users[socket.id] = name || "anon";
  });

  // chat
  socket.on("chat", (msg) => {
    if (!msg) return;

    io.emit("chat", {
      user: users[socket.id] || "anon",
      text: msg
    });
  });

  // disconnect
  socket.on("disconnect", () => {
    delete users[socket.id];
  });

});

server.listen(10000, () => {
  console.log("RUNNING");
});
