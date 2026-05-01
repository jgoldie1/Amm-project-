const express = require("express");
const app = express();

let hearts = 0;

// MAIN PAGE (ONLY ONE / ROUTE)
app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:black;color:white;text-align:center;">

  <h1>WORKING</h1>
  <h2>${hearts}</h2>

  <form method="POST" action="/tap">
    <button type="submit">TAP</button>
  </form>

  </body>
  </html>
  `);
});

// TAP
app.post("/tap", (req, res) => {
  hearts++;
  res.redirect("/");
});

// START SERVER
app.listen(process.env.PORT || 3000, () => console.log("RUNNING"));
