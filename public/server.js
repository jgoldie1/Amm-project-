const express = require('express');
const app = express();

app.use(express.json());

let count = 0;

app.get('/count', (req, res) => {
  res.json({ count });
});

app.post('/increment', (req, res) => {
  count++;
  res.json({ count });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(3000, () => console.log('Server running'));
