const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 10000;

app.use(express.static("public"));

let hearts = 0;
let gifts = 0;

io.on("connection", (socket) => {
  console.log("User connected");

  socket.emit("update", { hearts, gifts });

  // CHAT + BOT
  socket.on("chat", (msg) => {
    io.emit("chat", msg);

    let reply = "";

    if (msg.toLowerCase().includes("/genz")) {
      reply = "no cap 🔥 that’s crazy fr fr";
    } else if (msg.toLowerCase().includes("/genx")) {
      reply = "Back in my day, things were different 😎";
    } else {
      reply = "Bot: I see you 👀";
    }

    setTimeout(() => {
      io.emit("chat", reply);
    }, 800);
  });

  // HEART
  socket.on("heart", () => {
    hearts++;
    io.emit("update", { hearts, gifts });
  });

  // GIFT
  socket.on("gift", (amount) => {
    gifts += amount || 1;
    io.emit("update", { hearts, gifts });
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on " + PORT);
});
