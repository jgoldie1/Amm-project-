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

  // send current values
  socket.emit("update", { hearts, gifts });

  socket.on("chat", (msg) => {
    io.emit("chat", msg);
  });

  socket.on("heart", () => {
    hearts++;
    io.emit("update", { hearts, gifts });
  });

  socket.on("gift", (amount = 1) => {
    gifts += amount;
    io.emit("update", { hearts, gifts });
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
