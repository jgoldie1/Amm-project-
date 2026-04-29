const express = require("express");
const app = express();

app.use(express.json());

let data = {
  hearts: 0,
  gifts: 0,
  coins: 0,
  chat: []
};

app.get("/", (req, res) => {
  res.send(`
  <html>
  <body style="background:#111;color:#fff;text-align:center;">

  <h2>LIVE</h2>

  ❤️ <span>${data.hearts}</span>
  🎁 <span>${data.gifts}</span>
  💰 <span>${data.coins}</span>

  <br><br>

  <button onclick="tap()">🔥 TAP</button>
  <button onclick="gift()">🎁 GIFT</button>

  <br><br>

  <input id="msg">
  <button onclick="send()">Send</button>

  <div id="chat"></div>

  <script>
  async function tap(){
    await fetch('/heart',{method:'POST'});
    location.reload();
  }

  async function gift(){
    await fetch('/gift',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({n:1})
    });
    location.reload();
  }

  async function send(){
    const i = document.getElementById('msg');
    if(!i.value) return;

    await fetch('/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({msg:i.value})
    });

    location.reload();
  }
  </script>

  ${
    data.chat.slice(-10).map(m => `<div>${m}</div>`).join("")
  }

  </body>
  </html>
  `);
});

app.post("/heart",(req,res)=>{
  data.hearts++;
  res.sendStatus(200);
});

app.post("/gift",(req,res)=>{
  const n = Number(req.body.n)||1;
  data.gifts += n;
  data.coins += n*10;
  res.sendStatus(200);
});

app.post("/chat",(req,res)=>{
  const msg = req.body.msg;
  if(!msg) return res.sendStatus(200);

  data.chat.push(msg);

  if(msg.toLowerCase().includes("/genz")){
    data.chat.push("no cap 🔥");
  }
  if(msg.toLowerCase().includes("/genx")){
    data.chat.push("old school 😎");
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT||3000,()=>console.log("RUNNING"));
