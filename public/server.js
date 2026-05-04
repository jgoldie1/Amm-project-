const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

let count = 0;

app.get('/count', (req, res) => {
  res.json({ count });
});

app.post('/increment', (req, res) => {
  count++;
  console.log("increment:", count);
  res.json({ count });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on ' + PORT));
