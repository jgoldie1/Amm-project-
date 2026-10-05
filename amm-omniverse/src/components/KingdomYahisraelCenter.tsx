import {lazy,Suspense} from 'react'
import {KINGDOM_RECOVERY_RULES,KINGDOM_YAHISRAEL_IDENTITY,KINGDOM_YAHISRAEL_PATH,KINGDOM_YAHISRAEL_PILLARS} from '../data/KingdomYahisraelRecoveryRegistry'

const LionOfJudahHolo=lazy(()=>import('./LionOfJudahHolo'))

const go=(route?:string)=>{if(route)window.location.href=route}

export default function KingdomYahisraelCenter(){
 return <main style={{minHeight:'100dvh',background:'radial-gradient(circle at 50% 0,#2a2110,#0a0c13 42%,#020408 78%)',color:'#fff',fontFamily:'system-ui',overflowX:'hidden'}}>
  <div style={{maxWidth:1180,margin:'0 auto',padding:'18px 14px 100px'}}>
   <nav style={{display:'flex',gap:7,flexWrap:'wrap'}}><a href='/' style={pill}>TRYAMM HOME</a><a href='/kingdom' style={pill}>PLAY KINGDOM</a><a href='/faithverse' style={pill}>FAITHVERSE</a><a href='/kingdoms-press' style={pill}>KINGDOMS PRESS</a><a href='/servants-of-christ' style={pill}>SERVANTS OF CHRIST</a></nav>
   <header style={{display:'grid',gridTemplateColumns:'minmax(0,1.3fr) minmax(240px,.7fr)',gap:18,alignItems:'center',padding:'28px 0 20px'}}>
    <div><div style={{fontSize:10,letterSpacing:3,color:'#e8b944',fontWeight:950}}>JUDAH • YAHISRAEL • TRYAMM LIVING KINGDOM</div><h1 style={{fontSize:'clamp(46px,8vw,94px)',lineHeight:.88,margin:'10px 0'}}>KINGDOM OF<br/>YAHISRAEL</h1><div style={{fontSize:'clamp(19px,3vw,34px)',fontWeight:950,color:'#4fe3ff'}}>WHERE HEAVEN MEETS EARTH</div><p style={{maxWidth:760,fontSize:14,color:'#d4d8dc',lineHeight:1.7,marginTop:14}}>A recovered convergence of the Kingdom work already inside TRYAMM: Judah identity, FaithVerse, Scripture and Hebrew study, the playable Kingdom District, ministry and service, Kingdoms Press, Set Apart records, Seven Lights story canon, Living Worlds and broadcast.</p>
     <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><button onClick={()=>go('/kingdom')} style={primary}>👑 ENTER PLAYABLE KINGDOM</button><button onClick={()=>go('/faithverse')} style={secondary}>📖 OPEN FAITHVERSE</button></div>
    </div>
    <div style={{minHeight:330,border:'1px solid #4fe3ff44',borderRadius:26,overflow:'hidden',background:'#020212'}}><Suspense fallback={<div style={{padding:20}}>Loading Judah gate…</div>}><LionOfJudahHolo variant='preview'/></Suspense></div>
   </header>

   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))',gap:10,marginTop:10}}>{KINGDOM_YAHISRAEL_PILLARS.map((p,i)=><button key={p.id} onClick={()=>go(p.route)} disabled={!p.route} style={{...card,cursor:p.route?'pointer':'default',opacity:p.route?1:.9,textAlign:'left'}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><span style={{fontSize:9,color:'#e8b944',fontWeight:950}}>PILLAR {String(i+1).padStart(2,'0')}</span><span style={{fontSize:8,color:p.status==='existing'?'#8fffb0':p.status==='converging'?'#8feaff':'#ffd786'}}>{p.status.toUpperCase()}</span></div><h2 style={{fontSize:17,margin:'7px 0 3px'}}>{p.label}</h2><div style={{fontSize:10,color:'#8fdff4',fontWeight:900}}>{p.subtitle}</div><p style={muted}>{p.capabilities.join(' • ')}</p>{p.boundary&&<div style={{fontSize:8,color:'#ffd49b',lineHeight:1.45,borderTop:'1px solid #6c552b55',paddingTop:7}}>{p.boundary}</div>}{p.route&&<div style={{fontSize:9,color:'#4fe3ff',fontWeight:950,marginTop:8}}>OPEN EXISTING SYSTEM →</div>}</button>)}</section>

   <section style={{...card,marginTop:14,borderColor:'#796226'}}><div style={eyebrow}>ONE KINGDOM PATH</div><div style={{display:'grid',gap:6,marginTop:9}}>{KINGDOM_YAHISRAEL_PATH.map((x,i)=><div key={x} style={{padding:9,borderRadius:10,background:'#080d13',border:'1px solid #27384a',fontSize:10}}><b style={{color:'#e8b944'}}>{i+1}.</b> {x}</div>)}</div></section>

   <section style={{...card,marginTop:14}}><div style={eyebrow}>RECOVERY / INTEGRITY RULES</div><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:9}}>{KINGDOM_RECOVERY_RULES.map(x=><span key={x} style={pill}>{x.replaceAll('-',' ').toUpperCase()}</span>)}</div><p style={{...muted,marginTop:10}}>This front door does not declare every underlying provider or production asset live. It connects the recovered systems and keeps existing production gates visible while we finish the playable and content layers.</p></section>
  </div>
 </main>
}

const card:React.CSSProperties={padding:14,border:'1px solid #3d4a54',borderRadius:17,background:'linear-gradient(150deg,#0c1119,#080808)'}
const muted:React.CSSProperties={fontSize:10,color:'#b7c0c6',lineHeight:1.55}
const eyebrow:React.CSSProperties={fontSize:9,letterSpacing:2,color:'#4fe3ff',fontWeight:950}
const pill:React.CSSProperties={display:'inline-flex',alignItems:'center',minHeight:36,padding:'0 10px',border:'1px solid #685b32',borderRadius:999,background:'#151208',color:'#fff',fontSize:8,fontWeight:900,textDecoration:'none'}
const primary:React.CSSProperties={minHeight:48,padding:'0 14px',borderRadius:12,border:'1px solid #e8b944',background:'linear-gradient(135deg,#5a4207,#201807)',color:'#fff4bf',fontWeight:950}
const secondary:React.CSSProperties={minHeight:48,padding:'0 14px',borderRadius:12,border:'1px solid #4fe3ff88',background:'#08202a',color:'#fff',fontWeight:950}