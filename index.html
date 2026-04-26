const express = require("express");
const fs = require("fs");
const app = express();

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

/* ===== REGISTER ===== */
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

/* ===== LOGIN ===== */
app.post("/login", (req, res) => {
  const users = readUsers();

  const user = users.find(
    u => u.username === req.body.username &&
         u.password === req.body.password
  );

  res.json({ user });
});

/* ===== GET ALL USERS (IMPORTANT FIX) ===== */
app.get("/users", (req, res) => {
  const users = readUsers();
  res.json(users);
});

/* ===== FOLLOW ===== */
app.post("/follow", (req, res) => {
  const users = readUsers();
  const { me, target } = req.body;

  const meUser = users.find(u => u.id == me);
  const targetUser = users.find(u => u.id == target);

  if (!meUser || !targetUser) return res.json({ error: "User not found" });

  if (!meUser.following.includes(target)) {
    meUser.following.push(target);
    targetUser.followers.push(me);
  }

  writeUsers(users);
  res.json({ ok: true });
});

/* ===== START ===== */
app.listen(process.env.PORT || 3000, () => console.log("RUNNING"));
