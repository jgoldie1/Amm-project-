const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = {};
let likeCount = 0;

// BOT RESPONSES
const botMessages = [
  (u) => `${u} that was fire 🔥`,
  (u) => `nah ${u} going crazy fr`,
  (u) => `${u} just snapped 💯`,
  (u) => `chat going wild rn 😂`,
];

// JOIN
io.on("connection", (socket) => {
  socket.on("join", (username) => {
    users[socket.id] = { id: socket.id, name: username };
    io.emit("userList", users);
  });

  // CHAT
  socket.on("chat", (msg) => {
    const user = users[socket.id];
    if (!user) return;

    io.emit("chat", { user: user.name, text: msg });

    // BOT reply
    setTimeout(() => {
      const bot = botMessages[Math.floor(Math.random() * botMessages.length)];
      io.emit("chat", { user: "Bot", text: bot(user.name) });
    }, 1500);
  });

  // LIKE
  socket.on("like", () => {
    likeCount++;
    io.emit("likes", likeCount);
  });

  // GIFTS
  socket.on("gift", (amount) => {
    io.emit("chat", {
      user: "SYSTEM",
      text: `💰 ${users[socket.id].name} sent ${amount} coins`,
    });
  });

  // ADMIN
  socket.on("muteUser", (id) => {
    io.to(id).emit("muted");
    setTimeout(() => io.to(id).emit("unmuted"), 3000);
  });

  socket.on("kickUser", (id) => {
    io.to(id).emit("kicked");
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", users);
  });
});

http.listen(10000, () => console.log("RUNNING ON 10000"));
