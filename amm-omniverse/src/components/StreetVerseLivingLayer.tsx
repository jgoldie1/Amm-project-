import { useEffect, useMemo, useRef, useState } from 'react'

type Pos={x:number;z:number;character?:string}
type Target={kind:'resident'|'business'|'vehicle'|'mission';label:string;copy:string;x:number;z:number;action:string}

const TARGETS:Target[]=[
  {kind:'business',label:'Aniyah 64 Track Studio',copy:'Recording sessions, creator missions and Reel moments are active here.',x:-42,z:-30,action:'ENTER STUDIO'},
  {kind:'business',label:'All American Marketplace',copy:'Shop, sell and discover StreetVerse businesses from this district.',x:42,z:-24,action:'OPEN MARKET'},
  {kind:'business',label:'All American Network',copy:'Broadcast and creator publishing hub connected to TRYAMM LIVE.',x:38,z:38,action:'OPEN NETWORK'},
  {kind:'business',label:'Chicago After Dark',copy:'Nightlife district mission hub with creator and social events.',x:-38,z:38,action:'ENTER DISTRICT'},
  {kind:'vehicle',label:'StreetVerse Vehicle',copy:'A nearby vehicle is available for the driving interaction layer.',x:0,z:48,action:'INTERACT / ENTER'},
  {kind:'resident',label:'Chicago Resident',copy:'Resident awareness is active. Talk, receive local hints, and discover nearby missions.',x:0,z:18,action:'TALK'},
]

const lines=[
  'Welcome to StreetVerse. The city reacts to where you go now.',
  'Try the Marketplace or Creator Studio — both have district missions nearby.',
  'Traffic is live. Use the crosswalks and watch the signal cycle.',
  'Your Reel button can capture the StreetVerse canvas when the browser supports it.',
  'Explore the glowing checkpoints to complete District 01.',
]

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
  const [pos,setPos]=useState<Pos|null>(null)
  const [message,setMessage]=useState('CITY AWARENESS ONLINE')
  const [interaction,setInteraction]=useState('')
  const [quality,setQuality]=useState<'BALANCED'|'PERFORMANCE'>('BALANCED')
  const lastTalk=useRef(0)
  const near=useMemo(()=>nearestTarget(pos),[pos])

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

  function interact(){
    if(!near){setInteraction('Move closer to a resident, vehicle, business, or mission marker.');return}
    const {target}=near
    if(target.kind==='resident'){
      const next=lines[Math.floor(Date.now()/1000)%lines.length]
      lastTalk.current=Date.now();setInteraction(next)
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-resident-talk',{detail:{label:target.label,text:next,x:pos?.x,z:pos?.z}}))
      return
    }
    if(target.kind==='business'){
      setInteraction(`${target.label}: ${target.copy}`)
      if(target.label.includes('Marketplace'))window.dispatchEvent(new CustomEvent('tryamm:streetverse-open-marketplace'))
      if(target.label.includes('Network'))window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse',destination:'all-american-network'}}))
      return
    }
    if(target.kind==='vehicle'){
      setInteraction('Vehicle interaction requested • use the world ENTER/INTERACT control to drive when a nearby vehicle is in range.')
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{x:pos?.x,z:pos?.z}}))
    }
  }

  return <>
    <div style={{position:'fixed',left:12,bottom:88,zIndex:16991,display:'grid',gap:6,pointerEvents:'none',fontFamily:'system-ui,sans-serif'}}>
      <div style={{padding:'7px 9px',borderRadius:999,background:'#04121ddd',border:'1px solid #4fe3ff66',color:'#bdf7ff',fontSize:9,fontWeight:900}}>CITY AI • {quality}</div>
      {near&&<div style={{maxWidth:260,padding:'9px 10px',borderRadius:12,background:'#050b13ee',border:'1px solid #e8b94477',color:'#fff',fontSize:10,lineHeight:1.4}}><b>{near.target.kind.toUpperCase()} • {near.target.label}</b><br/><span style={{opacity:.72}}>{near.distance.toFixed(1)}m away</span></div>}
    </div>
    <div style={{position:'fixed',right:14,bottom:18,zIndex:16992,display:'grid',gap:7,width:'min(88vw,290px)',fontFamily:'system-ui,sans-serif'}}>
      {interaction&&<div role="status" style={{padding:'10px 11px',borderRadius:12,background:'#07101eee',border:'1px solid #4fe3ff55',color:'#dffaff',fontSize:11,lineHeight:1.45}}>{interaction}</div>}
      <div style={{display:'flex',gap:7,justifyContent:'flex-end'}}>
        <button onClick={()=>setQuality(v=>v==='BALANCED'?'PERFORMANCE':'BALANCED')} style={buttonStyle}>{quality}</button>
        <button onClick={interact} style={{...buttonStyle,borderColor:'#e8b94499',color:'#ffe49b'}}>{near?.target.action||'INTERACT'}</button>
      </div>
    </div>
  </>
}

const buttonStyle:React.CSSProperties={minHeight:44,padding:'0 12px',borderRadius:999,border:'1px solid #4fe3ff77',background:'#071725ee',color:'#fff',fontSize:10,fontWeight:950,cursor:'pointer',boxShadow:'0 8px 24px #0008'}
