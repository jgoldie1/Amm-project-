const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let hearts = 0;
let gifts = 0;
let coins = 0;

io.on("connection", (socket) => {
  console.log("User connected");

  // SEND START DATA
  socket.emit("init", { hearts, gifts, coins });

  // CHAT + BOT
  socket.on("chat", (msg) => {
    if (!msg) return;

    io.emit("chat", msg);

    let reply = "Bot 👀";
    if (msg.toLowerCase().includes("/genz")) {
      reply = "no cap 🔥 fr fr";
    } else if (msg.toLowerCase().includes("/genx")) {
      reply = "back in my day 😎";
    }

    setTimeout(() => {
      io.emit("chat", reply);
    }, 700);
  });

  // HEART
  socket.on("heart", () => {
    hearts++;
    coins++;

    io.emit("update", { hearts, gifts, coins });
    io.emit("fx", { type: "heart", power: hearts });
    io.emit("sound", "heart");
  });

  // GIFT
  socket.on("gift", (amount) => {
    const val = Number(amount) || 1;

    gifts += val;
    coins += val * 10;

    io.emit("update", { hearts, gifts, coins });
    io.emit("fx", { type: "gift", power: val });
    io.emit("sound", "gift");
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
