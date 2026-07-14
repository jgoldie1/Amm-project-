require('dotenv').config();
const express=require('express');
const path=require('path');
const fs=require('fs');
const helmet=require('helmet');
const cors=require('cors');
const rateLimit=require('express-rate-limit');
const {initializePayment,verifyWebhook,createPayout,getProvider}=require('./services/payments');
const stripeService=require('./services/stripe');
const livekitService=require('./services/livekit');
const claudeService=require('./services/claude');
const meshyService=require('./services/meshy');
const holoService=require('./services/holo');
const mobilityService=require('./services/mobility');
const alphaService=require('./services/alpha-platform');

const app=express();
const PORT=process.env.PORT||10000;
const DATA_DIR=path.join(__dirname,'data');
const FILES={knowledge:path.join(DATA_DIR,'knowledge.json'),feedback:path.join(DATA_DIR,'feedback.json'),payments:path.join(DATA_DIR,'payment-events.json'),content:path.join(DATA_DIR,'content.json'),games:path.join(DATA_DIR,'games.json'),rides:path.join(DATA_DIR,'rides.json'),deliveries:path.join(DATA_DIR,'deliveries.json'),arena:path.join(DATA_DIR,'arena-sessions.json'),collectibles:path.join(DATA_DIR,'collectibles.json'),gameSaves:path.join(DATA_DIR,'game-saves.json'),workers:path.join(DATA_DIR,'mobility-workers.json'),dispatch:path.join(DATA_DIR,'dispatch-offers.json'),tripEvents:path.join(DATA_DIR,'trip-events.json'),incidents:path.join(DATA_DIR,'safety-incidents.json'),agents:path.join(DATA_DIR,'call-center-agents.json'),queues:path.join(DATA_DIR,'call-center-queues.json'),interactions:path.join(DATA_DIR,'call-center-interactions.json'),workstations:path.join(DATA_DIR,'workstations.json'),dawProjects:path.join(DATA_DIR,'daw-projects.json'),shopify:path.join(DATA_DIR,'shopify-connections.json'),products:path.join(DATA_DIR,'shopify-products.json')};

app.use(helmet({contentSecurityPolicy:false}));
app.use(cors({origin:process.env.ALLOWED_ORIGIN||true}));
app.use('/api/payments/webhooks/:provider',express.raw({type:'application/json',limit:'1mb'}));
app.use(express.json({limit:'2mb'}));
app.use(express.static(path.join(__dirname,'public')));
app.use('/api',rateLimit({windowMs:60000,limit:120,standardHeaders:true}));

function readJson(file,fallback){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return fallback;}}
function writeJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2));}
function append(file,value,max=5000){const items=readJson(file,[]);items.push(value);writeJson(file,items.slice(-max));return value;}
function tokenize(text){return String(text).toLowerCase().replace(/[^a-z0-9'\s-]/g,' ').split(/\s+/).filter(Boolean);}
function searchKnowledge(query,mode){const docs=readJson(FILES.knowledge,[]);const terms=new Set(tokenize(query));return docs.map(doc=>{const haystack=tokenize(`${doc.title} ${doc.category} ${(doc.tags||[]).join(' ')} ${doc.content}`);let score=haystack.reduce((sum,word)=>sum+(terms.has(word)?1:0),0);if((doc.modes||[]).includes(mode))score+=3;return{...doc,score};}).filter(doc=>doc.score>0).sort((a,b)=>b.score-a.score).slice(0,4);}
const modeInstructions={quick:'Answer briefly, clearly, and with immediate next actions.',creator:'Act as a practical creator coach for music, video, livestreaming, drama, anime and marketplace publishing.',faith:'Use respectful faith-aware language. Refer to Yahavah, Yahusha Ha Mashiach and the Ruach where relevant. Separate Scripture, interpretation and fictional storytelling.',accessibility:'Use short numbered steps, one-handed and voice-first directions, and avoid unnecessary complexity.',nerd:'Go deep on anime, manga, games, cosplay, lore, power systems, worldbuilding and production details.'};
async function callOpenAICompatible({message,mode,sources,history}){if(!process.env.AI_API_URL||!process.env.AI_API_KEY||!process.env.AI_MODEL)return null;const system=`You are AMM Intelligence for TryAMM.online. Be warm, intelligent, specific and honest. Never invent account, order, payment, Scripture or catalog facts. ${modeInstructions[mode]||modeInstructions.quick}\n\nApproved TryAMM knowledge:\n${sources.map(s=>`- ${s.title}: ${s.content}`).join('\n')}`;const messages=[{role:'system',content:system},...history.slice(-8),{role:'user',content:message}];const response=await fetch(process.env.AI_API_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.AI_API_KEY}`},body:JSON.stringify({model:process.env.AI_MODEL,messages,temperature:.55})});if(!response.ok)throw new Error(`AI provider returned ${response.status}`);const data=await response.json();return data.choices?.[0]?.message?.content||data.output_text||null;}
async function callModel(args){const system=`You are AMM Intelligence for TryAMM.online. ${modeInstructions[args.mode]||modeInstructions.quick} Use approved knowledge and never invent platform facts.\n${args.sources.map(s=>`${s.title}: ${s.content}`).join('\n')}`;return(await claudeService.askClaude({system,messages:[...args.history.slice(-8),{role:'user',content:args.message}]}))||callOpenAICompatible(args);}
function localAnswer(message,mode,sources){const intro={quick:'Here is the clearest next step:',creator:'Creator plan:',faith:'Faith-centered guidance:',accessibility:'Let’s make this easy:',nerd:'Nerd-mode breakdown:'}[mode]||'Here is the answer:';if(!sources.length)return`${intro}\n\nI do not have an approved TryAMM knowledge entry for that yet. Add it to the knowledge library or connect Claude, and I will answer without guessing.`;return`${intro}\n\n${sources.map((source,index)=>`${index+1}. ${source.content}`).join('\n\n')}`;}

app.get('/api/health',(req,res)=>res.json({ok:true,stage:'advanced-alpha',service:'AMM Intelligence Phase 2',ci:'green-at-66ef767',claude:claudeService.connected(),openAICompatible:Boolean(process.env.AI_API_URL&&process.env.AI_API_KEY&&process.env.AI_MODEL),stripe:stripeService.connected(),livekit:livekitService.connected(),meshy:meshyService.connected(),africaPaymentProvider:getProvider(),holo:true,yogihooPlayable:true,mobility:'mock-safe-advanced',workstation:true,callCenter:true,dawAgent:true,shopify:process.env.SHOPIFY_ACCESS_TOKEN?'configured':'mock-safe'}));
app.get('/api/knowledge',(req,res)=>res.json(readJson(FILES.knowledge,[]).map(({id,title,category,tags,modes})=>({id,title,category,tags,modes}))));
app.post('/api/ai/chat',async(req,res)=>{const message=String(req.body.message||'').trim();const mode=Object.hasOwn(modeInstructions,req.body.mode)?req.body.mode:'quick';const history=Array.isArray(req.body.history)?req.body.history:[];if(!message)return res.status(400).json({error:'Message is required.'});const sources=searchKnowledge(message,mode);try{const answer=await callModel({message,mode,sources,history});res.json({answer:answer||localAnswer(message,mode,sources),mode,provider:answer?(claudeService.connected()?'claude':'connected-model'):'local-knowledge',sources:sources.map(({id,title,category})=>({id,title,category}))});}catch(error){console.error(error);res.json({answer:localAnswer(message,mode,sources),mode,provider:'local-fallback',sources:sources.map(({id,title,category})=>({id,title,category})),warning:'The connected AI provider was unavailable.'});}});
app.post('/api/ai/feedback',(req,res)=>{const record={id:`fb_${Date.now()}`,rating:req.body.rating==='up'?'up':'down',mode:String(req.body.mode||'quick'),question:String(req.body.question||'').slice(0,4000),answer:String(req.body.answer||'').slice(0,8000),reason:String(req.body.reason||'').slice(0,1000),createdAt:new Date().toISOString()};append(FILES.feedback,record,2000);res.status(201).json(record);});

app.get('/api/content',(req,res)=>{const type=String(req.query.type||'').toLowerCase();const items=readJson(FILES.content,[]);res.json(type?items.filter(item=>item.type===type):items);});
app.post('/api/content',(req,res)=>{const item={id:`content_${Date.now()}`,type:String(req.body.type||'reel'),title:String(req.body.title||'Untitled'),description:String(req.body.description||''),status:'draft',createdAt:new Date().toISOString()};append(FILES.content,item);res.status(201).json(item);});
app.get('/api/holo/menu',(req,res)=>res.json(holoService.menu()));
app.get('/api/holo/search',(req,res)=>res.json(holoService.searchHolo({query:req.query.q,scope:req.query.scope||'all',catalog:readJson(FILES.content,[]),games:readJson(FILES.games,[])})));
app.get('/api/games',(req,res)=>res.json(readJson(FILES.games,[])));
app.get('/api/games/:id',(req,res)=>{const game=readJson(FILES.games,[]).find(item=>item.id===req.params.id);if(!game)return res.status(404).json({error:'Game not found.'});res.json(game);});
app.get('/api/collectibles',(req,res)=>res.json(readJson(FILES.collectibles,[])));
app.post('/api/game-saves/:gameId',(req,res)=>{const gameId=String(req.params.gameId||'').trim();const playerId=String(req.body.playerId||'demo-player').trim();if(!gameId)return res.status(400).json({error:'Game id is required.'});const saves=readJson(FILES.gameSaves,[]);const record={id:`save_${Date.now()}`,gameId,playerId,state:req.body.state||{},updatedAt:new Date().toISOString()};const filtered=saves.filter(item=>!(item.gameId===gameId&&item.playerId===playerId));filtered.push(record);writeJson(FILES.gameSaves,filtered.slice(-5000));res.status(201).json(record);});
app.get('/api/game-saves/:gameId/:playerId',(req,res)=>{const save=readJson(FILES.gameSaves,[]).find(item=>item.gameId===req.params.gameId&&item.playerId===req.params.playerId);if(!save)return res.status(404).json({error:'Save not found.'});res.json(save);});
app.post('/api/holo/arena/session',(req,res)=>{const game=readJson(FILES.games,[]).find(item=>item.id===String(req.body.gameId||''));if(!game)return res.status(400).json({error:'Choose one of the 11 registered games.'});const session={id:`arena_${Date.now()}`,gameId:game.id,gameTitle:game.title,format:String(req.body.format||'match'),spectators:req.body.spectators!==false,status:'lobby',controllerSupport:game.modes.includes('controller'),xrModes:game.modes.filter(mode=>['ar','vr','mr'].includes(mode)),createdAt:new Date().toISOString()};append(FILES.arena,session);res.status(201).json(session);});
app.post('/api/holo/rides',(req,res)=>{const record=holoService.createRide(req.body);append(FILES.rides,record);res.status(201).json(record);});
app.post('/api/holo/deliveries',(req,res)=>{const record=holoService.createDelivery(req.body);append(FILES.deliveries,record);res.status(201).json(record);});

app.post('/api/mobility/onboarding',(req,res,next)=>{try{const record=mobilityService.onboarding(req.body);append(FILES.workers,record);res.status(201).json({...record,gate:mobilityService.complianceGate(record)});}catch(error){next(error);}});
app.get('/api/mobility/workers/:id/compliance',(req,res)=>{const worker=readJson(FILES.workers,[]).find(item=>item.id===req.params.id);if(!worker)return res.status(404).json({error:'Worker not found.'});res.json(mobilityService.complianceGate(worker));});
app.post('/api/mobility/dispatch',(req,res,next)=>{try{const offer=mobilityService.dispatchOffer(req.body);append(FILES.dispatch,offer);res.status(201).json(offer);}catch(error){next(error);}});
app.post('/api/mobility/trip-events',(req,res,next)=>{try{const event=mobilityService.tripEvent(req.body);append(FILES.tripEvents,event);res.status(201).json(event);}catch(error){next(error);}});
app.post('/api/mobility/safety-incidents',(req,res,next)=>{try{const incident=mobilityService.safetyIncident(req.body);append(FILES.incidents,incident);res.status(201).json(incident);}catch(error){next(error);}});

app.post('/api/alpha/workstations',(req,res,next)=>{try{const item=alphaService.createWorkstation(req.body);append(FILES.workstations,item);res.status(201).json(item);}catch(error){next(error);}});
app.post('/api/alpha/call-center/agents',(req,res,next)=>{try{const item=alphaService.createAgentProfile(req.body);append(FILES.agents,item);res.status(201).json(item);}catch(error){next(error);}});
app.post('/api/alpha/call-center/queues',(req,res,next)=>{try{const item=alphaService.createQueue(req.body);append(FILES.queues,item);res.status(201).json(item);}catch(error){next(error);}});
app.post('/api/alpha/call-center/interactions',(req,res,next)=>{try{const item=alphaService.createInteraction(req.body);append(FILES.interactions,item);res.status(201).json(item);}catch(error){next(error);}});
app.post('/api/alpha/call-center/summarize',(req,res)=>res.json(alphaService.summarizeInteraction(req.body)));
app.post('/api/alpha/daw/projects',(req,res,next)=>{try{const item=alphaService.createDawProject(req.body);append(FILES.dawProjects,item);res.status(201).json(item);}catch(error){next(error);}});
app.post('/api/alpha/shopify/connect',(req,res,next)=>{try{const item=alphaService.createShopifyConnection(req.body);append(FILES.shopify,item);res.status(201).json(item);}catch(error){next(error);}});
app.post('/api/alpha/shopify/products/import',(req,res)=>{const products=(Array.isArray(req.body.products)?req.body.products:[]).map(alphaService.normalizeProduct);writeJson(FILES.products,products);res.status(201).json({count:products.length,products});});
app.get('/api/alpha/shopify/products',(req,res)=>res.json(readJson(FILES.products,[])));

app.post('/api/stripe/checkout',async(req,res,next)=>{try{const base=process.env.PUBLIC_APP_URL||`${req.protocol}://${req.get('host')}`;res.status(201).json(await stripeService.createCheckout({...req.body,successUrl:`${base}/platform.html?payment=success`,cancelUrl:`${base}/platform.html?payment=cancelled`}));}catch(error){next(error);}});
app.post('/api/payments/initialize',async(req,res,next)=>{try{res.status(201).json(await initializePayment(req.body||{}));}catch(error){next(error);}});
app.post('/api/payments/payouts',async(req,res,next)=>{try{if(String(req.headers['x-admin-key']||'')!==String(process.env.ADMIN_ACTION_KEY||''))return res.status(403).json({error:'Payout authorization failed.'});res.status(201).json(await createPayout(req.body||{}));}catch(error){next(error);}});
app.post('/api/payments/webhooks/:provider',(req,res)=>{const provider=String(req.params.provider||'').toLowerCase();try{const event=provider==='stripe'?stripeService.verifyWebhook(req.body,req.headers['stripe-signature']):(verifyWebhook(provider,req.body,req.headers)?JSON.parse(req.body.toString('utf8')):null);if(!event)return res.status(401).json({error:'Invalid webhook signature.'});append(FILES.payments,{provider,receivedAt:new Date().toISOString(),event});res.sendStatus(200);}catch{res.status(400).json({error:'Invalid webhook payload.'});}});
app.post('/api/livekit/token',async(req,res,next)=>{try{const room=String(req.body.room||'').trim();const identity=String(req.body.identity||'').trim();if(!room||!identity)return res.status(400).json({error:'Room and identity are required.'});res.json(await livekitService.createJoinToken({room,identity,name:req.body.name,canPublish:req.body.canPublish!==false}));}catch(error){next(error);}});
app.post('/api/meshy/text-to-3d',async(req,res,next)=>{try{const prompt=String(req.body.prompt||'').trim();if(!prompt)return res.status(400).json({error:'Prompt is required.'});res.status(202).json(await meshyService.createTextTo3D({prompt,artStyle:req.body.artStyle}));}catch(error){next(error);}});
app.get('/api/meshy/tasks/:id',async(req,res,next)=>{try{res.json(await meshyService.getTask(req.params.id));}catch(error){next(error);}});
app.get('/payments/mock-success',(req,res)=>res.send(`<h1>Mock payment complete</h1><p>Reference: ${String(req.query.reference||'unknown')}</p><p>This page is for development only.</p>`));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.use((error,req,res,next)=>{console.error(error);res.status(500).json({error:error.message||'TryAMM encountered an unexpected error.'});});
app.listen(PORT,()=>console.log(`AMM Intelligence Advanced Alpha running on port ${PORT}`));