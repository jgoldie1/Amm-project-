const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("chat", (msg) => {
    console.log("SERVER RECEIVED:", msg);

    // SEND BACK EXACTLY WHAT WAS SENT
    io.emit("chat", msg);
  });

});

server.listen(process.env.PORT || 10000, () => {
  console.log("SERVER RUNNING");
});
