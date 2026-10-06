import {useEffect,useRef,useState} from 'react'
import type {FreeTvCommercialBreak,FreeTvCommercialSpot} from '../runtime/FreeTvCommercialRuntime'

export default function FreeTvCommercialBreakOverlay(){
  const [breakData,setBreakData]=useState<FreeTvCommercialBreak|null>(null)
  const [index,setIndex]=useState(0)
  const timer=useRef<number>(0)
  const spot=breakData?.spots[index]||null

  useEffect(()=>{
    const onBreak=(event:Event)=>{
      const d=(event as CustomEvent<FreeTvCommercialBreak>).detail
      if(!d?.spots?.length)return
      window.clearTimeout(timer.current)
      setBreakData(d);setIndex(0)
    }
    addEventListener('tryamm:free-tv-commercial-break-start',onBreak)
    return()=>{removeEventListener('tryamm:free-tv-commercial-break-start',onBreak);window.clearTimeout(timer.current)}
  },[])

  useEffect(()=>{
    window.clearTimeout(timer.current)
    if(!spot||!breakData)return
    window.dispatchEvent(new CustomEvent('tryamm:holo-ad-impression-candidate',{detail:{
      spotId:spot.id,
      campaignId:spot.campaignId||null,
      surface:'tryamm-tv',
      clientReported:true,
      billable:false,
      serverVerificationRequired:true,
      at:new Date().toISOString(),
    }}))
    timer.current=window.setTimeout(()=>{
      if(index+1<breakData.spots.length)setIndex(index+1)
      else{setBreakData(null);setIndex(0);window.dispatchEvent(new CustomEvent('tryamm:free-tv-commercial-break-end',{detail:{breakId:breakData.id}}))}
    },Math.max(3,spot.durationSeconds)*1000)
    return()=>window.clearTimeout(timer.current)
  },[spot?.id,breakData?.id,index])

  if(!breakData||!spot)return null
  return <div role="dialog" aria-label="Commercial break" style={backdrop}>
    <div style={frame}>
      <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}>
        <span style={badge}>{spot.disclosure.toUpperCase()}</span>
        <span style={{fontSize:9,color:'#8fa7b5'}}>FREE TV • BREAK {breakData.id.split(':').pop()} • {index+1}/{breakData.spots.length}</span>
      </div>
      {spot.mediaUrl?<video src={spot.mediaUrl} autoPlay playsInline muted={false} style={{width:'100%',aspectRatio:'16/9',objectFit:'contain',marginTop:10,background:'#000',borderRadius:12}}/>:
      <div style={slate}><div style={{fontSize:11,letterSpacing:2,color:'#70edff',fontWeight:950}}>ALL AMERICAN NETWORK</div><div style={{fontSize:'clamp(28px,8vw,64px)',fontWeight:1000,marginTop:10}}>{spot.title}</div><div style={{fontSize:12,color:'#a7bdc8',marginTop:8}}>{spot.kind.replaceAll('-',' ').toUpperCase()} • {spot.durationSeconds}s</div></div>}
      <div style={{marginTop:9,fontSize:9,color:'#728a97'}}>Commercial delivery is disclosed. Client playback is not billable until verified by the server-side advertising ledger.</div>
    </div>
  </div>
}

const backdrop:React.CSSProperties={position:'fixed',inset:0,zIndex:2147483400,display:'grid',placeItems:'center',padding:12,background:'#000f',color:'#fff',fontFamily:'system-ui'}
const frame:React.CSSProperties={width:'min(96vw,980px)',padding:12,borderRadius:18,border:'1px solid #335263',background:'#05090d',boxShadow:'0 24px 90px #000'}
const slate:React.CSSProperties={aspectRatio:'16/9',marginTop:10,borderRadius:12,display:'grid',placeItems:'center',textAlign:'center',padding:20,background:'radial-gradient(circle at 50% 45%,#153e55,#080b14 55%,#020306)',border:'1px solid #3c7894'}
const badge:React.CSSProperties={display:'inline-flex',padding:'4px 7px',borderRadius:999,border:'1px solid #ffcf5b66',background:'#2b2109',color:'#ffe091',fontSize:8,fontWeight:1000,letterSpacing:1.2}
