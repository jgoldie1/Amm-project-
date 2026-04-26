const express = require("express");
const multer = require("multer");
const fs = require("fs");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server); // ✅ FIX

app.use(express.json());

// ensure uploads folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// serve static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + ".mp4")
});

const upload = multer({ storage });

// upload route
app.post("/upload", upload.single("video"), (req, res) => {
  res.json({ file: "/uploads/" + req.file.filename });
});

// videos
app.get("/videos", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) return res.json([]);
    res.json(files.map(f => "/uploads/" + f));
  });
});

// comments + likes
let comments = {};
let likes = {};

app.post("/comment", (req, res) => {
  const { video, text } = req.body;
  if (!comments[video]) comments[video] = [];
  comments[video].push(text);
  res.json({ success: true });
});

app.get("/comments", (req, res) => res.json(comments));

app.post("/like", (req, res) => {
  const { video } = req.body;
  if (!likes[video]) likes[video] = 0;
  likes[video]++;
  res.json({ likes: likes[video] });
});

app.get("/likes", (req, res) => res.json(likes));

/* ===== SOCKET.IO ===== */
io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("join-room", room => {
    socket.join(room);
    socket.to(room).emit("user-joined", socket.id);
  });

  socket.on("signal", data => {
    io.to(data.to).emit("signal", {
      from: socket.id,
      signal: data.signal
    });
  });

  socket.on("request-join", room => {
    socket.to(room).emit("join-request", socket.id);
  });

  socket.on("approve-user", data => {
    io.to(data.userId).emit("approved");
  });

  socket.on("kick-user", id => {
    io.to(id).emit("kicked");
  });

  socket.on("chat", data => {
    io.to(data.room).emit("chat", data);
  });

  socket.on("gift", data => {
    io.to(data.room).emit("gift", data);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
