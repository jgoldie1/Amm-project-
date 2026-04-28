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

  // INIT
  socket.emit("init", { hearts, gifts, coins });

  // CHAT + BOT
  socket.on("chat", (msg) => {
    io.emit("chat", msg);

    let reply = "";
    if (msg.toLowerCase().includes("/genz")) {
      reply = "no cap 🔥 that’s crazy fr";
    } else if (msg.toLowerCase().includes("/genx")) {
      reply = "back in my day 😎";
    } else {
      reply = "Bot: I see you 👀";
    }

    setTimeout(() => {
      io.emit("chat", reply);
    }, 800);
  });

  // HEART (tap power)
  socket.on("heart", () => {
    hearts++;
    coins += 1;

    io.emit("update", { hearts, gifts, coins });
    io.emit("fx", { type: "tap", power: hearts });
  });

  // GIFT (money)
  socket.on("gift", (amount) => {
    const value = amount || 1;

    gifts += value;
    coins += value * 10;

    io.emit("update", { hearts, gifts, coins });
    io.emit("fx", { type: "gift", power: value });
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
