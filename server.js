const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let heartCount = 0;

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (username) => {
    socket.username = username;
    io.emit("comment", `${username} joined the live 🔥`);
  });

  socket.on("comment", (msg) => {
    io.emit("comment", `${socket.username}: ${msg}`);
  });

  socket.on("heart", () => {
    heartCount++;
    io.emit("heart", heartCount);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("comment", `${socket.username} left ❌`);
    }
  });
});

http.listen(10000, () => console.log("RUNNING ON 10000"));
