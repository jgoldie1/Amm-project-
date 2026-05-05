const express = require('express');
const app = express();

let count = 0;

app.use(express.json());
app.use(express.static('public'));

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
app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running');
});
