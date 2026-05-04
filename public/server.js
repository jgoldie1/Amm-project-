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
  res.send(`
    <h1>Counter</h1>
    <button onclick="inc()">Tap</button>
    <p id="count">0</p>

    <script>
      async function load() {
        const res = await fetch('/count');
        const data = await res.json();
        document.getElementById('count').innerText = data.count;
      }

      async function inc() {
        const res = await fetch('/increment', { method: 'POST' });
        const data = await res.json();
        document.getElementById('count').innerText = data.count;
      }

      load();
    </script>
  `);
});

app.listen(3000, () => console.log('running'));
