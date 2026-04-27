const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = {};
let hashtags = {};

// CONNECTION
io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  // JOIN
  socket.on("join", (username) => {
    users[socket.id] = username;
    io.emit("userList", users);
  });

  // CHAT (FIXED — INSIDE CONNECTION)
  socket.on("chat", (msg) => {
    if (!msg) return;

    const data = {
      user: users[socket.id] || "anon",
      text: msg
    };

    io.emit("chat", data);

    // HASHTAGS
    const tags = msg.match(/#\w+/g);
    if (tags) {
      tags.forEach(tag => {
        if (!hashtags[tag]) hashtags[tag] = 0;
        hashtags[tag]++;
      });

      io.emit("trending", hashtags);
    }

    // BOT RESPONSE
    if (Math.random() < 0.5) {
      setTimeout(() => {
        io.emit("chat", {
          user: "AI_Bot",
          text: `${data.user} 🔥 that's fire`
        });
      }, 1200);
    }
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    delete users[socket.id];
    io.emit("userList", users);
    console.log("User disconnected:", socket.id);
  });

});

server.listen(10000, () => {
  console.log("RUNNING ON PORT 10000");
});
