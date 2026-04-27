const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let users = {};
let host = null;
let mods = new Set();
let raisedHands = [];

io.on("connection", (socket) => {

  // JOIN
  socket.on("join", (username) => {
    users[socket.id] = username;

    if (!host) host = socket.id;

    io.emit("userList", users);
  });

  // CHAT
  socket.on("chat", (msg) => {
    io.emit("chat", {
      user: users[socket.id],
      text: msg
    });
  });

  // GIFTS
  socket.on("gift", (amount) => {
    io.emit("gift", {
      user: users[socket.id],
      amount: amount
    });
  });

  // RAISE HAND
  socket.on("raiseHand", () => {
    raisedHands.push({
      id: socket.id,
      name: users[socket.id]
    });
    io.emit("handList", raisedHands);
  });

  // APPROVE JOIN
  socket.on("approveJoin", (id) => {
    if (socket.id === host || mods.has(socket.id)) {
      io.to(id).emit("approved");
    }
  });

  // MOD SYSTEM
  socket.on("makeMod", (id) => {
    if (socket.id === host) mods.add(id);
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

  // DISCONNECT
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", users);
  });
});

http.listen(10000, () => {
  console.log("RUNNING ON PORT 10000");
});
let hashtags = {};

socket.on("chat", (msg) => {
  if (!msg) return;

  const data = {
    user: users[socket.id] || "anon",
    text: msg
  };

  io.emit("chat", data);

  // hashtags
  const tags = msg.match(/#\w+/g);
  if (tags) {
    tags.forEach(tag => {
      if (!hashtags[tag]) hashtags[tag] = 0;
      hashtags[tag]++;
    });

    io.emit("trending", hashtags);
  }

  // BOT (SERVER SIDE — WORKS NOW)
  if (Math.random() < 0.5) {
    setTimeout(() => {
      io.emit("chat", {
        user: "AI_Bot",
        text: `${data.user} 🔥 that's fire`
      });
    }, 1200);
  }
});
