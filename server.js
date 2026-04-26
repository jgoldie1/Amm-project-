const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.static("."));

// 🔥 GLOBAL STATE
let heartCount = 0;
let users = [];
let lastHeartTime = {};

// 🤖 BOT SYSTEM
const botNames = ["Jay", "Lex", "Nova", "Kai", "Zay"];

const messages = [
  "this stream go crazy 🔥",
  "nah this lit fr",
  "W chat 😂",
  "ain’t no way 💀",
  "this vibe different",
  "yo keep going",
  "W host fr",
  "this lowkey fire",
  "chat going wild",
  "who else here 👀"
];

// 🔌 CONNECTION
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ❤️ HEARTS (ANTI-SPAM LOCK)
  socket.on("heart", () => {
    const now = Date.now();

    if (lastHeartTime[socket.id] && now - lastHeartTime[socket.id] < 1000) {
      return;
    }

    lastHeartTime[socket.id] = now;

    heartCount++;
    io.emit("heart", heartCount);
  });

  // 💬 COMMENTS
  socket.on("comment", (msg) => {
    io.emit("comment", msg);
  });

  // 👥 JOIN ROOM (MAX 3)
  socket.on("join", (username) => {
    if (users.length >= 3) {
      socket.emit("roomFull");
      return;
    }

    users.push({ id: socket.id, name: username });
    io.emit("updateUsers", users);
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    users = users.filter(u => u.id !== socket.id);
    delete lastHeartTime[socket.id];
    io.emit("updateUsers", users);
  });
});

// 🤖 SMART BOT CHAT
setInterval(() => {
  if (users.length === 0) return;

  const randomUser = users[Math.floor(Math.random() * users.length)];
  const randomBot = botNames[Math.floor(Math.random() * botNames.length)];
  const randomMsg = messages[Math.floor(Math.random() * messages.length)];

  const fullMsg = `${randomBot}: @${randomUser.name} ${randomMsg}`;

  io.emit("comment", fullMsg);

}, 6000);

// 🚀 START SERVER
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("RUNNING ON PORT " + PORT);
});
