import {lazy,Suspense,useState} from 'react'
import {STAR_STUDIO_MASTER_FLOW,STAR_STUDIO_PILLARS,STAR_STUDIO_CROSSOVER,type StarStudioPillarId} from '../data/StarStudioUniverseRegistry'

const MusicCreatorStudio=lazy(()=>import('./MusicCreatorStudio'))
const MovieStudioCenter=lazy(()=>import('./MovieStudioCenter'))
const JacobieVisionCenter=lazy(()=>import('./JacobieVisionCenter'))
const IllinoisCampusVerseNetwork=lazy(()=>import('./IllinoisCampusVerseNetwork'))

export default function StarStudioCenter({onClose}:{onClose:()=>void}){
 const [active,setActive]=useState<StarStudioPillarId|null>(null)
 const launch=(id:StarStudioPillarId)=>{
  if(id==='starverse'){window.location.href='/starverse';return}
  if(id==='isaiah-tv'){window.location.href='/isaiah-ai-tv';return}
  if(id==='all-american-network'){window.location.href='/network';return}
  if(id==='jacobie-real-estate'){setActive('jacobie-vision');window.dispatchEvent(new CustomEvent('tryamm:star-studio-intent',{detail:{target:'jacobie-real-estate',openFlipLab:true}}));return}
  setActive(id)
 }
 if(active==='movie-studio')return <Suspense fallback={null}><MovieStudioCenter onClose={()=>setActive(null)}/></Suspense>
 if(active==='jacobie-vision')return <Suspense fallback={null}><JacobieVisionCenter onClose={()=>setActive(null)}/></Suspense>
 return <div role='dialog' aria-modal='true' aria-label='STAR STUDIO' style={{position:'fixed',inset:0,zIndex:13000,background:'radial-gradient(circle at 50% 0,#28205c,#070914 58%)',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}>
  <div style={{maxWidth:1180,margin:'0 auto',padding:'20px 14px 90px'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start'}}><div><div style={{fontSize:10,letterSpacing:3,color:'#ffd75e',fontWeight:950}}>ANYONE CAN BE A STAR</div><h1 style={{fontSize:'clamp(42px,8vw,82px)',lineHeight:.9,margin:'8px 0'}}>STAR STUDIO</h1><p style={{maxWidth:830,color:'#bcc6d6',lineHeight:1.6}}>One front door into the creator systems already built across TRYAMM: music, acting, talent discovery, movies, broadcasting, campus productions, cybersecurity and real-estate storytelling.</p></div><button onClick={onClose} style={close}>×</button></header>
   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(245px,1fr))',gap:10,marginTop:18}}>{STAR_STUDIO_PILLARS.map(p=><button key={p.id} onClick={()=>launch(p.id)} style={card}><div style={{fontSize:9,color:'#83e8ff',fontWeight:950}}>{p.owner.toUpperCase()} • {p.kind.toUpperCase()}</div><h2 style={{margin:'7px 0',fontSize:18}}>{p.label}</h2><div style={{fontSize:10,color:'#a9b8c9',lineHeight:1.5}}>{p.outputs.join(' • ')}</div><div style={{marginTop:10,fontSize:9,color:'#8affb5',fontWeight:900}}>OPEN EXISTING SYSTEM →</div></button>)}</section>
   {active==='aniyah-64'&&<section style={section}><div style={sectionHead}>ANIYAH • 64-TRACK STUDIO</div><Suspense fallback={null}><MusicCreatorStudio/></Suspense><button onClick={()=>setActive(null)} style={back}>← STAR STUDIO</button></section>}
   {active==='campusverse'&&<section style={section}><div style={sectionHead}>CAMPUSVERSE • CREATOR / TALENT PIPELINE</div><Suspense fallback={null}><IllinoisCampusVerseNetwork/></Suspense><button onClick={()=>setActive(null)} style={back}>← STAR STUDIO</button></section>}
   <section style={{...section,marginTop:14}}><div style={sectionHead}>ONE CREATOR PIPELINE</div><div style={{display:'grid',gap:6,marginTop:10}}>{STAR_STUDIO_MASTER_FLOW.map((x,i)=><div key={x} style={{padding:10,borderRadius:11,background:'#0b1220',border:'1px solid #26374e',fontSize:11}}><b style={{color:'#ffd75e'}}>{i+1}.</b> {x}</div>)}</div></section>
   <section style={{...section,marginTop:14}}><div style={sectionHead}>CROSSOVER THAT ALREADY MAKES THIS DIFFERENT</div><p style={copy}>{STAR_STUDIO_CROSSOVER.aniyah}</p><p style={copy}>{STAR_STUDIO_CROSSOVER.campusVerse}</p><p style={copy}>{STAR_STUDIO_CROSSOVER.cyberSecurity}</p><p style={copy}>{STAR_STUDIO_CROSSOVER.realEstate}</p></section>
  </div>
 </div>
}
const card:React.CSSProperties={textAlign:'left',padding:14,border:'1px solid #344969',borderRadius:16,background:'linear-gradient(150deg,#0d1728,#080b14)',color:'#fff',cursor:'pointer'}
const section:React.CSSProperties={padding:14,border:'1px solid #2d405b',borderRadius:18,background:'#090e18'}
const sectionHead:React.CSSProperties={fontSize:10,letterSpacing:2,color:'#8cecff',fontWeight:950}
const copy:React.CSSProperties={fontSize:11,color:'#a9b8c9',lineHeight:1.6}
const close:React.CSSProperties={width:44,height:44,borderRadius:'50%',border:'1px solid #455873',background:'#0b1120',color:'#fff',fontSize:24}
const back:React.CSSProperties={marginTop:10,minHeight:40,borderRadius:10,border:'1px solid #4fe3ff66',background:'#0a1a28',color:'#fff',fontWeight:900,padding:'0 12px'}