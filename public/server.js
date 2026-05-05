const express = require('express');
const app = express();

let count = 0;

app.use(express.static('public'));

app.get('/count', (req, res) => {
  res.json({ count });
});

app.get('/increment', (req, res) => {
  count++;
  res.json({ count });
});

app.listen(3000, () => console.log('Server running'));
