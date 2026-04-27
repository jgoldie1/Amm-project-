const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("USER CONNECTED");

  socket.on("chat", (msg) => {
    console.log("MSG:", msg);

    io.emit("chat", msg || "EMPTY MESSAGE");
  });
});

server.listen(10000, () => {
  console.log("SERVER RUNNING");
});
