const express = require("express");
const http = require("http");
const multer = require("multer");
const fs = require("fs");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json());

// ensure uploads folder
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// static
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// upload system (MP4)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + ".mp4")
});
const upload = multer({ storage });

app.post("/upload", upload.single("video"), (req, res) => {
  res.json({ file: "/uploads/" + req.file.filename });
});

// =====================
// LIVE SYSTEM
// =====================
let rooms = {};

io.on("connection", socket => {
  console.log("User:", socket.id);

  socket.on("join-room", room => {
    socket.join(room);

    if (!rooms[room]) {
      rooms[room] = { host: socket.id, users: [] };
    }

    rooms[room].users.push(socket.id);

    io.to(room).emit("room-data", rooms[room]);
    socket.to(room).emit("user-joined", socket.id);
  });

  // SIGNALING
  socket.on("signal", data => {
    io.to(data.to).emit("signal", {
      from: socket.id,
      signal: data.signal
    });
  });

  // CHAT
  socket.on("chat", data => {
    io.emit("chat", data);
  });

  // ❤️ LIKE
  socket.on("like", () => {
    io.emit("like");
  });

  // 🎁 GIFT
  socket.on("gift", () => {
    io.emit("gift");
  });

  // 🙋 REQUEST JOIN
  socket.on("request-join", room => {
    const host = rooms[room]?.host;
    if (host) io.to(host).emit("join-request", socket.id);
  });

  socket.on("approve-join", id => {
    io.to(id).emit("approved");
  });

  // 🚫 KICK
  socket.on("kick", id => {
    io.to(id).emit("kicked");
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("RUNNING"));
