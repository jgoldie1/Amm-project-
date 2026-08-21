import { useMemo, useState } from 'react'
import { GLOBAL_REGIONS, MONTHLY_GAME_RELEASES, GLOBAL_APP_FLOW, HOLOGPT_OVERLAY_CONTRACT } from '../global/GlobalMonthlyLaunchEngine'

const cyan='#4FE3FF',gold='#E8B944'
const openGlobal=(name:string)=>{const fn=(window as any)[name];if(typeof fn==='function')fn()}

export default function GlobalMonthlyLaunchPanel(){
  const [regionId,setRegionId]=useState('usa')
  const [cycle,setCycle]=useState(1)
  const region=useMemo(()=>GLOBAL_REGIONS.find(r=>r.id===regionId)??GLOBAL_REGIONS[0],[regionId])
  const release=MONTHLY_GAME_RELEASES[(cycle-1)%MONTHLY_GAME_RELEASES.length]
  const launch=()=>{
    if(release.game==='StreetVerse') openGlobal('__showGameVerse')
    else if(release.game==='Reality Lab') openGlobal('__showImmersiveWorlds')
    else if(release.game==='StarVerse') window.dispatchEvent(new CustomEvent('tryamm:music-open',{detail:{source:'monthly-release',region:region.id}}))
    else openGlobal('__showGameVerse')
  }
  const askHolo=()=>{
    window.dispatchEvent(new CustomEvent('tryamm:hologpt-open',{detail:{source:'global-monthly-launch',region:region.id,game:release.game,cycle}}))
    openGlobal('__showBennie')
  }
  return <section aria-label="Global monthly launch" style={{marginTop:24,border:'1px solid #1f4054',borderRadius:24,padding:20,background:'linear-gradient(145deg,#071621,#070910)',color:'#fff'}}>
    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.2fr) minmax(260px,.8fr)',gap:18}}>
      <div>
        <div style={{color:cyan,fontSize:10,fontWeight:950,letterSpacing:3}}>GLOBAL RELEASE ENGINE</div>
        <h2 style={{margin:'7px 0 8px',fontSize:30}}>One featured game every release month.</h2>
        <p style={{color:'#a8b7c7',lineHeight:1.55,marginTop:0}}>Launch Month {cycle}: <b style={{color:'#fff'}}>{release.game}</b> — {release.theme}. StreetVerse is Month 1, then TRYAMM rotates a new featured experience while previous worlds stay available.</p>
        <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'12px 0'}}>
          <button onClick={launch} style={{border:0,borderRadius:12,padding:'13px 17px',fontWeight:1000,background:`linear-gradient(135deg,${cyan},#76a8ff)`,color:'#031018',cursor:'pointer'}}>{release.cta}</button>
          <button onClick={askHolo} style={{border:`1px solid ${gold}88`,borderRadius:12,padding:'13px 17px',fontWeight:1000,background:'#211907',color:'#ffe49b',cursor:'pointer'}}>✦ ASK HOLOGPT</button>
        </div>
        <small style={{color:'#7f91a6'}}>{GLOBAL_APP_FLOW}</small>
      </div>
      <div style={{display:'grid',gap:10}}>
        <label style={{fontSize:10,fontWeight:900,color:gold,letterSpacing:1}}>YOUR REGION</label>
        <select value={regionId} onChange={e=>setRegionId(e.target.value)} style={{padding:12,borderRadius:12,border:'1px solid #2a465c',background:'#09111b',color:'#fff'}}>{GLOBAL_REGIONS.map(r=><option key={r.id} value={r.id}>{r.label}</option>)}</select>
        <div style={{fontSize:11,color:'#9fb0c3',lineHeight:1.5}}>{region.markets.join(' • ')}</div>
        <label style={{fontSize:10,fontWeight:900,color:gold,letterSpacing:1,marginTop:4}}>RELEASE MONTH</label>
        <select value={cycle} onChange={e=>setCycle(Number(e.target.value))} style={{padding:12,borderRadius:12,border:'1px solid #2a465c',background:'#09111b',color:'#fff'}}>{MONTHLY_GAME_RELEASES.map(r=><option key={r.month} value={r.month}>Month {r.month} — {r.game}</option>)}</select>
        <div style={{fontSize:10,color:'#6f8298'}}>HoloGPT: {HOLOGPT_OVERLAY_CONTRACT.jobs.slice(0,4).join(' • ')}</div>
      </div>
    </div>
    <style>{`@media(max-width:760px){section[aria-label="Global monthly launch"]>div{grid-template-columns:1fr!important}}`}</style>
  </section>
}
