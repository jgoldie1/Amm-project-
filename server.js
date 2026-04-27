const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("chat", (msg) => {
    console.log("MSG:", msg);

    // ✅ ALWAYS send simple string
    io.emit("chat", String(msg));

    // ✅ ALWAYS send bot string
    io.emit("chat", "BOT: WORKING");
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
