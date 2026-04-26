const express = require("express");
const http = require("http");
const fs = require("fs");
const multer = require("multer");
const { AccessToken } = require("livekit-server-sdk");

const app = express();
const server = http.createServer(app);

app.use(express.json());

// ===== FILE SETUP =====
if (!fs.existsSync("data")) fs.mkdirSync("data");
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const USERS = "data/users.json";
const STREAMS = "data/streams.json";

if (!fs.existsSync(USERS)) fs.writeFileSync(USERS, "[]");
if (!fs.existsSync(STREAMS)) fs.writeFileSync(STREAMS, "[]");

const read = f => JSON.parse(fs.readFileSync(f));
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

// ===== STATIC =====
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// ===== AUTH =====
app.post("/register", (req, res) => {
  const users = read(USERS);
  if (users.find(u => u.username === req.body.username)) {
    return res.json({ error: "User exists" });
  }
  users.push({ ...req.body, followers: [], following: [] });
  write(USERS, users);
  res.json({ ok: true });
});

app.post("/login", (req, res) => {
  const users = read(USERS);
  const user = users.find(
    u =>
      u.username === req.body.username &&
      u.password === req.body.password
  );
  res.json({ user });
});

// ===== FOLLOW =====
app.post("/follow", (req, res) => {
  const { me, target } = req.body;
  const users = read(USERS);

  const u1 = users.find(u => u.username === me);
  const u2 = users.find(u => u.username === target);

  if (!u1.following.includes(target)) u1.following.push(target);
  if (!u2.followers.includes(me)) u2.followers.push(me);

  write(USERS, users);
  res.json({ ok: true });
});

// ===== USER LIST =====
app.get("/users", (req, res) => {
  res.json(read(USERS));
});

// ===== UPLOAD VIDEO =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + ".mp4")
});
const upload = multer({ storage });

app.post("/upload", upload.single("video"), (req, res) => {
  const streams = read(STREAMS);
  const newVid = {
    file: "/uploads/" + req.file.filename,
    user: req.body.user,
    time: Date.now()
  };
  streams.unshift(newVid);
  write(STREAMS, streams);
  res.json(newVid);
});

// ===== FEED =====
app.get("/feed", (req, res) => {
  res.json(read(STREAMS));
});

// ===== LIVEKIT TOKEN =====
const LIVEKIT_API_KEY = "YOUR_API_KEY";
const LIVEKIT_SECRET = "YOUR_SECRET";

app.get("/get-token", (req, res) => {
  const { username, room } = req.query;

  const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_SECRET, {
    identity: username
  });

  at.addGrant({
    roomJoin: true,
    room,
    canPublish: true,
    canSubscribe: true
  });

  res.json({ token: at.toJwt() });
});

server.listen(process.env.PORT || 3000, () =>
  console.log("RUNNING")
);
