const express = require("express");
const multer = require("multer");
const fs = require("fs");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json());
app.use(express.static("public"));

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
app.use("/uploads", express.static("uploads"));

// UPLOAD
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + ".mp4")
});
const upload = multer({ storage });

app.post("/upload", upload.single("video"), (req, res) => {
  res.json({ file: "/uploads/" + req.file.filename });
});

// FEED LIST
app.get("/videos", (req, res) => {
  const files = fs.readdirSync("uploads");
  res.json(files.map(f => "/uploads/" + f));
});

// SOCKET
io.on("connection", socket => {

  socket.on("join-room", room => {
    socket.join(room);
    socket.to(room).emit("user-joined", socket.id);
  });

  // 🔥 CHAT FIX
  socket.on("chat", data => {
    io.to(data.room).emit("chat", data);
  });

  // 🎁 GIFT FIX
  socket.on("gift", data => {
    io.to(data.room).emit("gift");
  });

  // SIGNAL
  socket.on("signal", data => {
    io.to(data.to).emit("signal", {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", socket.id);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("RUNNING"));
