const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

let users = {};

io.on("connection", (socket) => {

  // user joins
  socket.on("join", (name) => {
    users[socket.id] = name || "anon";
  });

  // chat
  socket.on("chat", (msg) => {
    if (!msg) return;

    const name = users[socket.id] || "anon";
    const finalMsg = name + ": " + msg;

    io.emit("chat", finalMsg);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
