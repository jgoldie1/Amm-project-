const express = require("express");
const multer = require("multer");
const fs = require("fs");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json());

// ensure uploads folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// serve static files
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// upload setup (MP4 only)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + ".mp4")
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "video/mp4") cb(null, true);
    else cb(new Error("Only MP4 allowed"), false);
  }
});

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

// socket (live system base)
io.on("connection", socket => {
  socket.on("join-room", room => {
    socket.join(room);
    socket.to(room).emit("user-joined", socket.id);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", socket.id);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on " + PORT);
});
