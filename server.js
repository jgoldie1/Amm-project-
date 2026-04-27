const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("chat", (msg) => {

    if (!msg || typeof msg !== "string") return;

    // ✅ ALWAYS send SAME FORMAT
    io.emit("chat", {
      user: "user",
      text: msg
    });

    // ✅ BOT ALWAYS
    io.emit("chat", {
      user: "🤖 bot",
      text: "WORKING"
    });
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
