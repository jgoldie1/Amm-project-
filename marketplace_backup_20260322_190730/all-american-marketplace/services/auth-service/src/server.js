require("dotenv").config({ path: require("path").resolve(__dirname, "../../../.env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 4100;
const JWT_SECRET = process.env.JWT_SECRET || "change_me";

const dataDir = path.resolve(__dirname, "../../../data");
const usersFile = path.join(dataDir, "users.json");

function ensureUsersFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "[]", "utf8");
}

function readUsers() {
  ensureUsersFile();
  return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

function writeUsers(users) {
  ensureUsersFile();
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), "utf8");
}

function nextId(items) {
  if (!items.length) return 1;
  return Math.max(...items.map(x => Number(x.id) || 0)) + 1;
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, error: "missing token" });
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "invalid token" });
  }
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "auth-service",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.post("/register", async (req, res) => {
  const { name, email, password, role = "rider", phone = "" } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, error: "name, email, password required" });
  }

  const users = readUsers();
  const exists = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (exists) {
    return res.status(409).json({ ok: false, error: "email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: nextId(users),
    name,
    email,
    phone,
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  res.status(201).json({ ok: true, user: sanitizeUser(user) });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === String(email || "").toLowerCase());

  if (!user) return res.status(401).json({ ok: false, error: "invalid credentials" });

  const valid = await bcrypt.compare(password || "", user.passwordHash);
  if (!valid) return res.status(401).json({ ok: false, error: "invalid credentials" });

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ ok: true, token, user: sanitizeUser(user) });
});

app.get("/me", authMiddleware, (req, res) => {
  const users = readUsers();
  const user = users.find(u => Number(u.id) === Number(req.user.sub));
  if (!user) return res.status(404).json({ ok: false, error: "user not found" });
  res.json({ ok: true, user: sanitizeUser(user) });
});

app.get("/users", (_req, res) => {
  const users = readUsers().map(sanitizeUser);
  res.json({ ok: true, users });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on http://127.0.0.1:${PORT}`);
});
