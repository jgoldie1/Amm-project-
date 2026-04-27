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
    users[socket.id] = (typeof name === "string" && name.trim()) ? name : "anon";
  });

  socket.on("chat", (msg) => {

    // 🔒 FORCE STRING (THIS FIXES UNDEFINED FOREVER)
    let text = "";

    if (typeof msg === "string") {
      text = msg;
    } else {
      text = JSON.stringify(msg);
    }

    text = text.trim();
    if (!text) return;

    const name = users[socket.id] || "anon";

    // ✅ user message
    io.emit("chat", name + ": " + text);

    // ✅ SAFE BOT
    setTimeout(() => {
      const lower = text.toLowerCase();

      if (lower === "hello") {
        io.emit("chat", "🤖 bot: welcome to the live");
      }

      if (lower.startsWith("#")) {
        io.emit("chat", "🤖 bot: trending tag detected");
      }

    }, 200);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
