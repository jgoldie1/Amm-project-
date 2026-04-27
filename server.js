const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = {};

// SOCKET CONNECTION
io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("userList", users);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", users);
    socket.broadcast.emit("user-disconnected", socket.id);
  });

  // SIGNALING FOR WEBRTC
  socket.on("signal", (data) => {
    io.to(data.to).emit("signal", {
      from: socket.id,
      signal: data.signal
    });
  });

});

http.listen(10000, () => {
  console.log("RUNNING ON PORT 10000");
});
