require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// TEST ROUTE (IMPORTANT)
app.get('/api/state', (req, res) => {
  res.json({ counter: 0, messages: [] });
});

// TAP TEST
app.post('/api/counter/increment', (req, res) => {
  res.json({ counter: Math.floor(Math.random() * 100) });
});

// CHAT TEST
app.post('/api/chat', (req, res) => {
  res.json({
    messages: [
      { role: "user", content: "test" },
      { role: "bot", content: "bot: ok" }
    ]
  });
});

// FRONTEND
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
