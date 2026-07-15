const crypto=require('crypto');

function id(prefix){return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;}
function clamp(n,min,max){return Math.max(min,Math.min(max,Number(n)||0));}

function createPlayer(input={}){
  return {id:String(input.id||id('player')),rating:clamp(input.rating||1000,0,5000),region:String(input.region||'global'),input:String(input.input||'touch'),xr:String(input.xr||'flat'),partyId:input.partyId?String(input.partyId):null,joinedAt:new Date().toISOString()};
}

function createQueue({gameId,mode='ranked',region='global',teamSize=1,maxPlayers=2}){
  return {id:id('queue'),gameId:String(gameId),mode:String(mode),region:String(region),teamSize:clamp(teamSize,1,20),maxPlayers:clamp(maxPlayers,2,100),players:[],status:'open',createdAt:new Date().toISOString()};
}

function enqueue(queue,playerInput){
  if(queue.status!=='open')throw new Error('Queue is not open.');
  if(queue.players.length>=queue.maxPlayers)throw new Error('Queue is full.');
  const player=createPlayer(playerInput);
  if(queue.players.some(p=>p.id===player.id))return queue;
  return {...queue,players:[...queue.players,player]};
}

function match(queue){
  if(queue.players.length<2)return {ready:false,reason:'Need at least two players.',queue};
  const sorted=[...queue.players].sort((a,b)=>a.rating-b.rating);
  const selected=sorted.slice(0,queue.maxPlayers);
  const midpoint=Math.ceil(selected.length/2);
  const matchRecord={id:id('match'),gameId:queue.gameId,mode:queue.mode,region:queue.region,status:'ready',teams:[selected.slice(0,midpoint),selected.slice(midpoint)],seed:crypto.randomBytes(8).toString('hex'),serverAuthority:true,antiCheat:{inputSequence:true,stateHash:true,rateLimits:true,replayLog:true},spectator:{enabled:true,delaySeconds:15,maxViewers:10000},createdAt:new Date().toISOString()};
  return {ready:true,match:matchRecord,queue:{...queue,status:'matched'}};
}

function createBracket({name,gameId,players=[],format='single-elimination'}){
  const entrants=players.map(createPlayer);
  const rounds=[];
  let current=entrants;
  while(current.length>1){
    const round=[];
    for(let i=0;i<current.length;i+=2)round.push({id:id('series'),a:current[i]||null,b:current[i+1]||null,bestOf:3,winner:null,replayIds:[]});
    rounds.push(round);current=round.map((series,index)=>({id:`winner_${rounds.length}_${index}`,rating:1000,placeholder:true}));
  }
  return {id:id('tournament'),name:String(name||'TryAMM Arena Cup'),gameId:String(gameId),format,entrants,rounds,status:'registration',broadcast:{livekitRoom:null,moderation:true,commentary:true},createdAt:new Date().toISOString()};
}

function verifyClientEvent(event={}){
  const allowed=['move','aim','attack','block','dodge','card','interact'];
  const errors=[];
  if(!allowed.includes(event.type))errors.push('invalid-event-type');
  if(!Number.isInteger(event.sequence)||event.sequence<0)errors.push('invalid-sequence');
  if(typeof event.clientTime!=='number')errors.push('invalid-client-time');
  if(JSON.stringify(event.payload||{}).length>4096)errors.push('payload-too-large');
  return {valid:errors.length===0,errors};
}

module.exports={createPlayer,createQueue,enqueue,match,createBracket,verifyClientEvent};
