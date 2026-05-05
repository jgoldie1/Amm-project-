const express = require('express');
const app = express();

let count = 0;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('WORKING');
});

app.get('/count', (req, res) => {
  res.json({ count });
});

// 👇 IMPORTANT: support BOTH GET + POST (fixes your issue)
app.get('/increment', (req, res) => {
  count++;
  res.json({ count });
});

app.post('/increment', (req, res) => {
  count++;
  res.json({ count });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on ' + PORT);
});
