const express=require('express');
const fs=require('fs');
const path=require('path');
const crypto=require('crypto');

const router=express.Router();
const DATA=path.join(__dirname,'..','data','game-production.json');
const CATEGORIES=['character','environment','animation','npc-tree','quest','audio','server','performance','qa','balance'];
function load(){try{return JSON.parse(fs.readFileSync(DATA,'utf8'));}catch{return{assets:[],animations:[],npcs:[],quests:[],audio:[],servers:[],performance:[],qa:[],balance:[]};}}
function save(db){fs.mkdirSync(path.dirname(DATA),{recursive:true});fs.writeFileSync(DATA,JSON.stringify(db,null,2));}
function id(prefix){return `${prefix}_${crypto.randomUUID()}`;}
function clean(v,max=300){return String(v||'').trim().slice(0,max);}
function user(req){return clean(req.headers['x-user-id']||req.body?.userId||'demo-user',120);}
function admin(req){return String(req.headers['x-admin-key']||'')===String(process.env.ADMIN_ACTION_KEY||'');}
function collection(category){return ({character:'assets',environment:'assets',animation:'animations','npc-tree':'npcs',quest:'quests',audio:'audio',server:'servers',performance:'performance',qa:'qa',balance:'balance'})[category];}

router.get('/summary',(req,res)=>{const db=load();res.json({counts:Object.fromEntries(Object.entries(db).map(([k,v])=>[k,v.length])),milestones:[
{id:'yogihoo-vertical-slice',title:'Yogihoo Arena vertical slice',status:'in-progress'},
{id:'streetverse-creator-city',title:'StreetVerse Creator City',status:'in-progress'},
{id:'dedicated-multiplayer',title:'Dedicated multiplayer staging',status:'planned'},
{id:'gameverse-qa',title:'Large-scale QA and balancing',status:'planned'}]});});

router.get('/items',(req,res)=>{const db=load();const category=clean(req.query.category,40);if(category&&CATEGORIES.includes(category))return res.json(db[collection(category)].filter(x=>x.category===category||!x.category));res.json(db);});

router.post('/items',(req,res)=>{if(!admin(req))return res.status(403).json({error:'Admin authorization required.'});const category=clean(req.body.category,40);if(!CATEGORIES.includes(category))return res.status(400).json({error:'Unsupported production category.'});const key=collection(category);const db=load();const record={id:id(category.replace(/[^a-z]/g,'')),category,gameId:clean(req.body.gameId,80)||'shared',title:clean(req.body.title,160),description:clean(req.body.description,2000),ownerId:user(req),status:['backlog','briefed','in-production','review','approved','blocked','done'].includes(req.body.status)?req.body.status:'backlog',priority:['low','medium','high','critical'].includes(req.body.priority)?req.body.priority:'medium',budget:Number(req.body.budget||0),targetDate:clean(req.body.targetDate,40)||null,acceptance:Array.isArray(req.body.acceptance)?req.body.acceptance.slice(0,30).map(x=>clean(x,300)):[],metadata:req.body.metadata&&typeof req.body.metadata==='object'?req.body.metadata:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};if(!record.title)return res.status(400).json({error:'Title is required.'});db[key].push(record);save(db);res.status(201).json(record);});

router.patch('/items/:category/:id',(req,res)=>{if(!admin(req))return res.status(403).json({error:'Admin authorization required.'});const category=clean(req.params.category,40);if(!CATEGORIES.includes(category))return res.status(400).json({error:'Unsupported production category.'});const key=collection(category);const db=load();const item=db[key].find(x=>x.id===req.params.id);if(!item)return res.status(404).json({error:'Production item not found.'});for(const field of ['title','description','status','priority','targetDate'])if(req.body[field]!==undefined)item[field]=clean(req.body[field],field==='description'?2000:300);if(req.body.metadata&&typeof req.body.metadata==='object')item.metadata={...item.metadata,...req.body.metadata};if(Array.isArray(req.body.acceptance))item.acceptance=req.body.acceptance.slice(0,30).map(x=>clean(x,300));item.updatedAt=new Date().toISOString();save(db);res.json(item);});

router.post('/seed',(req,res)=>{if(!admin(req))return res.status(403).json({error:'Admin authorization required.'});const db=load();if(Object.values(db).some(items=>items.length))return res.status(409).json({error:'Production board already contains records.'});const now=new Date().toISOString();const seed=(key,category,title,gameId,description,priority='high')=>db[key].push({id:id(category),category,title,gameId,description,ownerId:'system',status:'briefed',priority,budget:0,targetDate:null,acceptance:[],metadata:{originalOnly:true},createdAt:now,updatedAt:now});
seed('assets','character','Yogihoo starter creature pack','yogihoo-arena','Create six original rigged creatures with LODs, expressions, battle poses, AR-safe materials and commercial-use records.');
seed('assets','environment','Creator City district kit','street-verse','Create modular streets, Stubbs AI Tower, Creator Square, Quantum Beat Club, Aniyah Market, interiors, traffic props and accessible routes.','critical');
seed('animations','animation','Universal humanoid animation library','shared','Idle, walk, run, sprint, jump, vault, climb, interact, sit, emotes, equipment, driving and accessibility variants.');
seed('npcs','npc-tree','Creator City NPC behavior trees','street-verse','Patrol, merchant, quest giver, teacher, audience, security, companion, memory and reputation transitions.');
seed('quests','quest','Creator City opening chapter','street-verse','Tutorial, first studio, first marketplace sale, first performance, first vehicle and district reputation arc.');
seed('audio','audio','Gameverse original audio package','shared','Theme music, adaptive stems, UI, movement, environment, vehicles, creatures, equipment, captions and localization timing.');
seed('servers','server','Regional authoritative multiplayer staging','shared','Deploy matchmaking, presence, state sync, snapshots, reconciliation, moderation hooks, replay storage and health monitoring.','critical');
seed('performance','performance','Mobile and desktop performance budgets','shared','60 FPS mobile target, scalable desktop target, LOD, occlusion, texture streaming, memory caps and network budgets.');
seed('qa','qa','Gameverse large-scale QA program','shared','Functional, network, accessibility, security, regression, device, payment, soak, load and moderation testing.','critical');
seed('balance','balance','Cross-game economy and progression balance','shared','XP curves, reward pacing, item rarity, matchmaking rating, Yogihoo power curves, class roles and seasonal caps.');
save(db);res.status(201).json({seeded:Object.values(db).reduce((n,v)=>n+v.length,0)});});

module.exports=router;
