const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const db = new Low(new JSONFile("db.json"), { hearts: 0, gifts: 0 });
async function initDB() {
  await db.read();
  db.data ||= { hearts: 0, gifts: 0 };
}
initDB();

io.on("connection", async (socket) => {
  await db.read();

  socket.emit("init", db.data);

  socket.on("chat", (msg) => io.emit("chat", msg));

  socket.on("heart", async () => {
    db.data.hearts++;
    await db.write();
    io.emit("update", db.data);
  });

  socket.on("gift", async () => {
    db.data.gifts++;
    await db.write();
    io.emit("update", db.data);
    io.emit("explode");
  });
});

server.listen(10000, () => console.log("Server running"));
