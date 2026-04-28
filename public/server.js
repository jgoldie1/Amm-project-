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
  console.log("CONNECTED");

  socket.emit("update", { hearts, gifts, coins });

  socket.on("chat", (msg) => {
    if (!msg) return;

    io.emit("chat", msg);

    let reply = null;

    if (msg.toLowerCase().includes("/genz")) reply = "no cap 🔥";
    if (msg.toLowerCase().includes("/genx")) reply = "old school 😎";

    if (reply) {
      setTimeout(() => io.emit("chat", reply), 500);
    }
  });

  socket.on("heart", () => {
    hearts++;
    io.emit("update", { hearts, gifts, coins });
  });

  socket.on("gift", (n) => {
    n = Number(n) || 0;
    gifts += n;
    coins += n * 10;
    io.emit("update", { hearts, gifts, coins });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("RUNNING", PORT));
