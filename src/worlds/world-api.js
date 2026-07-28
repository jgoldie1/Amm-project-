'use strict';
function registerWorldRoutes(app,{registry,auth,store,saveStore}){
  app.get('/api/worlds',(_req,res)=>res.json({worlds:registry.list().map(({slug,name,status,version,ageLane,spawn,portals,budget})=>({slug,name,status,version,ageLane,spawn,portals,budget}))}));
  app.get('/api/worlds/:slug',(req,res)=>{const world=registry.get(req.params.slug);if(!world)return res.status(404).json({error:'World not found'});res.json({world});});
  app.put('/api/world-state',auth,async(req,res)=>{const world=registry.get(req.body.worldSlug);if(!world||world.status!=='live')return res.status(400).json({error:'Enterable world required'});const p=req.body.position||{};if(!['x','y','z'].every(k=>Number.isFinite(p[k])))return res.status(400).json({error:'Finite avatar position required'});store.worldStates=store.worldStates||[];const state={userId:req.user.id,worldSlug:world.slug,position:{x:p.x,y:p.y,z:p.z},updatedAt:new Date().toISOString()};const i=store.worldStates.findIndex(s=>s.userId===req.user.id);if(i>=0)store.worldStates[i]=state;else store.worldStates.push(state);await saveStore();res.json({state});});
  app.get('/api/world-state',auth,(req,res)=>res.json({state:(store.worldStates||[]).find(s=>s.userId===req.user.id)||null}));
}
module.exports={registerWorldRoutes};
