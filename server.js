const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = {};

// SOCKET
io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;

    // send full list
    io.emit("userList", users);

    // tell others to auto-connect
    socket.broadcast.emit("new-user", socket.id);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", users);
    socket.broadcast.emit("user-disconnected", socket.id);
  });

  // WEBRTC SIGNAL
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
