import {HOLO_BATTLE_RULESETS,type HoloRulesetId} from '../game/holographic/HoloBattleRulesets'

const ORDER:HoloRulesetId[]=['streetverse-combat','boxing','holo-card','holo-creature','sportsverse','faithverse','holoverse-championship']

const ICON:Record<HoloRulesetId,string>={
 'streetverse-combat':'⚡',boxing:'🥊','holo-card':'▣','holo-creature':'◈',
 sportsverse:'🏆',faithverse:'✦','holoverse-championship':'◎',
}

export default function HoloArenaSelect({onSelect,onClose}:{onSelect:(id:HoloRulesetId)=>void;onClose:()=>void}){
 return <div style={{position:'fixed',inset:0,zIndex:10000,overflowY:'auto',background:'radial-gradient(circle at 50% 0,#102c45,#02060b 65%)',color:'white',fontFamily:'system-ui',padding:'max(18px,env(safe-area-inset-top)) 14px max(22px,env(safe-area-inset-bottom))'}}>
  <header style={{textAlign:'center',maxWidth:720,margin:'0 auto 14px'}}>
   <div style={{fontSize:11,letterSpacing:3,color:'#35ffe1'}}>CROSSVERSE PORTAL</div>
   <h1 style={{margin:'5px 0'}}>CHOOSE YOUR ARENA</h1>
   <p style={{margin:0,opacity:.78,fontSize:14}}>One Holo Arena. Different Verse rules. LIVE, PK, tournaments and Reels connect here.</p>
  </header>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:10,maxWidth:720,margin:'0 auto'}}>
   {ORDER.map(id=>{const r=HOLO_BATTLE_RULESETS[id];return <button key={id} onClick={()=>onSelect(id)} style={{minHeight:132,textAlign:'left',border:'1px solid rgba(53,255,225,.6)',borderRadius:16,padding:14,background:'rgba(3,18,30,.9)',color:'white',boxShadow:'0 0 18px rgba(53,255,225,.08)'}}>
    <div style={{fontSize:30}}>{ICON[id]}</div><strong style={{display:'block',margin:'6px 0'}}>{r.title}</strong>
    <span style={{fontSize:12,opacity:.72}}>{r.verse} • {r.combat?'BATTLE':'CHALLENGE'}</span>
   </button>})}
  </div>
  <div style={{maxWidth:720,margin:'12px auto 0',display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
   <button onClick={()=>onSelect('holoverse-championship')} style={{minHeight:50,border:'1px solid #b66cff',borderRadius:12,background:'rgba(45,12,70,.85)',color:'white',fontWeight:800}}>LIVE / PK HUB</button>
   <button onClick={onClose} style={{minHeight:50,border:'1px solid #777',borderRadius:12,background:'#10151b',color:'white',fontWeight:800}}>BACK TO STREETVERSE</button>
  </div>
 </div>
}
