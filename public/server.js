const express = require("express");
const app = express();

app.use(express.json());

let data = {
  hearts: 0,
  gifts: 0,
  coins: 0
};

app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#111;color:#fff;text-align:center;">

  <h2>LIVE</h2>

  ❤️ <span id="hearts">${data.hearts}</span>
  🎁 <span id="gifts">${data.gifts}</span>
  💰 <span id="coins">${data.coins}</span>

  <br><br>

  <button onclick="tap()">🔥 TAP</button>
  <button onclick="gift()">🎁 GIFT</button>

  <script>
  async function tap(){
    await fetch('/heart', {method:'POST'});
    location.reload();
  }

  async function gift(){
    await fetch('/gift', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({n:1})
    });
    location.reload();
  }
  </script>

  </body>
  </html>
  `);
});

app.post("/heart", (req,res)=>{
  data.hearts++;
  res.sendStatus(200);
});

app.post("/gift", (req,res)=>{
  const n = Number(req.body.n)||1;
  data.gifts += n;
  data.coins += n * 10;
  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, ()=>console.log("RUNNING"));
