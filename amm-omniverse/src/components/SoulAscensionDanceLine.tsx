import {useEffect,useMemo,useState,type CSSProperties} from 'react'
import {createPortal} from 'react-dom'
import {SOUL_ASCENSION_DANCES,SOUL_ASCENSION_ERAS,SOUL_ASCENSION_RULES,type SoulAscensionEra,type SoulAscensionDanceMove} from '../data/SoulAscensionDanceArchive'

const button:CSSProperties={minHeight:46,borderRadius:12,border:'1px solid #aa91ff77',color:'#fff',background:'#251638',fontWeight:850,padding:'8px 12px',touchAction:'manipulation'}
const ERA_OPTIONS=['all',...SOUL_ASCENSION_ERAS] as const

export default function SoulAscensionDanceLine({onClose}:{onClose:()=>void}){
 const [era,setEra]=useState<'all'|SoulAscensionEra>('all')
 const [query,setQuery]=useState('')
 const [selectedId,setSelectedId]=useState(SOUL_ASCENSION_DANCES[0].id)
 const [page,setPage]=useState(0)
 const [status,setStatus]=useState('Select a move to study. Grooves use stand-in BJ motions until the correct animation is licensed and retargeted.')
 const filtered=useMemo(()=>SOUL_ASCENSION_DANCES.filter(move=>
  (era==='all'||move.featuredEra===era)&&
  (move.name+' '+move.featuredEra+' '+move.category).toLowerCase().includes(query.toLowerCase())
 ),[era,query])
 const selected=SOUL_ASCENSION_DANCES.find(move=>move.id===selectedId)||SOUL_ASCENSION_DANCES[0]
 const limit=16
 const pages=Math.max(1,Math.ceil(filtered.length/limit))
 const visiblePage=Math.min(page,pages-1)
 useEffect(()=>{
  const onResult=(e:Event)=>{
   const d=(e as CustomEvent<{actionId?:string;played?:boolean;mode?:string;reason?:string}>).detail||{}
   if(d.actionId!==selected.previewGestureId)return
   setStatus(d.played?`BJ GROOVE PREVIEW • ${d.mode?.toUpperCase()||'GESTURE'} PLAYED • not certified ${selected.name} choreography`
    :`BJ MOTION NOT AVAILABLE • ${d.reason||'rig/clip missing'}`)
  }
  window.addEventListener('tryamm:streetverse-rp-action-result',onResult)
  return()=>window.removeEventListener('tryamm:streetverse-rp-action-result',onResult)
 },[selected.previewGestureId,selected.name])
 const cue=(move:SoulAscensionDanceMove)=>{
  setSelectedId(move.id)
  setStatus('REQUESTED • '+move.name+' • attempting a generic stand-in groove, not its original choreography.')
  window.dispatchEvent(new CustomEvent('tryamm:soul-ascension-dance-cue',{detail:{
   moveId:move.id,moveName:move.name,featuredEra:move.featuredEra,
   stage:'virtual-dance-line',exactChoreographyVerified:false,source:'soul-ascension-dance-line'
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-rp-action-play',{detail:{
   actionId:move.previewGestureId,loop:true,source:'soul-ascension-stand-in-groove'
  }}))
 }
 const openReel=()=>{
  window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{
   source:'soul-ascension-dance-line',moveId:selected.id,moveName:selected.name,
   missionId:'soul-ascension-dance-line',referenceOnly:true
  }}))
  setStatus('REEL CREATOR REQUESTED • verify recording and permissions before publishing.')
 }
 return createPortal(<section role="dialog" aria-label="Soul Ascension dance archive and virtual dance line"
  style={{position:'fixed',inset:0,zIndex:71000,background:'linear-gradient(150deg,#150f25,#070b14 55%,#281128)',color:'#faf3ff',
  padding:'max(14px,env(safe-area-inset-top)) 12px max(24px,env(safe-area-inset-bottom))',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
  <header style={{display:'flex',alignItems:'start',justifyContent:'space-between',gap:8}}>
   <div>
    <div style={{fontSize:10,letterSpacing:2,color:'#d8bbff',fontWeight:900}}>THE SOUL ASCENSION AWARDS • METAVERSE JAM</div>
    <h2 style={{fontSize:24,margin:'5px 0 0'}}>🪩 SOUL ASCENSION DANCE LINE</h2>
    <p style={{fontSize:12,color:'#d5c1e9',margin:'6px 0'}}>1980s–present • {SOUL_ASCENSION_DANCES.length} dance-reference cues • inclusive global performances</p>
   </div>
   <button type="button" aria-label="Close Soul Ascension dance line" onClick={onClose} style={button}>CLOSE ×</button>
  </header>
  <div style={{background:'#321b3b',border:'1px solid #ba8fff88',padding:12,borderRadius:15,margin:'13px 0 10px'}}>
   <div style={{fontSize:11,fontWeight:900,color:'#ffddad'}}>VIRTUAL DANCE LINE • PREVIEW STAGE</div>
   <div style={{fontSize:18,fontWeight:900,margin:'5px 0'}}>{selected.name}</div>
   <div style={{fontSize:10,color:'#d6c6e9'}}>Featured era {selected.featuredEra} • BJ preview: {selected.previewGestureId.replaceAll('-',' ')}</div>
   <p style={{fontSize:11,lineHeight:1.5}}>This is a choreographic reference. The current PLAY command attempts a general 3D groove; it does not claim a faithful rendition of the named dance.</p>
   <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
    <button onClick={()=>cue(selected)} style={{...button,background:'#482b71'}}>🎭 PREVIEW BJ GROOVE</button>
    <button onClick={openReel} style={button}>🎥 OPEN REEL CREATOR</button>
   </div>
   <div role="status" aria-label="Soul Ascension animation result" style={{marginTop:10,padding:9,borderRadius:10,background:'#120e23',border:'1px solid #ac8eff77',fontSize:11}}>{status}</div>
  </div>
  <div style={{display:'flex',overflowX:'auto',gap:6,paddingBottom:8}} aria-label="Dance decade filters">
   {ERA_OPTIONS.map(item=><button key={item} aria-pressed={era===item} onClick={()=>{setEra(item);setPage(0)}}
    style={{...button,minWidth:74,background:era===item?'#5a3988':'#241a35'}}>{item==='all'?'ALL ERAS':item}</button>)}
  </div>
  <input type="search" aria-label="Search Soul Ascension dance moves" value={query}
   onChange={e=>{setQuery(e.target.value);setPage(0)}} placeholder="Search moves, eras or style..."
   style={{width:'100%',minHeight:48,borderRadius:11,padding:'0 12px',fontSize:16,
   background:'#110d1d',color:'#fff',border:'1px solid #ae89dd',marginBottom:8}}/>
  <div style={{fontSize:11,color:'#ceb5e1',marginBottom:7}}>{filtered.length} reference movements • styles span decades; featured era is not necessarily the origin year</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(142px,1fr))',gap:7}}>
   {filtered.slice(visiblePage*limit,(visiblePage+1)*limit).map(move=><button type="button" key={move.id}
     aria-pressed={selected.id===move.id} onClick={()=>setSelectedId(move.id)}
     style={{...button,textAlign:'left',minHeight:65,border:selected.id===move.id?'2px solid #ffe0a0':'1px solid #78559a'}}>
      <div style={{fontSize:12,fontWeight:900}}>{move.name}</div>
      <div style={{fontSize:10,color:'#d5bbeb',marginTop:3}}>{move.featuredEra} • {move.category.replaceAll('-',' ')}</div>
     </button>)}
  </div>
  <nav aria-label="Soul Ascension archive pages" style={{display:'flex',justifyContent:'space-between',gap:9,alignItems:'center',marginTop:10}}>
   <button style={button} disabled={visiblePage===0} onClick={()=>setPage(n=>Math.max(0,n-1))}>‹ PREVIOUS</button>
   <span style={{fontSize:11}}>PAGE {visiblePage+1} / {pages}</span>
   <button style={button} disabled={visiblePage===pages-1} onClick={()=>setPage(n=>Math.min(pages-1,n+1))}>NEXT ›</button>
  </nav>
  <p style={{fontSize:10,lineHeight:1.5,color:'#baa9c9',marginTop:12}}>
   {SOUL_ASCENSION_RULES.musicRights} Exact dance choreography and artist-specific performances require approved motions,
   rights review and animation tests. LIVE hosting, fan voting, ticket sales and AR/VR spaces remain separate development milestones.
   Shadow Box is reserved for the future boxing game.
  </p>
 </section>,document.body)
}
