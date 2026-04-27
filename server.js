const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("USER CONNECTED");

  socket.on("chat", (msg) => {
    console.log("MSG:", msg);

    if (!msg) return;

    io.emit("chat", msg);
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
