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

  socket.on("join", (name) => {
    users[socket.id] = name || "anon";
  });

  socket.on("chat", (msg) => {
    console.log("MSG:", msg); // DEBUG

    if (!msg) return;

    const name = users[socket.id] || "anon";

    // ✅ ALWAYS SEND USER MESSAGE
    io.emit("chat", name + ": " + msg);

    // ✅ SIMPLE BOT (NO CONDITIONS = CAN'T FAIL)
    setTimeout(() => {
      io.emit("chat", "🤖 bot: message received");
    }, 300);
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
