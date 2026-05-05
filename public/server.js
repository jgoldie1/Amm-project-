const express = require('express');
const app = express();

let count = 0;

// homepage
app.get('/', (req, res) => {
  res.send(`
    <h1 id="count">0</h1>
    <button onclick="inc()">Tap</button>
    <script>
      async function load() {
        const res = await fetch('/count');
        const data = await res.json();
        document.getElementById('count').innerText = data.count;
      }
      async function inc() {
        await fetch('/increment');
        load();
      }
      load();
    </script>
  `);
});

// routes
app.get('/count', (req, res) => {
  res.json({ count });
});

app.get('/increment', (req, res) => {
  count++;
  res.json({ count });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('running');
});
