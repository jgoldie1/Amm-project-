const http = require("http").createServer(app);
const io = require("socket.io")(http);

io.on("connection", socket => {
  socket.on("join-room", room => {
    socket.join(room);
    socket.to(room).emit("user-joined", socket.id);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", socket.id);
  });
});

http.listen(PORT);
