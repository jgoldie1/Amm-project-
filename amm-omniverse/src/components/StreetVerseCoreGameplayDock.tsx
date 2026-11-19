import {useEffect,useState} from 'react'
import StreetVerseInGamePanels from './StreetVerseInGamePanels'

type Context={vehicleId?:string;label?:string;broken?:boolean;repairKit?:boolean;missionId?:string}
type ActiveMission={id:string;label:string;source?:string}

export default function StreetVerseCoreGameplayDock(){
  const [ctx,setCtx]=useState<Context>({})
  const [mission,setMission]=useState<ActiveMission|null>(null)
  const [inVehicle,setInVehicle]=useState(false)
  const [message,setMessage]=useState('READY')
  const [expanded,setExpanded]=useState(false)
  useEffect(()=>{const close=()=>setExpanded(false);window.addEventListener('tryamm:streetverse-play-focus',close);return()=>window.removeEventListener('tryamm:streetverse-play-focus',close)},[])

  useEffect(()=>{
    const onContext=(e:Event)=>setCtx((e as CustomEvent<Context>).detail||{})
    const onMission=(e:Event)=>{
      const d=(e as CustomEvent<any>).detail||{}
      const id=String(d.missionId||d.id||'').trim()
      if(id)setMission({id,label:String(d.label||d.title||'StreetVerse Mission'),source:String(d.source||'streetverse')})
    }
    const onComplete=(e:Event)=>{
      const d=(e as CustomEvent<any>).detail||{}
      const id=String(d.missionId||d.id||'')
      setMission(current=>{if(!current||!id||id===current.id){setMessage('MISSION COMPLETE');return null}return current})
    }
    const onVehicle=(e:Event)=>setInVehicle(Boolean((e as CustomEvent<{entered?:boolean}>).detail?.entered))
    addEventListener('tryamm:streetverse-interaction-context',onContext)
    addEventListener('tryamm:streetverse-mission-start',onMission)
    addEventListener('tryamm:streetverse-mission-complete',onComplete)
    addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
    return()=>{
      removeEventListener('tryamm:streetverse-interaction-context',onContext)
      removeEventListener('tryamm:streetverse-mission-start',onMission)
      removeEventListener('tryamm:streetverse-mission-complete',onComplete)
      removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
    }
  },[])

  const missionAction=()=>{
    // Existing first-journey flow expects this quick-start event; preserve the cinematic selector too.
    dispatchEvent(new CustomEvent('tryamm:streetverse-first-journey-start',{detail:{source:'streetverse-core-dock',requestedMissionId:mission?.id||null}}))
    dispatchEvent(new CustomEvent('tryamm:streetverse-cinematic-mission-open',{detail:{missionId:mission?.id,source:'streetverse-core-dock'}}))
    setMessage('MISSION START REQUESTED')
  }

  const repair=()=>{
    if(!ctx.vehicleId||!ctx.broken){
      dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'Move close to the broken vehicle. The repair button will activate when StreetVerse detects it.'}}))
      setMessage('MOVE TO BROKEN CAR')
      return
    }
    dispatchEvent(new CustomEvent('tryamm:streetverse-interaction-context',{detail:{...ctx,kind:'vehicle',broken:true,drivable:false,source:'streetverse-core-dock'}}))
    dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'Repair actions are open. Use inspect, open hood, diagnose, repair kit, repair, and verify.'}}))
    setMessage('REPAIR ACTIONS READY')
  }

  const ride=()=>{dispatchEvent(new Event('tryamm:holo-mobility-open'));setMessage('RIDE SHARE OPEN')}
  const reel=()=>{dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'streetverse-core-dock',missionId:mission?.id||'',missionLabel:mission?.label||''}}));setMessage('REEL OPEN')}
  const liveCast=()=>{
    setExpanded(false)
    dispatchEvent(new CustomEvent('tryamm:streetverse-live-cast-open',{detail:{source:'streetverse-core-dock',missionId:mission?.id||'',mode:'gamecast'}}))
    dispatchEvent(new CustomEvent('tryamm:live-center-open',{detail:{source:'streetverse-core-dock',format:'gamecast'}}))
    dispatchEvent(new CustomEvent('tryamm:volcano-holocast-open',{detail:{source:'streetverse-core-dock',keepGameplayActive:true}}))
    dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text:'Live and cast controls opened. StreetVerse gameplay stays active while you choose streaming and display destinations.'}}))
    setMessage('LIVE / CAST OPEN')
  }
  const social=()=>{dispatchEvent(new CustomEvent('tryamm:mini-panel-open',{detail:{tab:'social',source:'streetverse-core-dock'}}));setMessage('SOCIAL PANEL OPEN')}
  const tickets=()=>{dispatchEvent(new CustomEvent('tryamm:stream-ticket-center-open',{detail:{source:'streetverse-core-dock'}}));setMessage('STREAM TICKETS OPEN')}
  const people=()=>{dispatchEvent(new CustomEvent('tryamm:user-search-open',{detail:{source:'streetverse-core-dock',scope:['people','live','families','agencies','games']}}));setMessage('SEARCH OPEN')}
  const faith=()=>{window.location.href='/faithverse'}
  const exit=()=>{
    dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-input',{detail:{throttle:0,brake:1,steer:0,horn:false,exit:true}}))
    dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:false,source:'streetverse-core-dock'}}))
    setMessage('EXIT VEHICLE')
  }

  const btn:React.CSSProperties={minHeight:46,borderRadius:14,border:'1px solid #5e7f93',background:'#071622ee',color:'#fff',fontSize:10,fontWeight:950,padding:'7px 8px',touchAction:'manipulation',WebkitTapHighlightColor:'transparent'}
  const status=mission?'ACTIVE • '+mission.label:message
  return <><StreetVerseInGamePanels/><aside aria-label="StreetVerse core gameplay controls" style={{position:'fixed',left:8,right:8,bottom:'max(8px, env(safe-area-inset-bottom))',zIndex:47000,pointerEvents:'none',fontFamily:'system-ui,sans-serif'}}>
    <div style={{pointerEvents:'auto',margin:'0 auto',maxWidth:620,border:'1px solid #4fe3ff66',borderRadius:18,padding:7,background:'#030b12e8',boxShadow:'0 12px 36px #000b'}}>
      <div style={{display:'flex',gap:8,alignItems:'center',justifyContent:'space-between'}}>
        <button aria-label={expanded?'Collapse gameplay controls and return to game':'Expand gameplay controls'} aria-expanded={expanded} onClick={()=>{setExpanded(v=>!v);window.dispatchEvent(new Event('tryamm:streetverse-actions-close'))}} style={{...btn,minHeight:56,minWidth:118,fontSize:13,background:expanded?'#613022':'#15513d'}}>{expanded?'✕ CLOSE':'☰ CONTROLS'}</button>
        {!expanded&&<button aria-label="Open LIVE casting controls" onClick={liveCast} style={{...btn,minHeight:56,minWidth:100,fontSize:13}}>📡 LIVE</button>}
        <span aria-live="polite" style={{fontSize:10,color:'#b6d9e9',textAlign:'right',flex:1}}>{expanded?'Select an action':status}</span>
      </div>
      {expanded&&<div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:5,marginTop:7}}>
        <button onClick={missionAction} style={{...btn,color:'#ffe47f'}}>📍<br/>MISSION</button>
        <button onClick={repair} style={{...btn,color:'#ffb36b'}}>🔧<br/>REPAIR</button>
        <button onClick={ride} style={{...btn,color:'#8effb7'}}>🚕<br/>RIDE</button>
        <button onClick={reel} style={{...btn,color:'#f3a6ff'}}>🎥<br/>REEL</button>
        <button onClick={liveCast} style={{...btn,color:'#7fe9ff'}}>📡<br/>LIVE/CAST</button>
        <button onClick={social} style={{...btn,color:'#ff9ecf'}}>❤️<br/>SOCIAL</button>
        <button onClick={people} style={{...btn,color:'#9fc8ff'}}>🔎<br/>PEOPLE</button>
        <button onClick={tickets} style={{...btn,color:'#b7ffa2'}}>🎟️<br/>TICKETS</button>
        <button onClick={faith} style={{...btn,color:'#e5c56a'}}>📖<br/>FAITH</button>
        <button onClick={exit} disabled={!inVehicle} style={{...btn,color:inVehicle?'#ffcf6b':'#687785',opacity:inVehicle?1:.55}}>🚪<br/>EXIT</button>
      </div>
      {expanded&&<div aria-live="polite" style={{marginTop:5,textAlign:'center',fontSize:10,fontWeight:900,color:'#8ea6b7'}}>{status}</div>}
    </div>
  </aside></>
}