const express = require('express');
const app = express();

app.use(express.static(__dirname));

let count = 0;

app.get('/count', (req, res) => {
  res.json({ count });
});

// 🔴 THIS WAS MISSING OR WRONG
app.get('/increment', (req, res) => {
  count = count + 1;
  res.json({ count });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running'));
