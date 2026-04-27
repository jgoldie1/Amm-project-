const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

let users = {};
let giftTotal = 0;

// SABBATH LOCK (6pm–next day)
function isSabbath() {
  const hour = new Date().getHours();
  return hour >= 18; // adjust later if needed
}

io.on("connection", (socket) => {

  socket.on("join", (name) => {
    users[socket.id] = name;
    io.emit("userList", users);
  });

  socket.on("chat", (data) => {
    if (isSabbath()) return; // LOCK
    io.emit("chat", data);
  });

  socket.on("gift", (data) => {
    if (isSabbath()) return; // LOCK

    giftTotal += data.amount;

    io.emit("gift", {
      user: data.user,
      amount: data.amount,
      total: giftTotal
    });
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", users);
  });

});

http.listen(10000, () => console.log("RUNNING ON PORT 10000"));
