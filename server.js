io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("join-room", room => {
    socket.join(room);
    console.log(socket.id + " joined " + room);

    socket.to(room).emit("user-joined", socket.id);
  });

  socket.on("signal", data => {
    socket.to(data.to).emit("signal", {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    socket.broadcast.emit("user-left", socket.id);
  });
});
