const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let hearts = 0;

io.on("connection", (socket) => {
  console.log("User connected");

  socket.emit("init", hearts);

  socket.on("chat", (msg) => {
    io.emit("chat", msg);
  });

  socket.on("heart", () => {
    hearts++;
    io.emit("heart", hearts);
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
