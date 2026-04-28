const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

let hearts = 0;
let gifts = 0;
let coins = 0;

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("user connected");

  // SEND CURRENT STATE
  socket.emit("update", { hearts, gifts, coins });

  // CHAT + BOT
  socket.on("chat", (msg) => {
    if (!msg) return;

    io.emit("chat", msg);

    let reply = "Bot 👀";

    if (msg.toLowerCase().includes("/genz")) {
      reply = "no cap 🔥";
    } else if (msg.toLowerCase().includes("/genx")) {
      reply = "old school 😎";
    }

    setTimeout(() => {
      io.emit("chat", reply);
    }, 500);
  });

  // HEART
  socket.on("heart", () => {
    hearts++;
    io.emit("update", { hearts, gifts, coins });
  });

  // GIFT
  socket.on("gift", (n) => {
    n = Number(n) || 0;
    gifts += n;
    coins += n * 10;
    io.emit("update", { hearts, gifts, coins });
  });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
  console.log("RUNNING ON " + PORT);
});
