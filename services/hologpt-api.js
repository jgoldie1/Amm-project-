const express=require('express');
const orchestrator=require('./hologpt-orchestrator');
const claude=require('./claude');
const supabase=require('./supabase');
const router=express.Router();
async function auth(req,res,next){if(!supabase.configured())return res.status(503).json({error:'Supabase is not configured.'});return supabase.requireUser(req,res,next);}
router.get('/status',(req,res)=>res.json(orchestrator.status()));
router.post('/preview-route',(req,res)=>{const task=orchestrator.classify(req.body.message||'');res.json({task,order:orchestrator.providerOrder(task,req.body.preferredProvider)});});
router.use(auth);
router.post('/chat',async(req,res,next)=>{try{const message=String(req.body.message||'').trim();if(!message)return res.status(400).json({error:'Message is required.'});const maxTokens=Math.min(Math.max(Number(req.body.maxTokens)||1200,100),4000);const system='You are HoloGPT for TryAMM. Be accurate, useful, accessible and transparent. Use only approved platform data and consented memory. Never invent payment, account, legal, medical or provider facts. Require confirmation before money movement, publication, deletion or account changes.';const messages=[...(Array.isArray(req.body.history)?req.body.history.slice(-10):[]),{role:'user',content:message}];const result=await orchestrator.answer({message,system,messages,maxTokens,preferredProvider:req.body.preferredProvider},{claude:claude.askClaude});res.json({...result,answer:result.text||'No configured AI provider was available. Add a provider key or use the local TryAMM knowledge system.'});}catch(error){next(error);}});
module.exports={router};