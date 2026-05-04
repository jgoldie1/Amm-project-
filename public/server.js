const express = require('express');
const app = express();

app.use(express.json());

let count = 0;

// TEST ROUTE (important)
app.get('/', (req, res) => {
  res.send('server alive');
});

// COUNT ROUTE
app.get('/count', (req, res) => {
  res.json({ count });
});

// INCREMENT
app.post('/increment', (req, res) => {
  count++;
  res.json({ count });
});

// REQUIRED FOR RENDER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('running on ' + PORT));
