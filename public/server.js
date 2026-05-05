const express = require('express');
const app = express();

app.use(express.json());

let count = 0;

// GET count
app.get('/count', (req, res) => {
  res.json({ count });
});

// POST increment
app.post('/increment', (req, res) => {
  count++;
  res.json({ count });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on ' + PORT));
