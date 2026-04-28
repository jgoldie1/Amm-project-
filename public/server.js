const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let data = {
  hearts: 0,
  gifts: 0,
  coins: 0,
  chat: []
};

// GET DATA
app.get("/data", (req, res) => {
  res.json(data);
});

// TAP / HEART
app.post("/heart", (req, res) => {
  data.hearts++;
  res.json(data);
});

// GIFT
app.post("/gift", (req, res) => {
  const n = Number(req.body.n) || 0;
  data.gifts += n;
  data.coins += n * 10;
  res.json(data);
});

// CHAT
app.post("/chat", (req, res) => {
  const msg = req.body.msg;
  if (!msg) return res.json(data);

  data.chat.push(msg);

  if (msg.toLowerCase().includes("/genz")) {
    data.chat.push("no cap 🔥");
  }
  if (msg.toLowerCase().includes("/genx")) {
    data.chat.push("old school 😎");
  }

  res.json(data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("RUNNING", PORT));
