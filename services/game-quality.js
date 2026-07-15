const GAME_PROFILES={
  'gridiron-x':{render:'stylized-broadcast',assets:['players','stadiums','uniforms','football','crowds'],systems:['animation-retargeting','cloth','ball-physics','broadcast-cameras']},
  'court-kings':{render:'stylized-realism',assets:['players','arenas','uniforms','basketballs'],systems:['foot-planting','rim-net-physics','crowd-lod','replay-cameras']},
  'diamond-legends':{render:'broadcast-realism',assets:['players','stadiums','bats','balls'],systems:['bat-ball-physics','fielding-ai','weather','replays']},
  'ice-storm':{render:'stylized-realism',assets:['players','rinks','sticks','pucks'],systems:['ice-reflection','skate-motion','puck-physics','crowd-lod']},
  'world-pitch':{render:'broadcast-realism',assets:['players','stadiums','balls','kits'],systems:['foot-ik','ball-physics','formations','replays']},
  'fight-night-holo':{render:'cinematic-arena',assets:['fighters','arenas','gloves','robes'],systems:['hit-reactions','sweat-vfx','cloth','haptics','replay-cameras']},
  'street-verse':{render:'cinematic-open-world',assets:['citizens','vehicles','buildings','props','outfits'],systems:['world-streaming','traffic-ai','npc-lod','destruction','day-night','weather']},
  'battlefront-zero':{render:'cinematic-sci-fi',assets:['soldiers','creatures','vehicles','weapons','arenas'],systems:['cover-ai','ballistics','destruction','squad-ai','spatial-audio']},
  'yogihoo-arena':{render:'anime-holographic',assets:['creatures','cards','arenas','effects'],systems:['creature-rigs','card-vfx','ar-placement','evolution-variants','turn-replays']},
  'volcano-racers':{render:'stylized-cinematic',assets:['vehicles','tracks','drivers','environments'],systems:['vehicle-physics','damage-lods','weather','motion-blur-options','replay-cameras']},
  'kingdom-builders':{render:'stylized-strategy',assets:['buildings','citizens','animals','vehicles','terrain'],systems:['instancing','lod','pathfinding','day-night','economy-visualization']}
};

function profile(gameId){const value=GAME_PROFILES[gameId];if(!value)throw new Error('Unknown TryAMM game.');return {gameId,...value,qualityGates:{originalIp:true,stableFrameRate:true,controller:true,touch:true,colorblindSignals:true,reducedMotion:true,spatialAudioFallback:true}};}
function meshyPlan(gameId){const p=profile(gameId);return {gameId,generate:p.assets.map((asset,index)=>({assetType:asset,prompt:`Original TryAMM ${asset} for ${gameId}; ${p.render}; production-ready; readable silhouette; no copyrighted franchise elements`,priority:index+1})),systems:p.systems};}
function qualityTier({device='mobile',memoryGb=4,gpuClass='integrated'}={}){
  if(device==='vr'||gpuClass==='high-end')return{tier:'cinematic',targetFps:90,textureMax:4096,shadow:'high',lodBias:1};
  if(device==='pc'||memoryGb>=8)return{tier:'high',targetFps:60,textureMax:4096,shadow:'medium-high',lodBias:1.25};
  return{tier:'mobile',targetFps:60,textureMax:2048,shadow:'baked-or-low',lodBias:1.75};
}
function improvementSummary(gameId){const p=profile(gameId);return {gameId,visual:p.render,improvements:[`Consistent original ${p.render} art direction`,`Meshy-assisted draft assets for ${p.assets.join(', ')}`,`Human-reviewed LOD, collision, rigging and engine exports`,...p.systems.map(v=>`Production system: ${v}`)],important:'Meshy accelerates asset prototyping; it does not automatically create finished AAA gameplay, animation, physics, networking or licensed final art.'};}
module.exports={GAME_PROFILES,profile,meshyPlan,qualityTier,improvementSummary};