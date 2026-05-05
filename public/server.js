const express = require('express');
const app = express();

let count = 0;

// 👇 THIS IS THE FIX
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/count', (req, res) => {
  res.json({ count });
});

app.get('/increment', (req, res) => {
  count++;
  res.json({ count });
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
