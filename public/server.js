const express = require("express");
const app = express();
const http = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(http, {
  cors: { origin: "*" }
});

app.use(express.static("public"));

let count = 0;

io.on("connection", (socket) => {
  console.log("✅ CONNECTED");

  socket.emit("update", { count });

  socket.on("tap", () => {
    console.log("🔥 TAP RECEIVED");
    count++;
    io.emit("update", { count });
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("RUNNING", PORT));
