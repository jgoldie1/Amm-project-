let count = 0;

app.get('/count', (req, res) => {
  res.json({ count });
});

app.post('/increment', (req, res) => {
  count++;
  res.json({ count });
});
