require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

let counter = 0;
let messages = [];

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/state", (req, res) => {
  res.json({
    counter,
    messages
  });
});

app.post("/api/counter/increment", (req, res) => {
  counter++;
  res.json({ counter });
});

app.post("/api/chat", (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "no text" });

  messages.push({ role: "user", content: text });

  // simple bot
  let reply = "bot: ok";
  if (text.toLowerCase().includes("hello")) reply = "bot: hello";
  if (text.toLowerCase().includes("help")) reply = "bot: help ready";

  messages.push({ role: "bot", content: reply });

  // keep last 20
  messages = messages.slice(-20);

  res.json({ messages });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log("Server running on " + PORT));
