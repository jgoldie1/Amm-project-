const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {

  socket.on("join", (name) => {
    users[socket.id] = name || "anon";
  });

  socket.on("chat", (msg) => {
    if (typeof msg !== "string") return;

    const username = users[socket.id] || "anon";
    const finalMessage = username + ": " + msg;

    io.emit("chat", finalMessage);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });

});

server.listen(10000, () => {
  console.log("RUNNING");
});
