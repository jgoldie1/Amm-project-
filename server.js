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
    const cleanMsg = msg.trim();

    // ✅ ALWAYS send user message first
    io.emit("chat", name + ": " + cleanMsg);

    // ✅ BOT (ISOLATED — cannot break chat)
    try {
      const text = cleanMsg.toLowerCase();

      if (text === "hello") {
        setTimeout(() => {
          io.emit("chat", "🤖 bot: welcome to the live");
        }, 200);
      }

      if (text.startsWith("#")) {
        setTimeout(() => {
          io.emit("chat", "🤖 bot: trending tag detected");
        }, 200);
      }

    } catch (e) {
      console.log("BOT ERROR:", e);
    }

  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
