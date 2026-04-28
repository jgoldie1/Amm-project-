const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// IMPORTANT: use correct port
const PORT = process.env.PORT || 10000;

// serve frontend
app.use(express.static("public"));

// data
let hearts = 0;
let gifts = 0;

// socket
io.on("connection", (socket) => {
  console.log("User connected");

  socket.emit("update", { hearts, gifts });

  socket.on("chat", (msg) => {
    io.emit("chat", msg);
  });

  socket.on("heart", () => {
    hearts++;
    io.emit("update", { hearts, gifts });
  });

  socket.on("gift", (amount) => {
    gifts += amount || 1;
    io.emit("update", { hearts, gifts });
  });
});

// 🔥 THIS LINE FIXES YOUR ISSUE
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port " + PORT);
});
