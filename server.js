const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("chat", (msg) => {
    if (!msg) return;

    // ALWAYS send STRING ONLY (no object)
    io.emit("chat", msg);
  });

});

server.listen(10000, () => {
  console.log("RUNNING");
});
