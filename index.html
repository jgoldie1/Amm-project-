const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("public"));

/* ===== SETUP ===== */
if (!fs.existsSync("data")) fs.mkdirSync("data");

const USERS_FILE = "data/users.json";
const POSTS_FILE = "data/posts.json";

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
if (!fs.existsSync(POSTS_FILE)) fs.writeFileSync(POSTS_FILE, "[]");

function read(file){ return JSON.parse(fs.readFileSync(file)); }
function write(file,data){ fs.writeFileSync(file, JSON.stringify(data,null,2)); }

/* ===== AUTH ===== */
app.post("/register",(req,res)=>{
  let users = read(USERS_FILE);

  if(users.find(u=>u.username===req.body.username)){
    return res.json({error:"exists"});
  }

  const user = {
    id: Date.now(),
    username:req.body.username,
    password:req.body.password,
    followers:[],
    following:[]
  };

  users.push(user);
  write(USERS_FILE,users);

  res.json({user});
});

app.post("/login",(req,res)=>{
  let users = read(USERS_FILE);

  const user = users.find(
    u=>u.username===req.body.username &&
       u.password===req.body.password
  );

  res.json({user});
});

/* ===== USERS ===== */
app.get("/users",(req,res)=>{
  res.json(read(USERS_FILE));
});

app.get("/profile/:id",(req,res)=>{
  const u = read(USERS_FILE).find(x=>x.id==req.params.id);
  res.json(u);
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
  }

  write(USERS_FILE,users);
  res.json({ok:true});
});

/* ===== POSTS (ALGORITHM BASE) ===== */
app.post("/post",(req,res)=>{
  let posts = read(POSTS_FILE);

  const post = {
    id: Date.now(),
    user: req.body.user,
    content: req.body.content,
    likes:0,
    views:0,
    score:0
  };

  posts.unshift(post);
  write(POSTS_FILE,posts);

  res.json(post);
});

/* ===== LIKE ===== */
app.post("/like",(req,res)=>{
  let posts = read(POSTS_FILE);
  const p = posts.find(x=>x.id==req.body.id);

  if(p){
    p.likes++;
    p.score += 2; // algorithm weight
  }

  write(POSTS_FILE,posts);
  res.json({ok:true});
});

/* ===== VIEW TRACK (ALGORITHM CORE) ===== */
app.post("/view",(req,res)=>{
  let posts = read(POSTS_FILE);
  const p = posts.find(x=>x.id==req.body.id);

  if(p){
    p.views++;
    p.score += 5; // MOST IMPORTANT
  }

  write(POSTS_FILE,posts);
  res.json({ok:true});
});

/* ===== FEED (SORTED BY SCORE) ===== */
app.get("/feed",(req,res)=>{
  let posts = read(POSTS_FILE);

  posts.sort((a,b)=>b.score - a.score);

  res.json(posts);
});

/* ===== SEARCH (HOLO SEARCH) ===== */
app.get("/search",(req,res)=>{
  const q = req.query.q?.toLowerCase() || "";

  const users = read(USERS_FILE).filter(u =>
    u.username.toLowerCase().includes(q)
  );

  const posts = read(POSTS_FILE).filter(p =>
    p.content.toLowerCase().includes(q)
  );

  res.json({users,posts});
});

/* ===== START ===== */
app.listen(process.env.PORT || 3000, ()=>console.log("RUNNING"));
