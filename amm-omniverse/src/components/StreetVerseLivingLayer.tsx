import { useEffect, useMemo, useRef, useState } from 'react'

type Pos={x:number;z:number;character?:string}
type Target={id:string;kind:'resident'|'business'|'vehicle'|'mission';label:string;copy:string;x:number;z:number;action:string}

const PROGRESS_KEY='tryamm.streetverse.living-layer.v2'
const TARGETS:Target[]=[
  {id:'studio',kind:'business',label:'Aniyah 64 Track Studio',copy:'Recording sessions, creator missions and Reel moments are active here.',x:-42,z:-30,action:'ENTER STUDIO'},
  {id:'market',kind:'business',label:'All American Marketplace',copy:'Shop, sell and discover StreetVerse businesses from this district.',x:42,z:-24,action:'OPEN MARKET'},
  {id:'network',kind:'business',label:'All American Network',copy:'Broadcast and creator publishing hub connected to TRYAMM LIVE.',x:38,z:38,action:'OPEN NETWORK'},
  {id:'after-dark',kind:'business',label:'Chicago After Dark',copy:'Nightlife district mission hub with creator and social events.',x:-38,z:38,action:'ENTER DISTRICT'},
  {id:'vehicle-01',kind:'vehicle',label:'StreetVerse Vehicle',copy:'A nearby procedural vehicle is ready for the driving interaction layer.',x:0,z:48,action:'ENTER VEHICLE'},
  {id:'resident-01',kind:'resident',label:'Chicago Resident',copy:'Resident awareness is active. Talk, receive local hints, and discover nearby missions.',x:0,z:18,action:'TALK'},
]

const lines=[
  'Welcome to StreetVerse. The city reacts to where you go now.',
  'Try the Marketplace or Creator Studio — both have district missions nearby.',
  'Traffic is live. Use the crosswalks and watch the signal cycle.',
  'Your Reel button can capture the StreetVerse canvas when the browser supports it.',
  'Explore the glowing checkpoints to complete District 01.',
  'You can build progress here without downloading any new asset pack.',
]

function loadProgress(){
  try{return JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}') as {visited?:string[];talks?:number;vehicleEntered?:boolean}}
  catch{return {}}
}
function nearestTarget(pos:Pos|null){
  if(!pos)return null
  let best:{target:Target;distance:number}|null=null
  for(const target of TARGETS){
    const distance=Math.hypot(pos.x-target.x,pos.z-target.z)
    if(!best||distance<best.distance)best={target,distance}
  }
  return best&&best.distance<15?best:null
}

export default function StreetVerseLivingLayer(){
  const initial=loadProgress()
  const [pos,setPos]=useState<Pos|null>(null)
  const [message,setMessage]=useState('CITY AWARENESS ONLINE')
  const [interaction,setInteraction]=useState('')
  const [quality,setQuality]=useState<'BALANCED'|'PERFORMANCE'>('BALANCED')
  const [visited,setVisited]=useState<string[]>(initial.visited||[])
  const [talks,setTalks]=useState(initial.talks||0)
  const [vehicleEntered,setVehicleEntered]=useState(Boolean(initial.vehicleEntered))
  const lastNear=useRef('')
  const near=useMemo(()=>nearestTarget(pos),[pos])
  const completed=visited.length

  useEffect(()=>{
    try{localStorage.setItem(PROGRESS_KEY,JSON.stringify({visited,talks,vehicleEntered,updatedAt:new Date().toISOString()}))}catch{}
  },[visited,talks,vehicleEntered])

  useEffect(()=>{
    const mobile=/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const lowThreads=(navigator.hardwareConcurrency||8)<=4
    if(mobile||lowThreads)setQuality('PERFORMANCE')
    const onPos=(event:Event)=>{
      const d=(event as CustomEvent<Pos>).detail
      if(Number.isFinite(d?.x)&&Number.isFinite(d?.z))setPos(d)
    }
    const onCaptured=()=>setMessage('REEL CAPTURED • READY TO SHARE')
    window.addEventListener('tryamm:streetverse-player-position',onPos)
    window.addEventListener('tryamm:streetverse-reel-captured',onCaptured)
    return()=>{
      window.removeEventListener('tryamm:streetverse-player-position',onPos)
      window.removeEventListener('tryamm:streetverse-reel-captured',onCaptured)
    }
  },[])

  useEffect(()=>{
    document.documentElement.dataset.streetverseQuality=quality.toLowerCase()
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-performance',{detail:{mode:quality.toLowerCase()}}))
  },[quality])

  useEffect(()=>{
    const id=near?.target.id||''
    if(id&&id!==lastNear.current){
      lastNear.current=id
      setMessage(`${near?.target.kind.toUpperCase()} NEARBY • ${near?.target.label}`)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-proximity',{detail:{...near?.target,distance:near?.distance}}))
    }
    if(!id)lastNear.current=''
  },[near])

  function markVisited(target:Target){
    if(target.kind!=='business'&&target.kind!=='mission')return
    setVisited(current=>current.includes(target.id)?current:[...current,target.id])
  }

  function interact(){
    if(!near){setInteraction('Move closer to a resident, vehicle, business, or mission marker.');return}
    const {target}=near
    if(target.kind==='resident'){
      const next=lines[talks%lines.length]
      setTalks(v=>v+1)
      setInteraction(`${target.label}: ${next}`)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-resident-talk',{detail:{label:target.label,text:next,x:pos?.x,z:pos?.z,talkNumber:talks+1}}))
      return
    }
    if(target.kind==='business'){
      markVisited(target)
      setInteraction(`${target.label}: ${target.copy}`)
      setMessage(`DISTRICT PROGRESS • ${Math.min(completed+1,4)}/4 LOCATIONS`)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-location-visited',{detail:{id:target.id,label:target.label,x:pos?.x,z:pos?.z}}))
      if(target.label.includes('Marketplace'))window.dispatchEvent(new CustomEvent('tryamm:streetverse-open-marketplace'))
      if(target.label.includes('Network'))window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse',destination:'all-american-network'}}))
      if(target.label.includes('Studio'))window.dispatchEvent(new CustomEvent('tryamm:streetverse-studio-enter',{detail:{source:'streetverse'}}))
      if(target.label.includes('After Dark'))window.dispatchEvent(new CustomEvent('tryamm:streetverse-after-dark-enter',{detail:{source:'streetverse'}}))
      return
    }
    if(target.kind==='vehicle'){
      const next=!vehicleEntered
      setVehicleEntered(next)
      setInteraction(next?'VEHICLE MODE • entered procedural vehicle interaction state.':'ON FOOT • exited vehicle interaction state.')
      setMessage(next?'DRIVING INTERACTION ACTIVE':'CITY AWARENESS ONLINE')
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{x:pos?.x,z:pos?.z,entered:next}}))
    }
  }

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{
      if((event.key==='e'||event.key==='E')&&!event.repeat){event.preventDefault();interact()}
    }
    window.addEventListener('keydown',onKey)
    return()=>window.removeEventListener('keydown',onKey)
  })

  return <>
    <div style={{position:'fixed',left:12,bottom:88,zIndex:16991,display:'grid',gap:6,pointerEvents:'none',fontFamily:'system-ui,sans-serif'}}>
      <div style={{padding:'7px 9px',borderRadius:999,background:'#04121ddd',border:'1px solid #4fe3ff66',color:'#bdf7ff',fontSize:9,fontWeight:900}}>CITY AI • {quality} • {vehicleEntered?'VEHICLE':'ON FOOT'}</div>
      <div style={{padding:'7px 9px',borderRadius:999,background:'#07101ddd',border:'1px solid #e8b94455',color:'#ffe49b',fontSize:9,fontWeight:900}}>DISTRICT 01 • {completed}/4 LOCATIONS • {talks} TALKS</div>
      {near&&<div style={{maxWidth:260,padding:'9px 10px',borderRadius:12,background:'#050b13ee',border:'1px solid #e8b94477',color:'#fff',fontSize:10,lineHeight:1.4}}><b>{near.target.kind.toUpperCase()} • {near.target.label}</b><br/><span style={{opacity:.72}}>{near.distance.toFixed(1)}m away • E / INTERACT</span></div>}
    </div>
    <div style={{position:'fixed',right:14,bottom:18,zIndex:16992,display:'grid',gap:7,width:'min(88vw,290px)',fontFamily:'system-ui,sans-serif'}}>
      <div role="status" style={{padding:'8px 10px',borderRadius:10,background:'#050b13dd',border:'1px solid #4fe3ff44',color:'#bdf7ff',fontSize:9,fontWeight:900}}>{message}</div>
      {interaction&&<div role="status" style={{padding:'10px 11px',borderRadius:12,background:'#07101eee',border:'1px solid #4fe3ff55',color:'#dffaff',fontSize:11,lineHeight:1.45}}>{interaction}</div>}
      <div style={{display:'flex',gap:7,justifyContent:'flex-end'}}>
        <button onClick={()=>setQuality(v=>v==='BALANCED'?'PERFORMANCE':'BALANCED')} style={buttonStyle}>{quality}</button>
        <button onClick={interact} style={{...buttonStyle,borderColor:'#e8b94499',color:'#ffe49b'}}>{near?.target.action||'INTERACT'}</button>
      </div>
    </div>
  </>
}

const buttonStyle:React.CSSProperties={minHeight:44,padding:'0 12px',borderRadius:999,border:'1px solid #4fe3ff77',background:'#071725ee',color:'#fff',fontSize:10,fontWeight:950,cursor:'pointer',boxShadow:'0 8px 24px #0008'}
