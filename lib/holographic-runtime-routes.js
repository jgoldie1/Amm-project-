'use strict';
const {negotiateSession}=require('./holographic-runtime');
const {checkpoint}=require('./spatial-continuity');

module.exports=function installHolographicRuntime({app,auth,io,clean,id,getStore,saveStore}){
  const store=getStore();
  store.holoSessions=store.holoSessions||[];
  store.holoCheckpoints=store.holoCheckpoints||[];

  app.post('/api/holo/runtime/session',auth,async(req,res)=>{
    try{
      const plan=negotiateSession({
        identity:{userId:req.user.id,avatarId:req.body.avatarId,language:req.body.language,captions:req.body.captions,audioDescription:req.body.audioDescription,reducedMotion:req.body.reducedMotion,highContrast:req.body.highContrast,voiceControl:req.body.voiceControl},
        device:req.body.device||{},network:req.body.network||{},audio:req.body.audio||{},presence:req.body.presence||{},world:req.body.world||{},role:req.body.role||'member',permissionScopes:req.body.permissionScopes||[]
      });
      const session={id:id('holo'),userId:req.user.id,plan,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),status:'active'};
      store.holoSessions.push(session); await saveStore();
      res.status(201).json({session});
    }catch(error){res.status(400).json({error:error.message||'runtime_negotiation_failed'});}
  });

  app.get('/api/holo/runtime/session/:sessionId',auth,(req,res)=>{
    const s=store.holoSessions.find(x=>x.id===req.params.sessionId&&x.userId===req.user.id);
    if(!s)return res.status(404).json({error:'Session not found'}); res.json({session:s});
  });

  app.post('/api/holo/runtime/session/:sessionId/checkpoint',auth,async(req,res)=>{
    const s=store.holoSessions.find(x=>x.id===req.params.sessionId&&x.userId===req.user.id);
    if(!s)return res.status(404).json({error:'Session not found'});
    const identity=s.plan.identity; const cp=checkpoint({identity,worldUri:req.body.worldUri||s.plan.world.uri,sceneId:req.body.sceneId||s.plan.world.sceneId,position:req.body.position||{},orientation:req.body.orientation||{},inventoryRefs:req.body.inventoryRefs||[],conversationRefs:req.body.conversationRefs||[],permissionRefs:req.body.permissionRefs||[]});
    store.holoCheckpoints.push(cp); s.updatedAt=new Date().toISOString(); await saveStore(); res.status(201).json({checkpoint:cp});
  });

  app.get('/api/holo/runtime/checkpoints',auth,(req,res)=>{
    const rows=store.holoCheckpoints.filter(x=>x.userId===req.user.id).slice(-50).reverse(); res.json({checkpoints:rows});
  });

  app.post('/api/holo/runtime/session/:sessionId/end',auth,async(req,res)=>{
    const s=store.holoSessions.find(x=>x.id===req.params.sessionId&&x.userId===req.user.id); if(!s)return res.status(404).json({error:'Session not found'});
    s.status='ended';s.updatedAt=new Date().toISOString();await saveStore();io.to(`holo:${s.id}`).emit('holo:session-ended',{sessionId:s.id});res.json({ok:true});
  });

  io.on('connection',socket=>{
    socket.on('holo:join',({sessionId})=>{
      const s=store.holoSessions.find(x=>x.id===sessionId&&x.status==='active');
      if(!s||s.userId!==socket.user.id)return socket.emit('holo:error',{error:'session_unavailable'});
      socket.join(`holo:${sessionId}`); socket.data.holoSessionId=sessionId;
      socket.emit('holo:state',{session:s}); socket.to(`holo:${sessionId}`).emit('holo:presence',{userId:socket.user.id,status:'joined'});
    });
    socket.on('holo:pose',payload=>{const sessionId=socket.data.holoSessionId;if(!sessionId)return; const pose={userId:socket.user.id,position:payload?.position||{},orientation:payload?.orientation||{},at:Date.now()};socket.to(`holo:${sessionId}`).emit('holo:pose',pose);});
    socket.on('holo:signal',({to,data})=>{if(to&&data)io.to(to).emit('holo:signal',{from:socket.id,data});});
    socket.on('holo:scene-command',({command})=>{const sessionId=socket.data.holoSessionId;if(!sessionId)return;const safe=clean(command,500);if(safe)io.to(`holo:${sessionId}`).emit('holo:scene-command',{from:socket.user.id,command:safe,at:Date.now()});});
  });
};
