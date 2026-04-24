const express=require('express');const app=express();app.use(express.json());

let likes = { main: 0 };

app.get('/',(req,res)=>res.sendFile(__dirname+'/index.html'));

app.post('/like',(req,res)=>{
  likes.main++;
  res.json(likes);
});

app.get('/likes',(req,res)=>{
  res.json(likes);
});

app.listen(3000,()=>console.log('RUNNING'));
