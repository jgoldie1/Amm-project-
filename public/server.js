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

  socket.on("chat", (msg) => {
    if (!msg) return;

    io.emit("chat", { text: msg });

    let reply = "👀 bot";
    if (msg.includes("/genz")) reply = "no cap 🔥";
    if (msg.includes("/genx")) reply = "old school 😎";

    setTimeout(() => {
      io.emit("chat", { text: reply });
    }, 600);
  });

  socket.on("heart", () => {
    hearts++;
    coins++;
    io.emit("update", { hearts, gifts, coins });
    io.emit("fx", { type:"heart" });
  });

  socket.on("gift", (n) => {
    n = Number(n) || 1;
    gifts += n;
    coins += n * 10;
    io.emit("update", { hearts, gifts, coins });
    io.emit("fx", { type:"gift" });
  });

});

server.listen(process.env.PORT || 10000, "0.0.0.0");
