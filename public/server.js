const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

app.use(express.static("public"));

let hearts = 0;
let gifts = 0;
let coins = 0;

io.on("connection", (socket) => {
  console.log("USER CONNECTED");

  // send current state
  socket.emit("update", { hearts, gifts, coins });

  // CHAT
  socket.on("chat", (msg) => {
    console.log("CHAT:", msg);

    if (!msg) return;

    io.emit("chat", msg);

    let reply = null;
    if (msg.toLowerCase().includes("/genz")) reply = "no cap 🔥";
    if (msg.toLowerCase().includes("/genx")) reply = "old school 😎";

    if (reply) {
      setTimeout(() => io.emit("chat", reply), 500);
    }
  });

  // HEART / TAP
  socket.on("heart", () => {
    console.log("HEART CLICK");
    hearts++;
    io.emit("update", { hearts, gifts, coins });
  });

  // GIFT
  socket.on("gift", (n) => {
    console.log("GIFT:", n);

    n = Number(n) || 0;
    gifts += n;
    coins += n * 10;

    io.emit("update", { hearts, gifts, coins });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("RUNNING ON", PORT));
