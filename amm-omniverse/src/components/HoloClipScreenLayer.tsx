import {useMemo,useRef,useState} from 'react'
import {HOLOGRAPHIC_CAROUSEL_PANELS} from '../holo/holoClip2'

type Props={
  open:boolean
  onClose:()=>void
  onLaunch?:(panel:string)=>void
}

const LABELS:Record<string,string>={
  FAITHVERSE:'FaithVerse',CHARACTERS:'Characters',MISSIONS:'Missions',LIVE:'LIVE',PK:'PK Battle',REELS:'Reels',
  STREETVERSE_WORLD:'StreetVerse',VERSE_DIRECTORY:'All Verses',TIME_MACHINE:'Time Machine',WORLD_DATA:'World Data',CREATOR_COMMERCE:'Creator Commerce',
  BENNY_HOLOGPT:'Benny / HoloGPT',RELEASE_CENTER:'Release Center',
}

export default function HoloClipScreenLayer({open,onClose,onLaunch}:Props){
  const panels=useMemo(()=>[...HOLOGRAPHIC_CAROUSEL_PANELS],[])
  const [active,setActive]=useState(0)
  const [depth,setDepth]=useState(true)
  const pointerStart=useRef<number|null>(null)
  const swiped=useRef(false)
  if(!open)return null
  const rotate=(delta:number)=>setActive(index=>(index+delta+panels.length)%panels.length)
  const startSwipe=(event:any)=>{pointerStart.current=event.clientX;swiped.current=false}
  const finishSwipe=(event:any)=>{const start=pointerStart.current;pointerStart.current=null;if(start===null)return;const dx=event.clientX-start;if(Math.abs(dx)<42)return;swiped.current=true;rotate(dx<0?1:-1)}
  return <div role="dialog" aria-modal="true" aria-label="Holo Clip 2.0 display" style={{position:'fixed',inset:0,zIndex:18000,background:'radial-gradient(circle at 50% 35%,#12364a 0%,#06111c 36%,#02050a 78%)',color:'#fff',overflow:'hidden'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 16px'}}>
      <div><div style={{fontSize:10,letterSpacing:3,color:'#6ee7ff',fontWeight:900}}>TRYAMM SPATIAL DISPLAY</div><b>Holo Clip 2.0</b></div>
      <div style={{display:'flex',gap:8}}><button onClick={()=>setDepth(v=>!v)} aria-pressed={depth}>{depth?'Depth On':'Depth Off'}</button><button onClick={onClose}>Close</button></div>
    </header>
    <main onPointerDown={startSwipe} onPointerUp={finishSwipe} onPointerCancel={()=>{pointerStart.current=null}} style={{height:'calc(100% - 68px)',display:'grid',placeItems:'center',perspective:1000,touchAction:'pan-y'}}>
      <section aria-label="Holographic carousel" style={{position:'relative',width:'min(88vw,720px)',height:'min(66vh,520px)',transformStyle:'preserve-3d'}}>
        {panels.map((panel,index)=>{
          const offset=((index-active+panels.length)%panels.length);const signed=offset>panels.length/2?offset-panels.length:offset
          const near=Math.abs(signed)<=2
          if(!near)return null
          const x=signed*190;const z=depth?-Math.abs(signed)*150:0;const scale=signed===0?1:.78;const opacity=signed===0?1:.48
          return <button key={panel} onClick={()=>{if(swiped.current){swiped.current=false;return}signed===0?onLaunch?.(panel):setActive(index)}} aria-current={signed===0?'true':undefined} style={{position:'absolute',left:'50%',top:'50%',width:220,height:300,marginLeft:-110,marginTop:-150,transform:`translate3d(${x}px,0,${z}px) scale(${scale}) rotateY(${depth?signed*-14:0}deg)`,transition:'transform .35s ease, opacity .35s ease',opacity,border:signed===0?'1px solid #72efff':'1px solid #28485c',borderRadius:24,background:'linear-gradient(180deg,rgba(21,61,82,.94),rgba(4,14,24,.96))',boxShadow:signed===0?'0 0 42px rgba(77,225,255,.24)':'none',color:'#fff',textAlign:'left',padding:18}}>
            <span style={{fontSize:10,color:'#6ee7ff',letterSpacing:2}}>HOLO PANEL {String(index+1).padStart(2,'0')}</span><h2>{LABELS[panel]??panel}</h2><p style={{color:'#a9c2d0'}}>Focus this surface inside the Holo Clip screen layer.</p>{signed===0&&<strong>Tap to open →</strong>}
          </button>
        })}
      </section>
      <div aria-live="polite" style={{position:'absolute',bottom:72,left:12,right:12,textAlign:'center',fontSize:10,fontWeight:900,letterSpacing:1.2,color:'#8fdfff'}}>SWIPE LEFT / RIGHT • {active+1} / {panels.length} • {LABELS[panels[active]]??panels[active]}</div>
      <nav aria-label="Holo Clip carousel controls" style={{position:'absolute',bottom:20,display:'flex',gap:10,alignItems:'center'}}><button onPointerDown={e=>e.stopPropagation()} onClick={()=>rotate(-1)}>← Previous</button><div aria-label={`Panel ${active+1} of ${panels.length}`} style={{display:'flex',gap:5}}>{panels.map((panel,index)=><button key={panel} onPointerDown={e=>e.stopPropagation()} aria-label={`Open ${LABELS[panel]??panel}`} aria-current={index===active?'true':undefined} onClick={()=>setActive(index)} style={{width:index===active?18:8,height:8,padding:0,border:0,borderRadius:999,background:index===active?'#72efff':'#35566a',transition:'width .2s ease'}} />)}</div><button onPointerDown={e=>e.stopPropagation()} onClick={()=>rotate(1)}>Next →</button></nav>
    </main>
  </div>
}
