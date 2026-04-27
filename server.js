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

    // ✅ show user message
    io.emit("chat", name + ": " + msg);

    // ✅ FORCE BOT EVERY TIME (NO CONDITIONS)
    setTimeout(() => {
      io.emit("chat", "🤖 bot: I see your message");
    }, 300);
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
