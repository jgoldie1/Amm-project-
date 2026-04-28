const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ SERVE public folder
app.use(express.static("public"));

// ✅ SOCKET
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("chat", (msg) => {
    if (!msg) return;

    // send user message
    io.emit("chat", msg);

    // bot response
    io.emit("chat", "BOT: working");
  });
});

// ✅ START
server.listen(process.env.PORT || 10000, () => {
  console.log("Server running");
});
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  socket.on("chat", (msg) => {
    if (!msg) return;

    io.emit("chat", msg);
    io.emit("chat", "BOT: working");
  });
});

server.listen(process.env.PORT || 10000);
