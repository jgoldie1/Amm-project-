import { Canvas } from '@react-three/fiber'
import type { WebGLRenderer } from 'three'
import { useEffect, useRef, useState } from 'react'

const LINKS = [
  { name: 'Beauty House', detail: 'Hair, lashes, makeup, esthetics and skincare appointments — pending credential verification' },
  { name: 'Fashion Boutique', detail: 'Fashion, wigs, bundles and beauty products — checkout pending' },
  { name: 'Streamer Studio', detail: 'La Taeasia creator events and future verified livestream channels' },
  { name: 'Beauty Academy', detail: 'Course previews only; professional enrollment requires approvals' },
]
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))
function Buildings({ volcano }: { volcano: boolean }) {
  return <group>
    <ambientLight intensity={1.5} />
    <directionalLight position={[3, 10, 5]} intensity={2.5} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}><planeGeometry args={[80, 80]} /><meshStandardMaterial color={volcano ? '#56392f' : '#59896c'} /></mesh>
    {volcano ? <>
      <mesh position={[0, 2.3, -12]} rotation={[0, 0, Math.PI]}><coneGeometry args={[6, 6, 8]} /><meshStandardMaterial color="#6b5142" /></mesh>
      <mesh position={[0, 5.5, -12]}><sphereGeometry args={[1.3, 16, 12]} /><meshStandardMaterial color="#ff6d19" emissive="#ff4d00" emissiveIntensity={1.4} /></mesh>
      {[[-7,-6],[6,-3],[-3,5],[7,9]].map(([x,z],i)=><mesh key={i} position={[x,.2,z]}><sphereGeometry args={[1.6,12,10]} /><meshStandardMaterial color="#fd5b20" emissive="#ff4200" emissiveIntensity={1.1} /></mesh>)}
    </> : <>
      {[[-8,-10],[-2,-12],[5,-11],[10,-7],[-9,2],[9,5]].map(([x,z],i)=><mesh key={i} position={[x,2.1,z]}><boxGeometry args={[3.8,4.2,3.8]} /><meshStandardMaterial color={i%2?'#edb3c8':'#d9b0ee'} /></mesh>)}
      {[[-13,-5],[13,-5],[-13,10],[13,10]].map(([x,z],i)=><group key={i}><mesh position={[x,1,z]}><cylinderGeometry args={[.19,.24,2]} /><meshStandardMaterial color="#8e6242" /></mesh><mesh position={[x,2.6,z]}><sphereGeometry args={[1.2,10,10]} /><meshStandardMaterial color="#3b9d56" /></mesh></group>)}
    </>}
  </group>
}
export default function TampaVolcanoSafeRoute({ mode = 'tampa' }: { mode?: 'tampa' | 'volcano' }) {
  const volcano = mode === 'volcano'
  const [position, setPosition] = useState({ x: 0, z: 8 })
  const [selected, setSelected] = useState(0)
  const [orbs, setOrbs] = useState(0)
  const [gamepad, setGamepad] = useState(false)
  const [quality, setQuality] = useState<'low'|'balanced'|'high'>('low')
  const [comfort, setComfort] = useState(true)
  const [reverseAxis, setReverseAxis] = useState(false)
  const [controllerAxis, setControllerAxis] = useState<'left'|'right'>('left')
  const [caps, setCaps] = useState('Checking compatibility')
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.matchMedia('(max-width: 720px)').matches
    setCaps([small?'Small screen':'Large screen',reduced?'Reduced motion':'Standard motion',window.isSecureContext?'HTTPS ready':'HTTPS needed for XR',navigator.getGamepads?'Gamepad available':'No Gamepad API'].join(' · '))
  }, [])
  const keys = useRef(new Set<string>())
  const renderer = useRef<WebGLRenderer | null>(null)
  const xrSession = useRef<{ end: () => Promise<void> } | null>(null)
  const [xrStatus, setXrStatus] = useState('Standard 3D mode')
  const enterXR = async (mode: 'immersive-ar' | 'immersive-vr') => {
    const xr = (navigator as Navigator & { xr?: {
      isSessionSupported: (m: string) => Promise<boolean>
      requestSession: (m: string, options?: object) => Promise<{ end: () => Promise<void>; addEventListener: (name: string, fn: () => void) => void }>
    } }).xr
    if (!window.isSecureContext || !xr || !renderer.current) {
      setXrStatus('XR unavailable here. Standard 3D controls remain available.')
      return
    }
    try {
      if (!await xr.isSessionSupported(mode)) { setXrStatus(mode + ' unsupported on this device. Using standard 3D.'); return }
      if (xrSession.current) await xrSession.current.end()
      const session = await xr.requestSession(mode, { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking'] })
      xrSession.current = session
      session.addEventListener('end', () => { xrSession.current = null; setXrStatus('Standard 3D mode') })
      renderer.current.xr.enabled = true
      await renderer.current.xr.setSession(session as Parameters<WebGLRenderer['xr']['setSession']>[0])
      setXrStatus(mode === 'immersive-ar' ? 'AR session active' : 'VR session active')
    } catch {
      setXrStatus('XR could not start. Standard 3D controls remain available.')
    }
  }
  useEffect(() => () => { void xrSession.current?.end().catch(() => undefined) }, [])

  const move = (dx:number,dz:number)=>setPosition(p=>({x:clamp(p.x+dx,-15,15),z:clamp(p.z+dz,-15,15)}))
  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();keys.current.add(e.key.toLowerCase())}
    const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown',down);window.addEventListener('keyup',up)
    let frame=0,last=0
    const tick=(now:number)=>{frame=requestAnimationFrame(tick);if(now-last<55)return;last=now
      const pads=navigator.getGamepads?.()||[];const pad=Array.from(pads).find(Boolean)
      setGamepad(old => old === Boolean(pad) ? old : Boolean(pad))
      let dx=(keys.current.has('arrowright')||keys.current.has('d')?1:0)-(keys.current.has('arrowleft')||keys.current.has('a')?1:0)
      let dz=(keys.current.has('arrowdown')||keys.current.has('s')?1:0)-(keys.current.has('arrowup')||keys.current.has('w')?1:0)
      if(pad){const i=controllerAxis==='right'?2:0;dx+=(reverseAxis?-1:1)*(Math.abs(pad.axes[i]||0)>.2?(pad.axes[i]||0):0);dz+=Math.abs(pad.axes[i+1]||0)>.2?(pad.axes[i+1]||0):0}
      if(dx||dz)move(dx*.15,dz*.15)
    }
    frame=requestAnimationFrame(tick)
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  },[controllerAxis,reverseAxis])
  return <main style={{minHeight:'100vh',background:'#110d1c',color:'#fff',fontFamily:'system-ui',padding:'16px'}}>
    <nav style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:12}}>
      <a style={{color:'#ffd9ee'}} href="/streetverse">Back to StreetVerse</a>
      <a style={{color:'#ffd9ee'}} href="/streetverse/tampa">Tampa Fly-In</a>
      <a style={{color:'#ffd9ee'}} href="/streetverse/volcano">Volcano Challenge</a>
    </nav>
    <h1>{volcano?'VolcanoVerse Challenge':'La Taeasia · Tampa BeautyVerse Fly-In'}</h1>
    <p>{volcano?'Volcanic island training zone. Collect simulated energy with the mission action.':'A safe standalone StreetVerse district route for La Taeasia’s Tampa beauty business and streamer studio.'}</p>
    <details><summary>Device and accessibility settings</summary>
      <p>{caps}</p>
      <label>Graphics <select value={quality} onChange={e=>setQuality(e.target.value as 'low'|'balanced'|'high')}><option value="low">Battery saver</option><option value="balanced">Balanced</option><option value="high">High</option></select></label>
      <label><input type="checkbox" checked={comfort} onChange={e=>setComfort(e.target.checked)}/> VR comfort (fixed overview)</label>
      <label>Controller stick <select value={controllerAxis} onChange={e=>setControllerAxis(e.target.value as 'left'|'right')}><option value="left">Left</option><option value="right">Right</option></select></label>
      <label><input type="checkbox" checked={reverseAxis} onChange={e=>setReverseAxis(e.target.checked)}/> Reverse horizontal control</label>
    </details>
    <div style={{height:'48vh',minHeight:260,borderRadius:16,overflow:'hidden',border:'2px solid #8c5778'}}>
      <Canvas camera={{position:[0,17,23],fov:comfort?50:58}} gl={{antialias:false,alpha:true,powerPreference:'low-power'}} dpr={quality==='low'?1:quality==='balanced'?[1,1.5]:[1,2]} onCreated={({gl})=>{renderer.current=gl}}>
        <Buildings volcano={volcano}/>
        <mesh position={[position.x,.6,position.z]}><capsuleGeometry args={[.45,1,4,8]}/><meshStandardMaterial color="#ffe68f"/></mesh>
      </Canvas>
    </div>
    <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:12}}>
      <button type="button" onClick={()=>void enterXR('immersive-vr')} style={{padding:12}}>Enter VR (supported headsets)</button>
      <button type="button" onClick={()=>void enterXR('immersive-ar')} style={{padding:12}}>Try AR (supported devices)</button>
      <button type="button" onClick={()=>void xrSession.current?.end()} style={{padding:12}}>Exit XR</button>
    </div>
    <p role="status" aria-live="polite">{xrStatus}. XR requires HTTPS, compatible hardware, browser support and permission. Regular 3D is the fallback.</p>
    <p role="status">Position {position.x.toFixed(1)}, {position.z.toFixed(1)} · {gamepad?'Gamepad detected':'Touch buttons / keyboard available'} {volcano?' · Energy '+orbs+'/7':''}</p>
    <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',margin:'12px 0'}}>
      <button style={{fontSize:24,padding:16}} onClick={()=>move(0,-1)}>↑</button>
      <button style={{fontSize:24,padding:16}} onClick={()=>move(-1,0)}>←</button>
      <button style={{fontSize:24,padding:16}} onClick={()=>move(0,1)}>↓</button>
      <button style={{fontSize:24,padding:16}} onClick={()=>move(1,0)}>→</button>
      {volcano&&<button style={{padding:16}} onClick={()=>setOrbs(n=>Math.min(7,n+1))}>Collect energy</button>}
    </div>
    {volcano?<p>{orbs===7?'Mission complete — return to StreetVerse!':'Practice challenge; progress is local to this page, not your player account.'}</p>:<section>
      <h2>Explore Tampa business destinations</h2>
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{LINKS.map((a,i)=><button key={a.name} onClick={()=>setSelected(i)} aria-pressed={selected===i} style={{padding:12,borderRadius:10,background:selected===i?'#edb3c8':'#eadfea'}}>{a.name}</button>)}</div>
      <p role="status">{LINKS[selected].detail}</p>
      <p>Appointment calendar, verified livestream URL and checkout are not connected. No charges or reservations occur here.</p>
    </section>}
    <small>Isolated beta route. Does not alter the existing StreetVerse scene, map, player save, payments or multiplayer.</small>
  </main>
}
