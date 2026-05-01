const express = require("express");
const app = express();

let count = 0;

app.get("/", (req, res) => {
  res.send(`
    <html>
    <body style="background:black;color:white;text-align:center;">
      <h1>TAP TEST</h1>
      <h2 id="count">${count}</h2>
      <button onclick="tap()">TAP</button>

      <script>
        async function tap(){
          await fetch('/tap', { method: 'POST' });
          location.reload();
        }
      </script>
    </body>
    </html>
  `);
});

app.post("/tap", (req, res) => {
  count++;
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => console.log("RUNNING"));
