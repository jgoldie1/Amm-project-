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
  console.log("🔥 CONNECTED:", socket.id);

  // TEST EVENT (IMPORTANT)
  socket.emit("chat", "✅ server connected");

  socket.emit("update", { hearts, gifts, coins });

  socket.on("chat", (msg) => {
    console.log("CHAT:", msg);

    io.emit("chat", msg);

    let reply = "Bot 👀";
    if (msg && msg.toLowerCase().includes("/genz")) reply = "no cap 🔥";
    if (msg && msg.toLowerCase().includes("/genx")) reply = "old school 😎";

    setTimeout(() => io.emit("chat", reply), 500);
  });

  socket.on("heart", () => {
    console.log("HEART");
    hearts++;
    io.emit("update", { hearts, gifts, coins });
  });

  socket.on("gift", (n) => {
    console.log("GIFT:", n);

    n = Number(n) || 0;
    gifts += n;
    coins += n * 10;

    io.emit("update", { hearts, gifts, coins });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("🚀 RUNNING", PORT));
