let mods = new Set();
let raisedHands = [];

socket.on("makeMod", (id) => {
  if (socket.id === host) mods.add(id);
});

socket.on("raiseHand", () => {
  raisedHands.push({
    id: socket.id,
    name: users[socket.id]
  });
  io.emit("handList", raisedHands);
});

socket.on("approveJoin", (id) => {
  if (socket.id === host || mods.has(socket.id)) {
    io.to(id).emit("approved");
  }
});

socket.on("chat", (msg) => {
  io.emit("chat", {
    id: socket.id,
    user: users[socket.id],
    text: msg
  });
});

socket.on("gift", (amount) => {
  io.emit("gift", {
    user: users[socket.id],
    amount: amount
  });
});

socket.on("muteUser", (id) => {
  if (socket.id === host || mods.has(socket.id)) {
    io.to(id).emit("muted");
  }
});

socket.on("unmuteUser", (id) => {
  if (socket.id === host || mods.has(socket.id)) {
    io.to(id).emit("unmuted");
  }
});
