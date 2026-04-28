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

  socket.on("chat", (msg) => {
    io.emit("chat", msg);

    let reply = "Bot 👀";

    if (msg.toLowerCase().includes("/genz")) {
      reply = "no cap 🔥 that’s crazy fr";
    } else if (msg.toLowerCase().includes("/genx")) {
      reply = "back in my day 😎";
    }

    setTimeout(() => {
      io.emit("chat", reply);
    }, 500);
  });

  socket.on("heart", () => {
    hearts++;
    io.emit("update", { hearts, gifts, coins });
  });

  socket.on("gift", (n) => {
    gifts += n;
    coins += n * 10;

    io.emit("update", { hearts, gifts, coins });
    io.emit("boom", n);
  });

});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("RUNNING " + PORT);
});
