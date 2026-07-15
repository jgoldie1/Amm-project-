require('dotenv').config();
const base=process.env.PUBLIC_APP_URL||`http://localhost:${process.env.PORT||10000}`;
const interval=Math.max(1000,Number(process.env.GAME_MATCHMAKER_INTERVAL_MS||3000));
async function tick(){try{const r=await fetch(`${base}/api/game-platform/matchmaking/tick`,{method:'POST',headers:{'Content-Type':'application/json','x-worker-key':process.env.GAME_WORKER_KEY||''}});const d=await r.json();if(!r.ok)throw new Error(d.error||`HTTP ${r.status}`);if(d.created)console.log(`[matchmaker] created ${d.created} match(es)`);}catch(e){console.error('[matchmaker]',e.message);}}
console.log(`[matchmaker] ${base} every ${interval}ms`);tick();setInterval(tick,interval);