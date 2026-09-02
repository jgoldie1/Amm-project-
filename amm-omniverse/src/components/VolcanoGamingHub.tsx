import { useEffect, useMemo, useState } from 'react'

type Props={onClose:()=>void}
type Pad={index:number;id:string;mapping:string;buttons:number;axes:number}

export default function VolcanoGamingHub({onClose}:Props){
  const [pads,setPads]=useState<Pad[]>([])
  const [status,setStatus]=useState('VOLCANO ready. Pair a controller with your device, then press any controller button.')
  const [phoneMode,setPhoneMode]=useState(true)
  const [castTarget,setCastTarget]=useState('')

  useEffect(()=>{
    const sync=()=>{
      const next=Array.from(navigator.getGamepads?.()??[]).filter(Boolean).map(g=>({index:g!.index,id:g!.id,mapping:g!.mapping,buttons:g!.buttons.length,axes:g!.axes.length}))
      setPads(next)
      if(next.length)setStatus(`${next.length} controller${next.length>1?'s':''} connected to VOLCANO.`)
    }
    const connected=(e:GamepadEvent)=>{sync();setStatus(`Controller connected: ${e.gamepad.id}`)}
    const disconnected=()=>{sync();setStatus('Controller disconnected.')}
    window.addEventListener('gamepadconnected',connected)
    window.addEventListener('gamepaddisconnected',disconnected)
    sync()
    const id=window.setInterval(sync,1000)
    return()=>{window.clearInterval(id);window.removeEventListener('gamepadconnected',connected);window.removeEventListener('gamepaddisconnected',disconnected)}
  },[])

  useEffect(()=>{
    const id=window.setInterval(()=>{
      const gp=navigator.getGamepads?.()?.find(Boolean)
      if(!gp)return
      const detail={index:gp.index,id:gp.id,axes:[...gp.axes],buttons:gp.buttons.map(b=>({pressed:b.pressed,value:b.value})),phoneMode}
      window.dispatchEvent(new CustomEvent('tryamm:volcano-gamepad',{detail}))
    },33)
    return()=>window.clearInterval(id)
  },[phoneMode])

  const capabilities=useMemo(()=>[
    ['📱 Holo Fon','Phone can act as the StreetVerse remote/control surface.'],
    ['🎮 Controllers','PS / Xbox / Nintendo-style controllers when exposed by the browser Gamepad API.'],
    ['🖥 Cast','TV / computer / laptop handoff uses the device or browser casting route.'],
    ['🥽 XR','AR / VR mode launches through the existing XR/WebXR runtime when available.'],
    ['🟦 BLE','Bluetooth Low Energy accessories require explicit browser permission and supported hardware.'],
    ['♿ Assist','One-hand and remapped control profiles remain compatible with the event bridge.'],
  ],[])

  const launch=(names:string[],label:string)=>{
    for(const name of names){const fn=(window as any)[name];if(typeof fn==='function'){fn();setStatus(`${label} opened.`);return}}
    setStatus(`${label} is not connected on this build yet.`)
  }

  const requestBle=async()=>{
    const bt=(navigator as any).bluetooth
    if(!bt?.requestDevice){setStatus('Web Bluetooth is not available in this browser. Pair through the operating system instead.');return}
    try{
      const device=await bt.requestDevice({acceptAllDevices:true,optionalServices:[]})
      setStatus(`BLE device authorized: ${device.name||'Unnamed device'}. A device-specific service adapter is still required before gameplay data can be used.`)
    }catch{setStatus('Bluetooth device selection cancelled or unavailable.')}
  }

  const shareScreen=async()=>{
    try{
      const media=(navigator.mediaDevices as any)?.getDisplayMedia
      if(!media){setStatus('Screen sharing/casting capture is not available in this browser.');return}
      const stream=await media.call(navigator.mediaDevices,{video:true,audio:true})
      stream.getTracks().forEach((t:MediaStreamTrack)=>t.stop())
      setStatus('Display-share permission works. Select your TV/cast destination using the device or browser casting controls.')
    }catch{setStatus('Display-share selection cancelled or unavailable.')}
  }

  const box:React.CSSProperties={background:'#07131df0',border:'1px solid #214b61',borderRadius:16,padding:13}
  const btn:React.CSSProperties={minHeight:46,border:'1px solid #4fe3ff66',borderRadius:12,background:'#0b2130',color:'#dffaff',padding:'9px 11px',fontFamily:'monospace',fontWeight:900,cursor:'pointer'}

  return <div role="dialog" aria-label="Volcano Gaming Console" style={{position:'fixed',inset:0,zIndex:10200,background:'radial-gradient(circle at 50% 0,#14334a,#02060d 55%)',color:'#e9fbff',fontFamily:'monospace',overflowY:'auto'}}>
    <div style={{maxWidth:980,margin:'0 auto',padding:'max(16px,env(safe-area-inset-top)) 16px 42px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><div><div style={{fontSize:10,letterSpacing:2,color:'#67edff',fontWeight:950}}>TRYAMM • HOLO FON • STREETVERSE</div><h1 style={{margin:'4px 0'}}>🌋 VOLCANO GAMING CONSOLE</h1><div style={{fontSize:11,color:'#8fb2c0'}}>PHONE → CONTROLLER → GAME → TV / XR / COMPUTER</div></div><button style={btn} onClick={onClose}>← STREETVERSE</button></header>

      <section style={{...box,marginTop:14,borderColor:'#4fe3ff66'}}><div style={{fontSize:10,color:'#67edff',fontWeight:950}}>UNIVERSAL CONTROL BRIDGE</div><p style={{fontSize:11,lineHeight:1.7,color:'#b6ccd5'}}>VOLCANO normalizes phone touch controls and connected gamepads into TRYAMM control events. StreetVerse or another game can subscribe to <code>tryamm:volcano-gamepad</code> instead of writing separate controller code for each screen.</p><label style={{display:'flex',gap:9,alignItems:'center',fontSize:11}}><input type="checkbox" checked={phoneMode} onChange={e=>setPhoneMode(e.target.checked)}/> Use Holo Fon as companion controller/remote</label></section>

      <section style={{...box,marginTop:12}}><h3 style={{marginTop:0}}>Connected controllers</h3>{pads.length===0?<div style={{fontSize:11,color:'#8ca6b2'}}>No browser-visible gamepad yet. Pair it in Bluetooth/USB settings, return here, then press a button.</div>:<div style={{display:'grid',gap:8}}>{pads.map(p=><div key={p.index} style={{padding:10,border:'1px solid #275166',borderRadius:11}}><b>{p.id}</b><div style={{fontSize:9,color:'#8aa8b4',marginTop:4}}>INDEX {p.index} • {p.mapping||'vendor mapping'} • {p.buttons} buttons • {p.axes} axes</div></div>)}</div>}</section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10,marginTop:12}}>{capabilities.map(([title,body])=><div key={title} style={box}><b style={{color:'#baf6ff'}}>{title}</b><div style={{fontSize:10,lineHeight:1.55,color:'#8eabb7',marginTop:6}}>{body}</div></div>)}</section>

      <section style={{...box,marginTop:12}}><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:8}}><button style={btn} onClick={()=>launch(['__showHoloFon'],'Holo Fon')}>📱 HOLO FON</button><button style={btn} onClick={()=>launch(['__showXR','__showWebXR','__showHoloverse'],'XR')}>🥽 AR / VR</button><button style={btn} onClick={requestBle}>🟦 CONNECT BLE</button><button style={btn} onClick={shareScreen}>📺 CAST / SHARE</button></div><label style={{display:'block',marginTop:10,fontSize:10}}>Cast/device label<input value={castTarget} onChange={e=>setCastTarget(e.target.value)} placeholder="Living room TV / laptop" style={{width:'100%',boxSizing:'border-box',marginTop:5,padding:10,borderRadius:9,border:'1px solid #24485c',background:'#03101a',color:'#fff'}}/></label></section>

      <div role="status" aria-live="polite" style={{...box,marginTop:12,fontSize:10,lineHeight:1.6,color:'#b6d1db'}}>{status}</div>
      <section style={{...box,marginTop:12,fontSize:9,lineHeight:1.6,color:'#829da9'}}>Safety boundary: VOLCANO only accepts controller/accessory input that the user explicitly pairs or authorizes. Weapon-shaped game controllers are treated only as game-input peripherals; this layer does not control real weapons. Adult accessories require their own supported, permissioned integration and age-appropriate experience boundary.</section>
    </div>
  </div>
}
