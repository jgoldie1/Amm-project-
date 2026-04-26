const express = require("express");
const http = require("http");
const fs = require("fs");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server);

app.use(express.json());
app.use(express.static("public"));

/* ===== SETUP ===== */
if (!fs.existsSync("data")) fs.mkdirSync("data");

const USERS_FILE = "data/users.json";
const POSTS_FILE = "data/posts.json";

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
if (!fs.existsSync(POSTS_FILE)) fs.writeFileSync(POSTS_FILE, "[]");

const read = f => JSON.parse(fs.readFileSync(f));
const write = (f,d) => fs.writeFileSync(f, JSON.stringify(d,null,2));

/* ===== AUTH ===== */
app.post("/register",(req,res)=>{
  let users = read(USERS_FILE);

  const user = {
    id: Date.now(),
    username:req.body.username,
    password:req.body.password,
    coins:100, // 💰 START COINS
    followers:[],
    following:[]
  };

  users.push(user);
  write(USERS_FILE,users);

  res.json({user});
});

app.post("/login",(req,res)=>{
  let users = read(USERS_FILE);
  const user = users.find(u =>
    u.username===req.body.username &&
    u.password===req.body.password
  );
  res.json({user});
});

/* ===== USERS ===== */
app.get("/users",(req,res)=>res.json(read(USERS_FILE)));

app.get("/profile/:id",(req,res)=>{
  res.json(read(USERS_FILE).find(u=>u.id==req.params.id));
});

/* ===== FOLLOW ===== */
app.post("/follow",(req,res)=>{
  let users = read(USERS_FILE);
  const {me,target} = req.body;

  const a = users.find(u=>u.id==me);
  const b = users.find(u=>u.id==target);

  if(a && b && !a.following.includes(target)){
    a.following.push(target);
    b.followers.push(me);

    io.emit("notify", `${a.username} followed ${b.username}`);
  }

  write(USERS_FILE,users);
  res.json({ok:true});
});

/* ===== POSTS ===== */
app.post("/post",(req,res)=>{
  let posts = read(POSTS_FILE);

  const post = {
    id: Date.now(),
    user:req.body.user,
    content:req.body.content,
    likes:0,
    views:0,
    score:0
  };

  posts.unshift(post);
  write(POSTS_FILE,posts);

  io.emit("notify", `${post.user} posted new content`);

  res.json(post);
});

/* ===== LIKE ===== */
app.post("/like",(req,res)=>{
  let posts = read(POSTS_FILE);
  const p = posts.find(x=>x.id==req.body.id);

  if(p){
    p.likes++;
    p.score += 2;
  }

  write(POSTS_FILE,posts);
  res.json({ok:true});
});

/* ===== VIEW ===== */
app.post("/view",(req,res)=>{
  let posts = read(POSTS_FILE);
  const p = posts.find(x=>x.id==req.body.id);

  if(p){
    p.views++;
    p.score += 5;
  }

  write(POSTS_FILE,posts);
  res.json({ok:true});
});

/* ===== FEED ===== */
app.get("/feed",(req,res)=>{
  let posts = read(POSTS_FILE);
  posts.sort((a,b)=>b.score-a.score);
  res.json(posts);
});

/* ===== 💰 GIFT SYSTEM ===== */
app.post("/gift",(req,res)=>{
  let users = read(USERS_FILE);
  const {from,to,amount} = req.body;

  const sender = users.find(u=>u.id==from);
  const receiver = users.find(u=>u.id==to);

  if(sender && receiver && sender.coins >= amount){
    sender.coins -= amount;
    receiver.coins += amount;

    io.emit("gift", `${sender.username} sent ${amount} coins to ${receiver.username}`);
  }

  write(USERS_FILE,users);
  res.json({ok:true});
});

/* ===== 🔍 SEARCH ===== */
app.get("/search",(req,res)=>{
  const q = req.query.q.toLowerCase();

  const users = read(USERS_FILE).filter(u =>
    u.username.toLowerCase().includes(q)
  );

  const posts = read(POSTS_FILE).filter(p =>
    p.content.toLowerCase().includes(q)
  );

  res.json({users,posts});
});

/* ===== 🤖 HOLO GPT (BASIC AI) ===== */
function holoReply(text){
  if(text.includes("hello")) return "👋 Welcome to the future";
  if(text.includes("live")) return "🔥 Trending live streams now!";
  return "🤖 AI is watching...";
}

/* ===== SOCKET ===== */
io.on("connection", socket=>{
  socket.on("chat", msg=>{
    io.emit("chat", msg);

    const ai = holoReply(msg);
    io.emit("chat", ai);
  });
});

server.listen(process.env.PORT||3000,()=>console.log("RUNNING"));
