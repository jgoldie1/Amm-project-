const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = {};
let host = null;

// CONNECTION
io.on("connection", (socket) => {

  socket.on("join", (username) => {
    users[socket.id] = username;

    // first user = host
    if (!host) host = socket.id;

    io.emit("userList", users);
    socket.broadcast.emit("new-user", socket.id);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];

    if (socket.id === host) {
      host = Object.keys(users)[0] || null;
    }

    io.emit("userList", users);
    socket.broadcast.emit("user-disconnected", socket.id);
  });

  // SIGNAL
  socket.on("signal", (data) => {
    io.to(data.to).emit("signal", {
      from: socket.id,
      signal: data.signal
    });
  });

  // HOST CONTROLS
  socket.on("kickUser", (id) => {
    if (socket.id === host) {
      io.to(id).emit("kicked");
      io.sockets.sockets.get(id)?.disconnect();
    }
  });

});

http.listen(10000, () => {
  console.log("RUNNING ON PORT 10000");
});
