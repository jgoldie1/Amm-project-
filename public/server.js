const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

let count = 0;

// ROOT TEST
app.get('/', (req, res) => {
  res.send('OK');
});

// COUNT ROUTE (this is missing right now)
app.get('/count', (req, res) => {
  res.json({ count });
});

// INCREMENT ROUTE
app.get('/increment', (req, res) => {
  count++;
  res.json({ count });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running');
});
