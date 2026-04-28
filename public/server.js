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

  // SEND INITIAL DATA
  socket.emit("init", { hearts, gifts, coins });

  // CHAT + BOT (FIXED)
  socket.on("chat", (msg) => {
    if (!msg) return;

    // ALWAYS OBJECT (fix undefined)
    io.emit("chat", { text: msg });

    let reply = "👀 bot here";
    if (msg.toLowerCase().includes("/genz")) reply = "no cap 🔥";
    if (msg.toLowerCase().includes("/genx")) reply = "back in my day 😎";

    setTimeout(() => {
      io.emit("chat", { text: reply });
    }, 500);
  });

  // HEART
  socket.on("heart", () => {
    hearts++;
    coins++;

    io.emit("update", { hearts, gifts, coins });

    io.emit("fx", { type: "heart", power: hearts > 500 ? 20 : 5 });
  });

  // GIFT
  socket.on("gift", (n) => {
    const val = Number(n) || 1;

    gifts += val;
    coins += val * 10;

    io.emit("update", { hearts, gifts, coins });

    io.emit("fx", { type: "gift", power: val >= 10 ? 20 : 10 });
  });

});

server.listen(process.env.PORT || 10000);
