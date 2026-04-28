const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let hearts = 0;
let gifts = 0;

io.on("connection", (socket) => {
  console.log("User connected");

  // fake profile (so UI doesn't break)
  const user = {
    username: "User" + Math.floor(Math.random() * 1000),
    followers: Math.floor(Math.random() * 500),
  };

  // INIT
  socket.emit("init", { hearts, gifts });
  socket.emit("profile", user);

  // CHAT
  socket.on("chat", (msg) => {
    io.emit("chat", {
      user: user.username,
      followers: user.followers,
      msg,
    });

    // 🤖 SIMPLE BOT
    if (Math.random() < 0.3) {
      io.emit("chat", {
        user: "StubbsAI",
        msg: "🔥 that's fire",
        isBot: true,
      });
    }
  });

  // ❤️ HEART
  socket.on("heart", () => {
    hearts++;
    io.emit("update", { hearts, gifts });
    io.emit("sound", { type: "heart" });
  });

  // 🎁 GIFT
  socket.on("gift", (amount) => {
    const amt = amount || 1;
    gifts += amt;

    io.emit("update", { hearts, gifts });
    io.emit("gift-anim", { amount: amt });
    io.emit("sound", { type: "gift" });
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
