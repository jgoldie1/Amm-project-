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

  // CHAT
  socket.on("chat", (msg) => {
    io.emit("chat", msg);

    let reply = "";
    if (msg.toLowerCase().includes("/genz")) {
      reply = "no cap 🔥 that’s crazy fr fr";
    } else if (msg.toLowerCase().includes("/genx")) {
      reply = "Back in my day 😎";
    } else {
      reply = "Bot 👀";
    }

    setTimeout(() => {
      io.emit("chat", reply);
    }, 800);
  });

  // HEART TAP
  socket.on("heart", () => {
    hearts++;
    io.emit("update", { hearts, gifts, coins });
  });

  // GIFT
  socket.on("gift", (n) => {
    gifts += n;
    coins += n * 10;
    io.emit("update", { hearts, gifts, coins });

    // explosion trigger
    io.emit("boom", n);
  });

});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("RUNNING " + PORT);
});
