const express = require("express");
const http = require("http");
const fs = require("fs");
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static("public"));

/* ===== SETUP ===== */
if (!fs.existsSync("data")) fs.mkdirSync("data");

const USERS_FILE = "data/users.json";
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");

function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}
function writeUsers(data) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(data, null, 2));
}

/* ===== AUTH ===== */
app.post("/register", (req, res) => {
  const users = readUsers();

  if (users.find(u => u.username === req.body.username)) {
    return res.json({ error: "User exists" });
  }

  const user = {
    id: Date.now(),
    username: req.body.username,
    password: req.body.password,
    followers: [],
    following: []
  };

  users.push(user);
  writeUsers(users);

  res.json({ user });
});

app.post("/login", (req, res) => {
  const users = readUsers();

  const user = users.find(
    u => u.username === req.body.username &&
         u.password === req.body.password
  );

  res.json({ user });
});

/* ===== PROFILE ===== */
app.get("/profile/:id", (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id == req.params.id);
  res.json(user);
});

/* ===== FOLLOW ===== */
app.post("/follow", (req, res) => {
  const users = readUsers();

  const { me, target } = req.body;

  const meUser = users.find(u => u.id == me);
  const targetUser = users.find(u => u.id == target);

  if (!meUser.following.includes(target)) {
    meUser.following.push(target);
    targetUser.followers.push(me);
  }

  writeUsers(users);

  res.json({ ok: true });
});

app.post("/unfollow", (req, res) => {
  const users = readUsers();

  const { me, target } = req.body;

  const meUser = users.find(u => u.id == me);
  const targetUser = users.find(u => u.id == target);

  meUser.following = meUser.following.filter(id => id != target);
  targetUser.followers = targetUser.followers.filter(id => id != me);

  writeUsers(users);

  res.json({ ok: true });
});

/* ===== START ===== */
server.listen(process.env.PORT || 3000, () => console.log("RUNNING"));
