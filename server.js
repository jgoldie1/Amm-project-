const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = {};
let hostId = null;
let likes = 0;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // JOIN
  socket.on("join", (name) => {
    users[socket.id] = name;

    if (!hostId) hostId = socket.id;

    io.emit("userList", users);
  });

  // CHAT
  socket.on("chat", (msg) => {
    const name = users[socket.id] || "User";
    io.emit("chat", `${name}: ${msg}`);
  });

  // LIKE
  socket.on("like", () => {
    likes++;
    io.emit("likes", likes);
  });

  // GIFT
  socket.on("gift", (data) => {
    io.emit("gift", data);
  });

  // HOST CONTROLS
  socket.on("muteUser", (id) => {
    io.to(id).emit("muted");
  });

  socket.on("kickUser", (id) => {
    io.to(id).emit("kicked");
    delete users[id];
    io.emit("userList", users);
  });

  // ROTATE SPEAKERS
  socket.on("rotate", () => {
    io.emit("rotateSpeakers");
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", users);
  });
});

http.listen(10000, () => {
  console.log("RUNNING ON PORT 10000");
});
