import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import HoloGiftEngine from './HoloGiftEngine'

type Props={onClose:()=>void}
type Mode='feed'|'live'|'pk'|'world'

export default function HoloSocialEngine({onClose}:Props){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const [mode,setMode]=useState<Mode>('feed')
  const [clipSeconds,setClipSeconds]=useState(30)
  const [status,setStatus]=useState('HOLO SOCIAL ENGINE READY')

  useEffect(()=>{
    const mount=mountRef.current
    if(!mount)return
    const scene=new THREE.Scene()
    scene.fog=new THREE.FogExp2(0x02040b,0.06)
    const camera=new THREE.PerspectiveCamera(58,1,0.1,100)
    camera.position.set(0,0.4,7)
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2))
    renderer.setClearColor(0x000000,0)
    mount.appendChild(renderer.domElement)
    const group=new THREE.Group();scene.add(group)
    const cyan=new THREE.MeshBasicMaterial({color:0x4fe3ff,wireframe:true,transparent:true,opacity:.42})
    const gold=new THREE.MeshBasicMaterial({color:0xe8b944,wireframe:true,transparent:true,opacity:.34})
    const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25,2),cyan)
    const ring1=new THREE.Mesh(new THREE.TorusGeometry(2.15,.025,10,180),gold)
    const ring2=new THREE.Mesh(new THREE.TorusGeometry(2.75,.018,10,180),cyan);ring2.rotation.x=Math.PI/2.8
    const ring3=new THREE.Mesh(new THREE.TorusGeometry(3.2,.012,8,180),gold);ring3.rotation.y=Math.PI/2.4
    group.add(core,ring1,ring2,ring3)
    const particles=new THREE.BufferGeometry(),count=600,positions=new Float32Array(count*3)
    for(let i=0;i<count;i++){const r=3.8+Math.random()*4.5,a=Math.random()*Math.PI*2,b=(Math.random()-.5)*Math.PI;positions[i*3]=Math.cos(a)*Math.cos(b)*r;positions[i*3+1]=Math.sin(b)*r*.65;positions[i*3+2]=Math.sin(a)*Math.cos(b)*r}
    particles.setAttribute('position',new THREE.BufferAttribute(positions,3))
    const points=new THREE.Points(particles,new THREE.PointsMaterial({color:0x4fe3ff,size:.025,transparent:true,opacity:.55}));scene.add(points)
    const resize=()=>{const w=Math.max(1,mount.clientWidth),h=Math.max(1,mount.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
    resize();const ro=new ResizeObserver(resize);ro.observe(mount)
    let raf=0;const tick=()=>{raf=requestAnimationFrame(tick);const t=performance.now()*.00045;group.rotation.y=t;group.rotation.x=Math.sin(t*.7)*.12;ring2.rotation.z=t*1.3;ring3.rotation.x=t*.7;points.rotation.y=-t*.18;renderer.render(scene,camera)};tick()
    return()=>{cancelAnimationFrame(raf);ro.disconnect();renderer.dispose();particles.dispose();cyan.dispose();gold.dispose();mount.removeChild(renderer.domElement)}
  },[])

  useEffect(()=>{const onGift=(event:Event)=>{const detail=(event as CustomEvent<any>).detail;setStatus(`${String(detail?.giftType||'GIFT').toUpperCase()} EFFECT • ${detail?.settlementStatus||'VISUAL'}`)};window.addEventListener('tryamm:holo-gift',onGift);return()=>window.removeEventListener('tryamm:holo-gift',onGift)},[])

  const launch=(target:string)=>{setStatus(`${target.toUpperCase()} HANDOFF`);if(target==='live')(window as any).__showTryAMMLive?.();if(target==='studio')(window as any).__showPoyoAI?.();if(target==='media')window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'holo-social'}}))}
  const makeClip=()=>{setStatus(`${clipSeconds}s CLIP → MEDIA STUDIO`);window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'holo-social',presetSeconds:clipSeconds,kind:'clip'}}))}

  const cards={
    feed:[['HOLO FEED','Vertical short video becomes a spatial card wall with depth, creator aura and world-entry links.'],['PORTAL POST','A Reel can open the exact StreetVerse/My World location it came from.'],['AI REMIX','Send a post into Poyo AI Studio MAX for image, video, voice, music or 3D remixing.']],
    live:[['HOLO LIVE','Realtime host tiles float in a spatial stage instead of a flat grid.'],['INSTANT CLIP','Turn a live moment into a 15, 30 or 60 second creator clip and send it straight to Reel Studio.'],['LIVE COMMERCE','Attach verified products, tickets, music or creator offers to the room.']],
    pk:[['PK ARENA','BIGO-style battles become a holographic arena with teams, meters, gifts and world effects.'],['CLIP THE BATTLE','Capture the winning reaction, gift burst or comeback as a short-form clip.'],['CREATOR SCORE','XP, reputation and visual rewards remain distinct from withdrawable cash until settlement is verified.']],
    world:[['ENTER WORLD','A video is not the end of the funnel—the viewer can enter the location, mission or event.'],['WORLD CLIP','Capture a mission, race, performance or discovery and turn it into a portal-linked Reel.'],['RETURN LOOP','World moment → clip → Reel → viewer enters same world → creator attribution → return.']]
  } as const

  return <div style={{position:'fixed',inset:0,zIndex:10080,background:'radial-gradient(circle at 50% 25%,#071728,#02040b 55%,#000)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',overflow:'auto'}}>
    <div ref={mountRef} aria-hidden="true" style={{position:'fixed',inset:0,opacity:.9,pointerEvents:'none'}}/>
    <div style={{position:'relative',zIndex:2,maxWidth:1160,margin:'0 auto',padding:'22px 16px 48px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><div><div style={{fontSize:11,letterSpacing:4,color:'#4fe3ff',fontWeight:900}}>TRYAMM • HOLOGRAPHIC SOCIAL OS</div><h1 style={{margin:'7px 0 4px',fontSize:'clamp(28px,6vw,62px)',lineHeight:.98}}>Holo Social Engine</h1><div style={{color:'#e8b944',fontWeight:800,fontSize:12}}>{status}</div></div><button onClick={onClose} aria-label="Close Holo Social Engine" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #4fe3ff77',background:'#07111dcc',color:'#fff',fontSize:22,cursor:'pointer'}}>×</button></div>
      <div style={{marginTop:26,display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:8}}>{(['feed','live','pk','world'] as Mode[]).map(id=><button key={id} onClick={()=>setMode(id)} style={{padding:'12px 8px',borderRadius:14,border:`1px solid ${mode===id?'#4fe3ff':'#243349'}`,background:mode===id?'#0a2634dd':'#07111dcc',color:mode===id?'#4fe3ff':'#dbe8f3',fontWeight:900,textTransform:'uppercase',cursor:'pointer'}}>{id}</button>)}</div>
      <div style={{marginTop:18,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>{cards[mode].map(([title,body])=><section key={title} style={{minHeight:150,border:'1px solid #21405a',borderRadius:20,background:'linear-gradient(155deg,#081521e8,#05070ddb)',padding:18,boxShadow:'0 20px 50px #0008, inset 0 0 30px #4fe3ff09'}}><div style={{fontSize:12,color:'#4fe3ff',fontWeight:950,letterSpacing:1.5}}>{title}</div><p style={{fontSize:13,lineHeight:1.55,color:'#c8d5e4'}}>{body}</p></section>)}</div>
      {(mode==='live'||mode==='pk')&&<div style={{marginTop:14}}><HoloGiftEngine recipientId={mode==='pk'?'pk-host':'live-host'}/></div>}
      <section style={{marginTop:14,border:'1px solid #4fe3ff55',borderRadius:18,background:'#06111ce8',padding:14}}><div style={{fontSize:10,letterSpacing:2,color:'#4fe3ff',fontWeight:950}}>INSTANT CLIP</div><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:9}}>{[15,30,60].map(seconds=><button key={seconds} onClick={()=>setClipSeconds(seconds)} style={{...action,background:clipSeconds===seconds?'linear-gradient(135deg,#0e4354,#30213d)':'#08111a'}}>{seconds}s</button>)}<button onClick={makeClip} style={{...action,flex:'1 1 180px'}}>✂ MAKE {clipSeconds}s CLIP</button></div><div style={{fontSize:10,color:'#9fb0bd',marginTop:8}}>Clip → edit → Lottie/holographic effects → caption/music → render → save to phone or publish.</div></section>
      <div style={{marginTop:18,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10}}><button onClick={()=>launch('live')} style={action}>● OPEN LIVE CENTER</button><button onClick={()=>launch('studio')} style={action}>✦ OPEN POYO AI MAX</button><button onClick={()=>launch('media')} style={action}>🎬 OPEN REEL STUDIO</button></div>
      <div style={{marginTop:20,padding:16,borderRadius:18,border:'1px solid #e8b94455',background:'#110d05cc',fontSize:12,lineHeight:1.6,color:'#e8ddbd'}}>Architecture target: FEED → LIVE/PK → CLIP → LOTTIE/HOLO GIFT FX → AI REMIX → REEL/MOVIE → WORLD PORTAL → CREATOR ATTRIBUTION → COMMERCE → VERIFIED LEDGER/WALLET → RETURN. Visual effects are immediate; real tips remain non-withdrawable until payment-provider and ledger settlement succeed.</div>
    </div>
  </div>
}

const action:React.CSSProperties={padding:'13px 14px',borderRadius:14,border:'1px solid #4fe3ff66',background:'linear-gradient(135deg,#0b2635,#161226)',color:'#fff',fontWeight:900,cursor:'pointer',boxShadow:'0 10px 30px #0008'}
