const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let hearts = 0;
let gifts = 0;

io.on("connection", (socket) => {
  console.log("User connected");

  // INIT
  socket.emit("init", { hearts, gifts });

  // CHAT
  socket.on("chat", (msg) => {
    io.emit("chat", msg);
  });

  // HEART
  socket.on("heart", () => {
    hearts++;
    io.emit("update", { hearts, gifts });
  });

  // GIFT
  socket.on("gift", (amount) => {
    gifts += amount || 1;
    io.emit("update", { hearts, gifts });
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
