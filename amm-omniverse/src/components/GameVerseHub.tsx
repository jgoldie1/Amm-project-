import { useMemo, useState } from 'react'

const cyan='#4FE3FF'
const gold='#E8B944'

type World={slug:string;name:string;icon:string;genre:string;status:'PROTOTYPE'|'PLANNED';summary:string;features:string[];entry:'sports'|'city'|'planned'}

export const GAMEVERSE_WORLDS:World[]=[
  {slug:'gridiron-x',name:'Gridiron X',icon:'🏈',genre:'Football',status:'PROTOTYPE',summary:'Football career, leagues, team play and Living Worlds events.',features:['Career progression','Team leagues','Creator events','Shared Passport'],entry:'sports'},
  {slug:'court-kings',name:'Court Kings',icon:'🏀',genre:'Basketball',status:'PROTOTYPE',summary:'Street and arena basketball with crews, seasons and creator events.',features:['Street courts','Arena play','Crews','Season progression'],entry:'sports'},
  {slug:'diamond-legends',name:'Diamond Legends',icon:'⚾',genre:'Baseball',status:'PLANNED',summary:'Baseball progression, teams, tournaments and persistent identity.',features:['Career mode','Team management','Tournaments','Shared progression'],entry:'sports'},
  {slug:'ice-storm',name:'Ice Storm',icon:'🏒',genre:'Hockey',status:'PLANNED',summary:'Fast team hockey with leagues, rivalries and arena presentation.',features:['Team hockey','Leagues','Rivalries','Arena events'],entry:'sports'},
  {slug:'world-pitch',name:'World Pitch',icon:'⚽',genre:'Global Football',status:'PLANNED',summary:'Clubs, international competition, street play and world tournaments.',features:['Clubs','Street football','World tournaments','Career progression'],entry:'sports'},
  {slug:'fight-night-holo',name:'Fight Night Holo',icon:'🥊',genre:'Boxing + Combat',status:'PROTOTYPE',summary:'Combat events with holographic presentation and explainable officiating.',features:['Boxing','Combat events','Holo presentation','Explainable officiating'],entry:'sports'},
  {slug:'streetverse',name:'StreetVerse',icon:'🌆',genre:'Open World',status:'PROTOTYPE',summary:'Living-city action, businesses, missions, reputation and social-world foundation.',features:['Living city','Businesses','Missions','Reputation'],entry:'city'},
  {slug:'battlefront-zero',name:'Battlefront Zero',icon:'🎯',genre:'Tactical Action',status:'PLANNED',summary:'Original tactical action with squads, objectives and cross-world progression.',features:['Squads','Objectives','Team tactics','Cross-world progression'],entry:'planned'},
  {slug:'yogihoo-arena',name:'Yogihoo Arena',icon:'✨',genre:'Creature Arena',status:'PLANNED',summary:'Original collectible-creature adventure and arena competition world.',features:['Creature collection','Arena battles','Exploration','Progression'],entry:'planned'},
  {slug:'volcano-racers',name:'Volcano Racers',icon:'🏎️',genre:'Racing',status:'PLANNED',summary:'Cars, bikes and future vehicle racing across reactive Living Worlds tracks.',features:['Cars','Bikes','Reactive tracks','Future vehicles'],entry:'planned'},
  {slug:'kingdom-builders',name:'Kingdom Builders',icon:'🏰',genre:'Build + Strategy',status:'PLANNED',summary:'Build, govern and evolve persistent kingdoms with economy and community systems.',features:['Construction','Governance','Economy','Persistent kingdoms'],entry:'planned'},
]

export default function GameVerseHub({onClose,onEnterSports,onEnterCity,initialWorld}:{onClose:()=>void;onEnterSports:()=>void;onEnterCity:()=>void;initialWorld?:string}){
  const initial=useMemo(()=>GAMEVERSE_WORLDS.find(w=>w.slug===initialWorld)||GAMEVERSE_WORLDS[0],[initialWorld])
  const [selected,setSelected]=useState(initial)
  const enter=()=>{ if(selected.entry==='sports')onEnterSports(); else if(selected.entry==='city')onEnterCity() }
  return <div role="dialog" aria-label="TRYAMM GameVerse" style={{position:'fixed',inset:0,zIndex:12000,background:'radial-gradient(circle at 50% 0,#12263b,#04050e 48%,#010205)',color:'#fff',overflowY:'auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1240,margin:'0 auto',padding:'20px 18px 90px'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:22}}><div><div style={{fontSize:10,color:cyan,fontWeight:950,letterSpacing:3}}>TRYAMM • LIVING WORLDS</div><h1 style={{margin:'5px 0 0',fontSize:'clamp(30px,5vw,54px)'}}>GameVerse Nexus</h1></div><button onClick={onClose} aria-label="Close GameVerse" style={{width:42,height:42,borderRadius:'50%',border:'1px solid #40516a',background:'#0c1320',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button></header>
      <div style={{display:'grid',gridTemplateColumns:'minmax(260px,.8fr) minmax(0,1.2fr)',gap:16}} className="gameverse-layout">
        <nav aria-label="11 Living Worlds" style={{display:'grid',gap:7,alignContent:'start'}}>{GAMEVERSE_WORLDS.map((world,i)=><button key={world.slug} onClick={()=>setSelected(world)} style={{display:'grid',gridTemplateColumns:'34px 1fr auto',alignItems:'center',gap:9,textAlign:'left',padding:11,border:`1px solid ${selected.slug===world.slug?cyan:'#18283a'}`,borderRadius:14,background:selected.slug===world.slug?'#0a202c':'#080d16',color:'#fff',cursor:'pointer'}}><span style={{fontSize:21}}>{world.icon}</span><span><span style={{display:'block',fontSize:9,color:'#748aa3'}}>WORLD {String(i+1).padStart(2,'0')} • {world.genre.toUpperCase()}</span><strong style={{fontSize:13}}>{world.name}</strong></span><span style={{fontSize:7,fontWeight:900,color:world.status==='PROTOTYPE'?gold:'#93a0b2'}}>{world.status}</span></button>)}</nav>
        <section style={{border:'1px solid #23374d',borderRadius:24,padding:'clamp(20px,4vw,38px)',background:'linear-gradient(150deg,#0b1625,#070910)',minHeight:520}}>
          <div style={{fontSize:58}}>{selected.icon}</div><div style={{fontSize:10,color:gold,fontWeight:950,letterSpacing:2,marginTop:15}}>{selected.genre.toUpperCase()} • {selected.status}</div><h2 style={{fontSize:'clamp(32px,5vw,58px)',margin:'8px 0 14px'}}>{selected.name}</h2><p style={{fontSize:16,color:'#afbdd0',lineHeight:1.6,maxWidth:720}}>{selected.summary}</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:9,marginTop:22}}>{selected.features.map(f=><div key={f} style={{border:'1px solid #203247',borderRadius:13,padding:12,background:'#0a111c',fontSize:12,color:'#dce7f5'}}>✦ {f}</div>)}</div>
          <div style={{marginTop:26,padding:16,border:'1px solid #2b3341',borderRadius:16,background:'#090c12',fontSize:12,color:'#98a9bd',lineHeight:1.55}}><strong style={{color:'#fff'}}>Shared-world contract:</strong> the long-term design uses one TRYAMM Passport for identity, progression, safety settings, creator attribution and future cross-world inventory. Prototype/planned labels are readiness indicators, not claims of complete online multiplayer.</div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:24}}><button onClick={enter} disabled={selected.entry==='planned'} style={{border:0,borderRadius:13,padding:'13px 18px',background:selected.entry==='planned'?'#252a33':`linear-gradient(135deg,${cyan},#77a7ff)`,color:selected.entry==='planned'?'#7e8998':'#04111a',fontWeight:950,cursor:selected.entry==='planned'?'not-allowed':'pointer'}}>{selected.entry==='planned'?'PLANNED — NOT PLAYABLE YET':'ENTER PROTOTYPE →'}</button><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:middleverse-open',{detail:{source:'gameverse',world:selected.slug}}))} style={{border:`1px solid ${gold}88`,borderRadius:13,padding:'13px 18px',background:'#201807',color:'#ffe49b',fontWeight:900,cursor:'pointer'}}>◈ SEND TO MIDDLEVERSE</button></div>
        </section>
      </div>
    </div><style>{`@media(max-width:800px){.gameverse-layout{grid-template-columns:1fr!important}}`}</style>
  </div>
}
