<h1>LIVE NEW VERSION</h1>
console.log("VERSION 4 CLEAN");

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

let counter = 0;
let messages = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API
app.get("/api/state", (req, res) => {
  res.json({ counter, messages });
});

app.post("/api/counter/increment", (req, res) => {
  counter++;
  res.json({ counter });
});

app.post("/api/chat", (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "no text" });

  messages.push({ role: "user", content: text });

  let reply = "bot: ok";
  if (text.toLowerCase().includes("hello")) reply = "bot: hello";
  if (text.toLowerCase().includes("help")) reply = "bot: help ready";

  messages.push({ role: "bot", content: reply });

  messages = messages.slice(-20);

  res.json({ messages });
});

// FRONTEND LAST
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log("Server running on " + PORT));
