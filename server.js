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
    if (!msg) return;

    const name = users[socket.id] || "anon";

    // ✅ ALWAYS SEND OBJECT
    io.emit("chat", {
      user: name,
      text: msg
    });

    // ✅ BOT (MATCH SAME FORMAT)
    io.emit("chat", {
      user: "🤖 bot",
      text: "WORKING"
    });
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
