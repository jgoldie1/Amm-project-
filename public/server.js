const express = require('express');
const app = express();

const PORT = process.env.PORT || 10000;

let count = 0;

// test route (very important)
app.get('/', (req, res) => {
  res.send('WORKING');
});

app.get('/count', (req, res) => {
  res.json({ count });
});

app.get('/increment', (req, res) => {
  count++;
  res.json({ count });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on ' + PORT);
});
