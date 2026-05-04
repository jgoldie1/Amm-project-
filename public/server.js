const express = require('express');
const app = express();

app.use(express.json());

let count = 0;

// ROOT
app.get('/', (req, res) => {
  res.send('OK');
});

// COUNT
app.get('/count', (req, res) => {
  res.json({ count });
});

// INCREMENT
app.post('/increment', (req, res) => {
  count++;
  res.json({ count });
});

// FORCE BIND (important for Render)
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('running on ' + PORT);
});
