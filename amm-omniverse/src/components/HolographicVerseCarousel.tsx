import {useMemo,useRef,useState} from 'react'
import {HOLOVERSE_DESTINATIONS,activateHoloDestination} from '../runtime/HoloverseCarouselRuntime'

const ICONS:Record<string,string>={
 faithverse:'📖',streetverse:'🏙',propertyverse:'🏠',holoverse:'◈',musicverse:'♫',starverse:'🌟',spaceverse:'🪐',cyberverse:'🛡',creatorverse:'🎬',sportverse:'🏆',businessverse:'💼','marketplaceverse':'🛍',educationverse:'🎓',gameverse:'🎮',middleverse:'💻',metaverse:'◎',multiverse:'∞','time-machine':'⏳',legacyverse:'🧬',kingdom:'👑','my-world':'🌎','we-are-the-world':'🌐',omniverse:'✦'
}

export default function HolographicVerseCarousel(){
 const [index,setIndex]=useState(()=>Math.max(0,HOLOVERSE_DESTINATIONS.findIndex(x=>x.id==='streetverse')))
 const startX=useRef<number|null>(null)
 const selected=HOLOVERSE_DESTINATIONS[index]||HOLOVERSE_DESTINATIONS[0]
 const visible=useMemo(()=>{const len=HOLOVERSE_DESTINATIONS.length;return [-2,-1,0,1,2].map(offset=>HOLOVERSE_DESTINATIONS[(index+offset+len)%len])},[index])
 const move=(delta:number)=>setIndex(i=>(i+delta+HOLOVERSE_DESTINATIONS.length)%HOLOVERSE_DESTINATIONS.length)
 const select=(id:string)=>{const i=HOLOVERSE_DESTINATIONS.findIndex(x=>x.id===id);if(i>=0)setIndex(i)}
 const launch=()=>activateHoloDestination(selected.id)
 const onPointerDown=(e:React.PointerEvent)=>{startX.current=e.clientX}
 const onPointerUp=(e:React.PointerEvent)=>{if(startX.current===null)return;const d=e.clientX-startX.current;startX.current=null;if(Math.abs(d)>38)move(d<0?1:-1)}
 return <section aria-label="Holographic Verse Carousel" style={shell} onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
  <style>{'@keyframes verseFloat{50%{transform:translateY(-7px)}}@keyframes verseGlow{50%{box-shadow:0 0 60px #4fe3ff77, inset 0 0 42px #6e6bff2e}}@keyframes verseScan{from{transform:translateY(-120%)}to{transform:translateY(560%)}}'}</style>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap'}}>
   <div><div style={{fontSize:9,letterSpacing:3,color:'#6cecff',fontWeight:950}}>TRYAMM HOLOGRAPHIC VERSE DISPLAY</div><h2 style={{margin:'4px 0 0'}}>All 23 Verses • One Connected World</h2></div>
   <button onClick={()=>dispatchEvent(new CustomEvent('tryamm:verse-radio-open',{detail:{source:'holographic-verse-carousel'}}))} style={smallButton}>♫ VERSE RADIO</button>
  </div>
  <div style={display}>
   <div style={scan}/>
   <div style={orb}><span style={{fontSize:58,filter:'drop-shadow(0 0 18px #78eaff)'}}>{ICONS[selected.id]||'◈'}</span></div>
   <div style={{textAlign:'center',position:'relative',zIndex:2}}>
    <div style={{fontSize:'clamp(24px,5vw,46px)',fontWeight:1000,textShadow:'0 0 22px #4fe3ff88'}}>{selected.label}</div>
    <div style={{marginTop:6,fontSize:9,fontWeight:950,letterSpacing:2,color:selected.status==='LIVE'?'#7dffb1':selected.status==='BUILDING'?'#ffd06f':'#c7a8ff'}}>{selected.status}</div>
    <p style={{maxWidth:650,margin:'10px auto 0',fontSize:11,lineHeight:1.55,color:'#b8cbd5'}}>{selected.purpose}</p>
    <div style={{display:'flex',justifyContent:'center',gap:7,marginTop:12,flexWrap:'wrap'}}><button onClick={()=>move(-1)} style={smallButton}>‹</button><button onClick={launch} style={enterButton}>ENTER {selected.label.toUpperCase()}</button><button onClick={()=>move(1)} style={smallButton}>›</button></div>
   </div>
  </div>
  <div style={rail}>{visible.map(item=><button key={item.id} onClick={()=>select(item.id)} style={{...card,borderColor:item.id===selected.id?'#6cecffaa':'#1f3a4d',opacity:item.id===selected.id?1:.64,transform:item.id===selected.id?'scale(1.04)':'scale(.96)'}}><div style={{fontSize:22}}>{ICONS[item.id]||'◈'}</div><div style={{fontSize:9,fontWeight:950,marginTop:5}}>{item.label}</div><div style={{fontSize:7,marginTop:3,color:item.status==='LIVE'?'#7dffb1':item.status==='BUILDING'?'#ffd06f':'#c7a8ff'}}>{item.status}</div></button>)}</div>
  <div style={{marginTop:8,fontSize:8,color:'#6f8592',textAlign:'center'}}>Swipe the hologram or use ‹ › • BUILDING means connected and reachable, but deeper content is still being completed.</div>
 </section>
}

const shell:React.CSSProperties={position:'relative',overflow:'hidden',padding:14,borderRadius:22,border:'1px solid #2f6f87',background:'radial-gradient(circle at 50% 20%,#08394b99,#06101b 48%,#02050a 100%)',boxShadow:'0 18px 70px #000a',touchAction:'pan-y'}
const display:React.CSSProperties={position:'relative',overflow:'hidden',minHeight:300,marginTop:12,padding:'34px 18px',display:'grid',placeItems:'center',borderRadius:20,border:'1px solid #3ecbe755',background:'radial-gradient(circle at 50% 48%,#35dfff1c,#090d1b 52%,#02050b)',animation:'verseGlow 2.6s ease-in-out infinite'}
const orb:React.CSSProperties={width:125,height:125,borderRadius:'50%',display:'grid',placeItems:'center',margin:'0 auto 15px',border:'2px solid #6cecff',boxShadow:'0 0 42px #4fe3ff99,inset 0 0 35px #7d4dff55',background:'radial-gradient(circle,#25d8ff33,#7b4bff18 45%,transparent 72%)',animation:'verseFloat 2.4s ease-in-out infinite'}
const scan:React.CSSProperties={position:'absolute',left:0,right:0,height:55,top:0,background:'linear-gradient(180deg,transparent,#7ff5ff20,transparent)',animation:'verseScan 3.8s linear infinite',pointerEvents:'none'}
const rail:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(5,minmax(82px,1fr))',gap:6,marginTop:9,overflow:'hidden'}
const card:React.CSSProperties={minHeight:78,padding:'8px 5px',border:'1px solid #1f3a4d',borderRadius:12,background:'#07121d',color:'#fff',transition:'180ms ease',touchAction:'manipulation'}
const smallButton:React.CSSProperties={minHeight:42,minWidth:44,padding:'8px 12px',borderRadius:11,border:'1px solid #4fe3ff66',background:'#09202d',color:'#fff',fontWeight:950,touchAction:'manipulation'}
const enterButton:React.CSSProperties={minHeight:44,padding:'9px 16px',borderRadius:12,border:'1px solid #8af4ffaa',background:'linear-gradient(135deg,#104556,#27205e)',color:'#fff',fontWeight:1000,boxShadow:'0 0 24px #4fe3ff33',touchAction:'manipulation'}