const express = require("express");
const app = express();

let hearts = 0;

app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:black;color:white;text-align:center;">

  <h1>TEST</h1>
  <h2>${hearts}</h2>

  <form method="POST" action="/tap">
    <button type="submit">TAP</button>
  </form>

  </body>
  </html>
  `);
});

app.post("/tap", (req, res) => {
  hearts++;
  res.redirect("/");
});

app.listen(process.env.PORT || 3000, () => console.log("RUNNING"));
app.get("/", (req, res) => {
  res.send("VERSION 2");
});
