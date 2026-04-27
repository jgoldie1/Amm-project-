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
    users[socket.id] = (name && typeof name === "string") ? name : "anon";
  });

  socket.on("chat", (msg) => {

    // 🔒 FORCE STRING ALWAYS
    let text = "";

    try {
      text = (typeof msg === "string") ? msg : JSON.stringify(msg);
    } catch {
      text = "";
    }

    text = text.trim();
    if (!text) return;

    const name = users[socket.id] || "anon";

    // ✅ ALWAYS SEND CLEAN STRING
    io.emit("chat", String(name) + ": " + String(text));

    // ✅ BOT (SAFE)
    setTimeout(() => {
      const lower = text.toLowerCase();

      if (lower === "hello") {
        io.emit("chat", "🤖 bot: welcome to the live");
      }
    }, 200);

  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
