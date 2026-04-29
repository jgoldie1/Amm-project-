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
<!DOCTYPE html>
<html>
<body style="background:#111;color:#fff;text-align:center;">

<h2>LIVE</h2>

<div>
❤️ <span id="hearts">0</span>
🎁 <span id="gifts">0</span>
💰 <span id="coins">0</span>
</div>

<br>

<button onclick="tap()">🔥 TAP</button>
<button onclick="gift()">🎁 GIFT</button>

<br><br>

<input id="msg" placeholder="type">
<button onclick="send()">Send</button>

<div id="chat"></div>

<script>
async function load(){
  const res = await fetch('/data');
  const d = await res.json();

  document.getElementById('hearts').innerText = d.hearts;
  document.getElementById('gifts').innerText = d.gifts;
  document.getElementById('coins').innerText = d.coins;

  const chat = document.getElementById('chat');
  chat.innerHTML = '';
  d.chat.slice(-10).forEach(m=>{
    const div = document.createElement('div');
    div.innerText = m;
    chat.appendChild(div);
  });
}

async function tap(){
  await fetch('/heart',{method:'POST'});
  load();
}

async function gift(){
  await fetch('/gift',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({n:1})
  });
  load();
}

async function send(){
  const i = document.getElementById('msg');
  if(!i.value) return;

  await fetch('/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({msg:i.value})
  });

  i.value='';
  load();
}

setInterval(load,1000);
load();
</script>

</body>
</html>
  `);
});

// API

app.get("/data",(req,res)=>{
  res.json(data);
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
  } else if(msg.toLowerCase().includes("/genx")){
    data.chat.push("old school 😎");
  } else {
    data.chat.push("Bot 👀");
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT||3000,()=>console.log("RUNNING"));
