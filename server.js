const express = require("express");
const http = require("http");
const fs = require("fs");
const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static("public"));

if (!fs.existsSync("data")) fs.mkdirSync("data");

const USERS = "data/users.json";
if (!fs.existsSync(USERS)) fs.writeFileSync(USERS, "[]");

function read() {
  return JSON.parse(fs.readFileSync(USERS));
}
function write(data) {
  fs.writeFileSync(USERS, JSON.stringify(data, null, 2));
}

/* REGISTER */
app.post("/register", (req, res) => {
  let users = read();

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
  write(users);

  res.json({ user });
});

/* LOGIN */
app.post("/login", (req, res) => {
  let users = read();

  const user = users.find(
    u => u.username === req.body.username &&
         u.password === req.body.password
  );

  res.json({ user });
});

/* GET PROFILE */
app.get("/profile/:id", (req, res) => {
  let users = read();
  const user = users.find(u => u.id == req.params.id);
  res.json(user);
});

/* FOLLOW */
app.post("/follow", (req, res) => {
  let users = read();

  const { me, target } = req.body;

  const meUser = users.find(u => u.id == me);
  const targetUser = users.find(u => u.id == target);

  if (!meUser.following.includes(target)) {
    meUser.following.push(target);
    targetUser.followers.push(me);
  }

  write(users);

  res.json({ ok: true });
});

/* UNFOLLOW */
app.post("/unfollow", (req, res) => {
  let users = read();

  const { me, target } = req.body;

  const meUser = users.find(u => u.id == me);
  const targetUser = users.find(u => u.id == target);

  meUser.following = meUser.following.filter(id => id != target);
  targetUser.followers = targetUser.followers.filter(id => id != me);

  write(users);

  res.json({ ok: true });
});

server.listen(3000, () => console.log("RUNNING"));
