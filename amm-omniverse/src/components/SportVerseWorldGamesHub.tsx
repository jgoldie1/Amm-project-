import {useMemo,useState} from 'react'
import {SPORTVERSE_WORLD_GAMES,SPORTVERSE_WORLD_GAMES_SPORTS,requestSportVerseWorldGamesEvent,type SportVerseSportModule} from '../data/sportVerseWorldGames'

const STATUS:Record<SportVerseSportModule['foundation'],string>={
 'reuse-existing':'REUSE READY',
 'shared-physics':'SHARED ENGINE',
 'new-module':'MODULE NEEDED',
}

export default function SportVerseWorldGamesHub({onClose}:{onClose:()=>void}){
 const [selected,setSelected]=useState(SPORTVERSE_WORLD_GAMES_SPORTS[0])
 const [filter,setFilter]=useState<'all'|SportVerseSportModule['foundation']>('all')
 const visible=useMemo(()=>filter==='all'?SPORTVERSE_WORLD_GAMES_SPORTS:SPORTVERSE_WORLD_GAMES_SPORTS.filter(s=>s.foundation===filter),[filter])
 const reuseCount=SPORTVERSE_WORLD_GAMES_SPORTS.filter(s=>s.foundation==='reuse-existing').length
 const sharedCount=SPORTVERSE_WORLD_GAMES_SPORTS.filter(s=>s.foundation==='shared-physics').length
 const enter=()=>{
  if(selected.adapter==='streetverse-pool'){window.dispatchEvent(new CustomEvent('tryamm:pool-open',{detail:{poolId:'sportverse-world-games-pool',source:'sportverse-world-games'}}));return}
  if(selected.adapter==='circle-park-tennis'){window.dispatchEvent(new CustomEvent('tryamm:circle-park-activity',{detail:{activity:'tennis',mode:'rally',source:'sportverse-world-games'}}));return}
  requestSportVerseWorldGamesEvent('sport-selected',{sportId:selected.id,adapter:selected.adapter,foundation:selected.foundation})
 }
 return <section aria-label="SportVerse World Games" style={{position:'fixed',inset:0,zIndex:49000,overflow:'auto',padding:'max(14px,env(safe-area-inset-top)) 14px 90px',background:'radial-gradient(circle at 50% 0,#123345,#061018 48%,#02070b)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><small style={{fontWeight:950,color:'#7be9ff',letterSpacing:2}}>SPORTVERSE • SHARED ATHLETE ENGINE</small><h1 style={{margin:'4px 0'}}>WORLD GAMES</h1></div><button onClick={onClose} aria-label="Close World Games" style={{width:46,height:46,borderRadius:23,fontSize:22}}>×</button></header>
  <p style={{maxWidth:760,color:'#b9c8d5'}}>One athlete identity • training • qualifiers • finals • medals • LIVE/PK • Replay/Reels • accessibility • creator attribution • server-validated rewards.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,margin:'12px 0'}}>
   <button onClick={()=>setFilter('reuse-existing')} style={{minHeight:50,borderRadius:12,fontWeight:950}}>REUSE READY • {reuseCount}</button>
   <button onClick={()=>setFilter('shared-physics')} style={{minHeight:50,borderRadius:12,fontWeight:950}}>SHARED ENGINE • {sharedCount}</button>
   <button onClick={()=>setFilter('all')} style={{minHeight:50,borderRadius:12,fontWeight:950}}>ALL • {SPORTVERSE_WORLD_GAMES_SPORTS.length}</button>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'minmax(220px,.85fr) minmax(0,1.15fr)',gap:12}} className="sportverse-world-games-layout">
   <nav aria-label="World Games sports" style={{display:'grid',gap:6,alignContent:'start',maxHeight:'68vh',overflow:'auto'}}>
    {visible.map(s=><button key={s.id} onClick={()=>setSelected(s)} style={{minHeight:48,padding:'8px 10px',borderRadius:12,textAlign:'left',border:selected.id===s.id?'2px solid #7be9ff':'1px solid #244052',background:'#081721',color:'#fff'}}><strong>{s.label}</strong><small style={{display:'block',marginTop:2,color:s.foundation==='reuse-existing'?'#8cffb2':s.foundation==='shared-physics'?'#ffe38a':'#b7c0c9'}}>{STATUS[s.foundation]}{s.adapter?' • '+s.adapter:''}</small></button>)}
   </nav>
   <article style={{border:'1px solid #29465a',borderRadius:18,padding:16,background:'#07121b'}}>
    <small style={{color:'#7be9ff',fontWeight:950}}>{selected.family.toUpperCase()} • {STATUS[selected.foundation]}</small><h2 style={{fontSize:'clamp(28px,5vw,48px)',margin:'6px 0 10px'}}>{selected.label}</h2>
    <h3>COMPETITION</h3><p>{SPORTVERSE_WORLD_GAMES.competitionFlow.join(' → ')}</p>
    <h3>MODES</h3><p>{selected.modes.join(' • ')}</p>
    <h3>ACCESSIBILITY</h3><p>{selected.accessibility.join(' • ')}</p>
    <button onClick={enter} style={{width:'100%',minHeight:54,borderRadius:13,fontWeight:950,marginTop:10}}>{selected.foundation==='reuse-existing'?'ENTER / REUSE FOUNDATION':'OPEN SPORT MODULE'}</button>
    <div style={{marginTop:12,padding:10,border:'1px solid #32434f',borderRadius:12,fontSize:11,color:'#aebbc5'}}>Public branding uses original TRYAMM World Games identity. The earlier Olympic Kingdom concept is preserved as a design foundation, not an official Olympic affiliation.</div>
   </article>
  </div>
  <style>{'@media(max-width:760px){.sportverse-world-games-layout{grid-template-columns:1fr!important}.sportverse-world-games-layout nav{max-height:36vh!important}}'}</style>
 </section>
}
