const express = require("express");
const http = require("http");
const fs = require("fs");
const multer = require("multer");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json());

// ===== FILE SYSTEM SETUP =====
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("data")) fs.mkdirSync("data");

// simple DB files
const USERS_FILE = "data/users.json";
const STREAMS_FILE = "data/streams.json";

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
if (!fs.existsSync(STREAMS_FILE)) fs.writeFileSync(STREAMS_FILE, "[]");

function read(file) {
  return JSON.parse(fs.readFileSync(file));
}
function write(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ===== STATIC =====
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// ===== AUTH (BASIC) =====
app.post("/register", (req, res) => {
  const users = read(USERS_FILE);
  users.push(req.body);
  write(USERS_FILE, users);
  res.json({ ok: true });
});

app.post("/login", (req, res) => {
  const users = read(USERS_FILE);
  const user = users.find(
    u => u.username === req.body.username && u.password === req.body.password
  );
  res.json({ user });
});

// ===== UPLOAD STREAM =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + ".mp4")
});
const upload = multer({ storage });

app.post("/upload", upload.single("video"), (req, res) => {
  const streams = read(STREAMS_FILE);

  const newStream = {
    file: "/uploads/" + req.file.filename,
    user: req.body.user || "anon",
    time: Date.now()
  };

  streams.unshift(newStream);
  write(STREAMS_FILE, streams);

  res.json(newStream);
});

// ===== FEED =====
app.get("/feed", (req, res) => {
  const streams = read(STREAMS_FILE);
  res.json(streams);
});

// ===== SOCKET =====
io.on("connection", socket => {
  socket.on("chat", msg => io.emit("chat", msg));
  socket.on("like", () => io.emit("like"));
  socket.on("gift", () => io.emit("gift"));
});

server.listen(process.env.PORT || 3000, () => console.log("RUNNING"));
