const crypto=require('crypto');

const GAME_IDS=new Set([
  'gridiron-x','court-kings','diamond-legends','ice-storm','world-pitch',
  'fight-night-holo','street-verse','battlefront-zero','yogihoo-arena',
  'volcano-racers','kingdom-builders'
]);

function id(prefix){return `${prefix}_${crypto.randomUUID()}`;}
function clean(value,max=120){return String(value||'').trim().slice(0,max);}
function integer(value,min=0,max=1_000_000){const parsed=Number.parseInt(value,10);return Number.isFinite(parsed)?Math.min(max,Math.max(min,parsed)):min;}
function requireGame(gameId){const value=clean(gameId,80);if(!GAME_IDS.has(value))throw new Error('Unknown TryAMM game id.');return value;}

function createPlayerProfile(input={}){
  return {
    id:id('player'),
    userId:clean(input.userId,120),
    displayName:clean(input.displayName,50)||'Player',
    avatarAssetId:clean(input.avatarAssetId,120)||null,
    accessibility:{
      oneHanded:Boolean(input.accessibility?.oneHanded),
      captions:input.accessibility?.captions!==false,
      reducedMotion:Boolean(input.accessibility?.reducedMotion),
      highContrast:Boolean(input.accessibility?.highContrast),
      aimAssist:Boolean(input.accessibility?.aimAssist),
      simplifiedControls:Boolean(input.accessibility?.simplifiedControls)
    },
    createdAt:new Date().toISOString()
  };
}

function createCloudSave(input={}){
  return {
    id:id('save'),
    userId:clean(input.userId,120),
    gameId:requireGame(input.gameId),
    slot:integer(input.slot,1,10),
    version:integer(input.version,1,999999),
    state:input.state&&typeof input.state==='object'?input.state:{},
    checksum:clean(input.checksum,128)||null,
    updatedAt:new Date().toISOString()
  };
}

function createQueueTicket(input={}){
  const mode=clean(input.mode,50)||'casual';
  const region=clean(input.region,40)||'auto';
  return {
    id:id('queue'),
    userId:clean(input.userId,120),
    gameId:requireGame(input.gameId),
    mode,
    region,
    partySize:integer(input.partySize,1,20),
    skillRating:integer(input.skillRating,0,10000),
    controller:clean(input.controller,80)||'touch',
    crossplay:input.crossplay!==false,
    status:'searching',
    createdAt:new Date().toISOString()
  };
}

function createMatch(input={}){
  const players=Array.isArray(input.players)?input.players.slice(0,100).map(player=>({
    userId:clean(player.userId,120),
    team:clean(player.team,40)||null,
    rating:integer(player.rating,0,10000)
  })):[];
  if(players.length<1)throw new Error('At least one player is required.');
  return {
    id:id('match'),
    gameId:requireGame(input.gameId),
    mode:clean(input.mode,50)||'casual',
    region:clean(input.region,40)||'auto',
    players,
    serverAuthority:true,
    status:'lobby',
    seed:crypto.randomBytes(8).toString('hex'),
    createdAt:new Date().toISOString()
  };
}

function createProgressEvent(input={}){
  const xp=integer(input.xp,0,100000);
  return {
    id:id('progress'),
    userId:clean(input.userId,120),
    gameId:requireGame(input.gameId),
    eventType:clean(input.eventType,80)||'match-complete',
    xp,
    currency:integer(input.currency,0,100000),
    metadata:input.metadata&&typeof input.metadata==='object'?input.metadata:{},
    createdAt:new Date().toISOString()
  };
}

function createAchievement(input={}){
  return {
    id:id('achievement'),
    gameId:requireGame(input.gameId),
    code:clean(input.code,80),
    title:clean(input.title,100),
    description:clean(input.description,500),
    threshold:integer(input.threshold,1,1000000),
    rewardXp:integer(input.rewardXp,0,100000),
    hidden:Boolean(input.hidden)
  };
}

function createReplay(input={}){
  return {
    id:id('replay'),
    matchId:clean(input.matchId,120),
    gameId:requireGame(input.gameId),
    ownerId:clean(input.ownerId,120),
    durationSeconds:integer(input.durationSeconds,0,86400),
    storagePath:clean(input.storagePath,500),
    visibility:['private','friends','public'].includes(input.visibility)?input.visibility:'private',
    integrityHash:clean(input.integrityHash,128)||null,
    createdAt:new Date().toISOString()
  };
}

function evaluateAntiCheat(input={}){
  const reasons=[];
  const actionsPerSecond=Number(input.actionsPerSecond||0);
  const clockDriftMs=Math.abs(Number(input.clockDriftMs||0));
  const impossibleTravel=Boolean(input.impossibleTravel);
  const unsignedClient=Boolean(input.unsignedClient);
  if(actionsPerSecond>30)reasons.push('action-rate-anomaly');
  if(clockDriftMs>5000)reasons.push('clock-drift');
  if(impossibleTravel)reasons.push('impossible-movement');
  if(unsignedClient)reasons.push('unsigned-client');
  return {
    score:Math.min(100,reasons.length*25),
    disposition:reasons.length>=3?'block':reasons.length?'review':'allow',
    reasons
  };
}

function controllerPreset(input={}){
  const handedness=['left','right','either'].includes(input.handedness)?input.handedness:'either';
  return {
    handedness,
    scheme:clean(input.scheme,60)||'standard',
    bindings:input.bindings&&typeof input.bindings==='object'?input.bindings:{
      primary:'button0',secondary:'button1',dodge:'button2',special:'button3',pause:'button9'
    },
    deadzone:Math.min(.9,Math.max(0,Number(input.deadzone||.15))),
    vibration:input.vibration!==false
  };
}

module.exports={GAME_IDS,createPlayerProfile,createCloudSave,createQueueTicket,createMatch,createProgressEvent,createAchievement,createReplay,evaluateAntiCheat,controllerPreset};
