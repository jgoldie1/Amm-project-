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
    if (!msg || typeof msg !== "string") return;

    const name = users[socket.id] || "anon";

    // ✅ SEND AS OBJECT (THIS FIXES EVERYTHING)
    io.emit("chat", {
      user: name,
      text: msg
    });

    // ✅ BOT
    setTimeout(() => {
      if (msg.toLowerCase() === "hello") {
        io.emit("chat", {
          user: "🤖 bot",
          text: "welcome to the live"
        });
      }
    }, 200);
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
