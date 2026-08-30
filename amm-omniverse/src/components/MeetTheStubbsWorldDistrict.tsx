import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Character={name:string;role:string;color:number;skin:number;x:number;z:number}
type WorldStore={world:string;store:string;description:string;action?:()=>void}

const CHARACTERS:Character[]=[
  {name:'BJ',role:'Family / StreetVerse',color:0x4fe3ff,skin:0x8a5638,x:-18,z:2},
  {name:'Al B',role:'Family / StreetVerse',color:0xe8b944,skin:0x7a472f,x:-12,z:-5},
  {name:'Kenosha',role:'Mom / Legacy',color:0xff6fae,skin:0x9a6443,x:-6,z:3},
  {name:'Raymond Jarreau',role:'Uncle / Legacy',color:0x77d98b,skin:0x75472f,x:0,z:-5},
  {name:'Shawndell Shelton',role:'Sister / Legacy',color:0xa68bff,skin:0x9b6647,x:6,z:3},
  {name:'Deon Ham',role:'Family / StreetVerse',color:0xff8b5c,skin:0x815039,x:12,z:-5},
  {name:'Asia Watson',role:'Family / StreetVerse',color:0x59e7ff,skin:0x9a674d,x:18,z:2},
]

const WORLD_STORES:WorldStore[]=[
  {world:'StreetVerse',store:'All American Marketplace',description:'Walkable city commerce, missions, creators and local businesses.',action:()=>{(window as any).__showHoloMarketplace?.()}},
  {world:'My World',store:'Creator Build Store',description:'Build personal rooms, businesses, scenes and portable creator assets.',action:()=>{(window as any).__showMetaverseBusinessBuilder?.()}},
  {world:'We Are the World',store:'Global Community Market',description:'Discover cities, cultures, creators and approved merchants worldwide.',action:()=>{(window as any).__showGlobalGrowthHub?.()}},
  {world:'Kingdom',store:'Kingdoms Press & Learning',description:'Books, workbooks, publishing, education and legacy experiences.',action:()=>{(window as any).__showKingdomsPress?.()}},
  {world:'StarVerse',store:'Isaiah AI TV / Star Studio',description:'Performance, sports, broadcast, talent discovery and media commerce.',action:()=>{(window as any).__showIsaiahTV?.()}},
  {world:'Metaverse',store:'Holo Storefronts',description:'Social venues, concerts, virtual stores, events and product placement.',action:()=>{(window as any).__showHoloverse?.()}},
  {world:'MiddleVerse',store:'Portal & Remote Work Exchange',description:'Portal travel, identity continuity, discovery, jobs and remote work.',action:()=>{(window as any).__showMiddleverse?.()}},
  {world:'HoloVerse',store:'Holo Ads + Holo Services',description:'Spatial ads, services, holographic interfaces and mixed-reality commerce.',action:()=>{(window as any).__showHoloServices?.()}},
  {world:'SpaceVerse',store:'Space Mission Supply',description:'Simulated mission supplies, settlements, exploration and creator expeditions.',action:()=>{(window as any).__showAdvancedWorlds?.()}},
  {world:'Multiverse',store:'Alternate Worlds Exchange',description:'Fictional branches, scenarios, portable assets and creator universes.',action:()=>{(window as any).__showImmersiveWorlds?.()}},
  {world:'QuantumVerse',store:'Quantum Experience Lab',description:'Quantum Zoom, Quantum Time and provenance-aware simulation experiences.',action:()=>{(window as any).__showQuantumZoom?.()}},
  {world:'GameVerse',store:'Game & Mission Arcade',description:'Playable missions, tournaments, StreetVerse game loops and rewards.',action:()=>{(window as any).__showQuantumTag?.()}},
  {world:'CreatorVerse',store:'64-Track + Creator Commerce',description:'Music, Reels, Holo Drama, creator inventory and sellable media.',action:()=>{(window as any).__showMediaStudio?.()}},
]

function person(character:Character){
  const g=new THREE.Group()
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1.5,5,10),new THREE.MeshStandardMaterial({color:character.color,roughness:.65,metalness:.08}))
  torso.position.y=1.75;g.add(torso)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.46,16,12),new THREE.MeshStandardMaterial({color:character.skin,roughness:.78}))
  head.position.y=3.15;g.add(head)
  for(const side of [-1,1]){
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.3,1.15,.34),new THREE.MeshStandardMaterial({color:0x20242b,roughness:.9}))
    leg.position.set(side*.22,.58,0);g.add(leg)
  }
  g.userData.character=character
  return g
}

function storeBuilding(index:number){
  const g=new THREE.Group()
  const color=[0x17364a,0x39284f,0x254937,0x5a4024,0x263e62][index%5]
  const shell=new THREE.Mesh(new THREE.BoxGeometry(8,5.5,7),new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.15}))
  shell.position.y=2.75;g.add(shell)
  const door=new THREE.Mesh(new THREE.BoxGeometry(2.4,3.5,.2),new THREE.MeshBasicMaterial({color:0x58e8ff}))
  door.position.set(0,1.75,3.61);g.add(door)
  const sign=new THREE.Mesh(new THREE.BoxGeometry(6.3,.65,.22),new THREE.MeshBasicMaterial({color:index%2?0xe8b944:0x79ffad}))
  sign.position.set(0,4.7,3.62);g.add(sign)
  return g
}

export default function MeetTheStubbsWorldDistrict({onClose}:{onClose:()=>void}){
  const mount=useRef<HTMLDivElement|null>(null)
  const [selected,setSelected]=useState<WorldStore>(WORLD_STORES[0])
  const [message,setMessage]=useState('Meet the Stubbs is loaded as named StreetVerse characters. Select one of the 13 world storefronts below.')

  useEffect(()=>{
    const root=mount.current;if(!root)return
    const scene=new THREE.Scene();scene.background=new THREE.Color(0x050914);scene.fog=new THREE.Fog(0x050914,45,150)
    const camera=new THREE.PerspectiveCamera(55,1,.1,260);camera.position.set(0,25,52);camera.lookAt(0,2,0)
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;root.appendChild(renderer.domElement)
    scene.add(new THREE.HemisphereLight(0x9bdfff,0x171018,2.5));const light=new THREE.DirectionalLight(0xffffff,2.8);light.position.set(35,55,25);light.castShadow=true;scene.add(light)
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,78),new THREE.MeshStandardMaterial({color:0x101923,roughness:.95}));ground.rotation.x=-Math.PI/2;scene.add(ground)
    const plaza=new THREE.Mesh(new THREE.CylinderGeometry(24,24,.25,48),new THREE.MeshStandardMaterial({color:0x182632,roughness:.85}));plaza.position.y=.12;scene.add(plaza)

    const familyMeshes=CHARACTERS.map(c=>{const p=person(c);p.position.set(c.x,0,c.z);scene.add(p);return p})
    const stores:THREE.Group[]=[]
    WORLD_STORES.forEach((_,i)=>{const angle=(i/WORLD_STORES.length)*Math.PI*2;const g=storeBuilding(i);g.position.set(Math.cos(angle)*36,0,Math.sin(angle)*27);g.rotation.y=-angle+Math.PI/2;scene.add(g);stores.push(g)})

    let raf=0;const clock=new THREE.Clock()
    const animate=()=>{const t=clock.getElapsedTime();familyMeshes.forEach((p,i)=>{p.rotation.y=Math.sin(t*.5+i)*.18;p.position.y=Math.sin(t*1.4+i)*.035});stores.forEach((s,i)=>{s.position.y=.04+Math.sin(t*.75+i)*.04});renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
    const resize=()=>{const w=root.clientWidth,h=Math.max(340,root.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const ro=new ResizeObserver(resize);ro.observe(root);resize();animate()
    return()=>{cancelAnimationFrame(raf);ro.disconnect();renderer.dispose();renderer.domElement.remove();scene.traverse(o=>{const any=o as any;any.geometry?.dispose?.();const m=any.material;if(Array.isArray(m))m.forEach((x:any)=>x.dispose?.());else m?.dispose?.()})}
  },[])

  return <div style={{position:'fixed',inset:0,zIndex:16000,background:'#030711',color:'#fff',overflow:'auto'}}>
    <div style={{maxWidth:1280,margin:'0 auto',padding:14}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
        <div><div style={{color:'#4fe3ff',fontSize:10,fontWeight:950,letterSpacing:3}}>STREETVERSE • FAMILY • WORLD COMMERCE</div><h1 style={{margin:'5px 0'}}>Meet the Stubbs — 13 World Store District</h1><p style={{margin:0,color:'#aab9c7',maxWidth:850}}>Named family characters are rendered in the 3D district. The 13 gateways connect StreetVerse commerce to the existing TRYAMM warehouse, Holo Fridge, creator, media, education and world systems.</p></div>
        <button onClick={onClose} style={{border:'1px solid #4fe3ff77',borderRadius:12,padding:'10px 14px',background:'#0b1a27',color:'#fff',fontWeight:900}}>Back</button>
      </header>
      <div ref={mount} style={{height:'48vh',minHeight:340,border:'1px solid #24394b',borderRadius:20,overflow:'hidden',marginTop:12}} />
      <div style={{padding:'10px 12px',marginTop:10,border:'1px solid #294055',borderRadius:14,background:'#08121c',color:'#d8e2eb'}}>{message}</div>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))',gap:9,marginTop:10}}>
        {WORLD_STORES.map((s,i)=><button key={s.world} onClick={()=>{setSelected(s);setMessage(`${s.world} → ${s.store} selected.`)}} style={{textAlign:'left',padding:13,border:selected.world===s.world?'1px solid #58e8ff':'1px solid #24394b',borderRadius:15,background:selected.world===s.world?'#102538':'#08121c',color:'#fff',cursor:'pointer'}}><div style={{fontSize:10,color:'#4fe3ff',fontWeight:950}}>WORLD {String(i+1).padStart(2,'0')}</div><b>{s.world}</b><div style={{color:'#e8b944',marginTop:4,fontWeight:900}}>{s.store}</div><p style={{fontSize:11,color:'#9fb0bf',lineHeight:1.45}}>{s.description}</p></button>)}
      </section>
      <section style={{marginTop:12,padding:14,border:'1px solid #294055',borderRadius:16,background:'#08121c'}}><h2 style={{marginTop:0}}>{selected.world}: {selected.store}</h2><p style={{color:'#aebdca'}}>{selected.description}</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={()=>selected.action?.()} style={{border:'1px solid #79ffad88',borderRadius:11,padding:'10px 13px',background:'#0d241a',color:'#fff',fontWeight:900}}>Open connected experience</button><button onClick={()=>{(window as any).__showVirtualWarehouse?.();setMessage('Global Virtual Warehouse opened from the world-store district.')}} style={{border:'1px solid #4fe3ff77',borderRadius:11,padding:'10px 13px',background:'#0b1a27',color:'#fff',fontWeight:900}}>Open Warehouse</button><button onClick={()=>{(window as any).__showHoloFridge?.();setMessage('Holo Fridge opened from the world-store district.')}} style={{border:'1px solid #4fe3ff77',borderRadius:11,padding:'10px 13px',background:'#0b1a27',color:'#fff',fontWeight:900}}>Open Holo Fridge</button><button onClick={()=>{(window as any).__showYahavahGrocery?.();setMessage('YAHAVAH Grocery requested from the world-store district.')}} style={{border:'1px solid #e8b94488',borderRadius:11,padding:'10px 13px',background:'#211b0d',color:'#fff',fontWeight:900}}>YAHAVAH Grocery</button></div></section>
      <section style={{marginTop:12,padding:14,border:'1px solid #294055',borderRadius:16,background:'#08121c'}}><h2 style={{marginTop:0}}>Meet the Stubbs roster in this build</h2><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{CHARACTERS.map(c=><span key={c.name} style={{padding:'8px 10px',borderRadius:999,border:'1px solid #31485c',background:'#0b1722'}}><b>{c.name}</b> <span style={{color:'#8fa3b5'}}>• {c.role}</span></span>)}</div></section>
    </div>
  </div>
}
