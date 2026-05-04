const session = require('express-session');
const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

let taps = 0;
let gifts = 0;

app.get('/data', (req, res) => {
  res.json({ taps, gifts });
});

app.post('/tap', (req, res) => {
  taps++;
  res.json({ taps, gifts });
});

app.post('/gift', (req, res) => {
  gifts++;
  res.json({ taps, gifts });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>Counter</h1>

    <button onclick="tap()">Tap</button>
    <button onclick="gift()">Gift</button>

    <p>Taps: <span id="taps">0</span></p>
    <p>Gifts: <span id="gifts">0</span></p>

    <script>
      const BASE = window.location.origin;

      async function load() {
        const res = await fetch(BASE + '/data');
        const data = await res.json();
        document.getElementById('taps').innerText = data.taps;
        document.getElementById('gifts').innerText = data.gifts;
      }

      async function tap() {
        const res = await fetch(BASE + '/tap', { method: 'POST' });
        const data = await res.json();
        document.getElementById('taps').innerText = data.taps;
        document.getElementById('gifts').innerText = data.gifts;
      }

      async function gift() {
        const res = await fetch(BASE + '/gift', { method: 'POST' });
        const data = await res.json();
        document.getElementById('taps').innerText = data.taps;
        document.getElementById('gifts').innerText = data.gifts;
      }

      load();
    </script>
  `);
});

app.listen(3000, () => console.log('Server running'));
