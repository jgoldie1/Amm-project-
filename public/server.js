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

  socket.emit("init", { hearts, gifts, coins });

  // CHAT + BOT
  socket.on("chat", (msg) => {
    if (!msg) return;

    // ALWAYS send object (fix undefined)
    io.emit("chat", { text: msg });

    let reply = "👀 bot";
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

    let power = 5;
    if (hearts > 250) power = 10;
    if (hearts > 500) power = 20;
    if (hearts > 1000) power = 30;

    io.emit("fx", { type: "heart", power });
  });

  // GIFT
  socket.on("gift", (n) => {
    const val = Number(n) || 1;

    gifts += val;
    coins += val * 10;

    io.emit("update", { hearts, gifts, coins });

    let power = 10;
    if (val >= 10) power = 20;
    if (val >= 100) power = 30;

    io.emit("fx", { type: "gift", power });
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("RUNNING");
});
