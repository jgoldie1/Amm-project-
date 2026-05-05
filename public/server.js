const express = require('express');
const app = express();

app.use(express.static(__dirname));

let count = 0;

app.get('/count', (req, res) => {
  res.json({ count });
});

app.get('/increment', (req, res) => {
  count++;
  res.json({ count });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running'));
