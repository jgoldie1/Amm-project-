const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let state = {
  hearts: 0,
  gifts: 0,
  users: {}
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // create simple profile
  state.users[socket.id] = {
    followers: Math.floor(Math.random() * 100)
  };

  // send full state
  socket.emit("init", state);

  socket.on("chat", (msg) => {
    io.emit("chat", msg);
  });

  socket.on("heart", () => {
    state.hearts++;
    io.emit("update", state);
  });

  socket.on("gift", () => {
    state.gifts++;
    io.emit("update", state);
    io.emit("giftFX"); // trigger animation + sound
  });

  socket.on("disconnect", () => {
    delete state.users[socket.id];
  });
});

server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
