import { useEffect, useState } from 'react'

type XRMode='immersive-vr'|'immersive-ar'
type Support={webxr:boolean;vr:boolean;ar:boolean;secure:boolean}
type Props={onClose:()=>void}

export default function XRCommandGateway({onClose}:Props){
  const [support,setSupport]=useState<Support>({webxr:false,vr:false,ar:false,secure:window.isSecureContext})
  const [message,setMessage]=useState('Checking this device for WebXR support…')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    let cancelled=false
    async function detect(){
      const xr=(navigator as any).xr
      if(!xr){if(!cancelled){setSupport(s=>({...s,webxr:false}));setMessage('WebXR is not available in this browser. Standard 2D/3D immersive mode remains available.')}return}
      try{
        const [vr,ar]=await Promise.all([xr.isSessionSupported('immersive-vr').catch(()=>false),xr.isSessionSupported('immersive-ar').catch(()=>false)])
        if(!cancelled){setSupport({webxr:true,vr:Boolean(vr),ar:Boolean(ar),secure:window.isSecureContext});setMessage(vr||ar?'XR hardware/browser capability detected.':'WebXR exists, but immersive AR/VR is not supported on this device.')}
      }catch{if(!cancelled)setMessage('XR capability detection failed; using standard immersive fallback.')}
    }
    detect();return()=>{cancelled=true}
  },[])

  async function launch(mode:XRMode){
    const xr=(navigator as any).xr
    if(!xr){setMessage('WebXR is unavailable. Opening standard immersive world instead.');fallback();return}
    setBusy(true)
    try{
      const session=await xr.requestSession(mode,{optionalFeatures:['local-floor','bounded-floor','hand-tracking','layers']})
      setMessage(`${mode==='immersive-vr'?'VR':'AR/Mixed Reality'} session started. The current world renderer must attach its XR render loop to this session.`)
      session.addEventListener('end',()=>setMessage('XR session ended. Standard TRYAMM view restored.'),{once:true})
    }catch(e){setMessage(e instanceof Error?e.message:'XR session could not start.');fallback()}
    finally{setBusy(false)}
  }
  function fallback(){const nav=(window as any).__tryammNavigate;if(typeof nav==='function')nav('/immersive-worlds');else window.location.hash='/immersive-worlds';onClose()}

  return <div role="dialog" aria-modal="true" aria-label="TRYAMM XR Command Gateway" style={{position:'fixed',inset:0,zIndex:12250,background:'radial-gradient(circle at 50% 20%,#12344b,#050812 50%,#020309)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <div style={{maxWidth:900,margin:'0 auto',padding:20}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:'#4fe3ff',letterSpacing:3}}>HOLO XR</div><h1 style={{margin:'4px 0'}}>AR · VR · Mixed Reality</h1><div style={{opacity:.62}}>One world state, multiple display modes.</div></div><button onClick={onClose} style={btn}>CLOSE</button></div>
      <section style={panel}><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,textAlign:'center'}}><Stat label="HTTPS" ok={support.secure}/><Stat label="WEBXR" ok={support.webxr}/><Stat label="VR" ok={support.vr}/><Stat label="AR/MR" ok={support.ar}/></div><p style={{lineHeight:1.55,opacity:.75}}>{message}</p></section>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10}}>
        <article style={panel}><h2>🥽 VR World Mode</h2><p style={{opacity:.7}}>Enter StreetVerse, Holoverse, space, games and immersive rooms in headset mode while keeping the same avatar/session state.</p><button disabled={busy||!support.vr} onClick={()=>launch('immersive-vr')} style={{...btn,opacity:support.vr?1:.45}}>ENTER VR</button></article>
        <article style={panel}><h2>📱 AR / Mixed Reality</h2><p style={{opacity:.7}}>Blend TRYAMM content with the physical room for portals, objects, menus, accessibility overlays and shared spatial experiences.</p><button disabled={busy||!support.ar} onClick={()=>launch('immersive-ar')} style={{...btn,opacity:support.ar?1:.45}}>ENTER AR/MR</button></article>
        <article style={panel}><h2>🖥 Safe Fallback</h2><p style={{opacity:.7}}>Unsupported devices do not fail. They route into the existing immersive 2D/3D world with touch, mouse, keyboard and accessibility controls.</p><button onClick={fallback} style={btn}>OPEN IMMERSIVE WORLD</button></article>
      </section>
      <section style={{...panel,marginTop:10,borderColor:'#e8b94455'}}><strong>Production gate</strong><p style={{opacity:.7}}>XR remains beta until device testing proves headset/browser compatibility, motion comfort, controller/hand input, spatial permissions, accessibility and performance budgets. No unsupported device is promoted automatically.</p></section>
    </div>
  </div>
}
function Stat({label,ok}:{label:string;ok:boolean}){return <div style={{padding:10,border:'1px solid #274358',borderRadius:10}}><div style={{fontSize:16,color:ok?'#78ffb4':'#e8b944'}}>{ok?'●':'○'}</div><div style={{fontSize:9,opacity:.65}}>{label}</div></div>}
const panel:React.CSSProperties={padding:16,border:'1px solid #28485d',borderRadius:16,background:'#07101bdd'}
const btn:React.CSSProperties={minHeight:42,padding:'0 14px',border:'1px solid #4fe3ff66',borderRadius:10,background:'#0b2634',color:'#fff',fontWeight:900,cursor:'pointer'}
