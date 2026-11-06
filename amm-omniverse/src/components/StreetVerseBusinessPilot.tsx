import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {BUSINESSVERSE_VENUES} from '../data/streetverseBusinessVerseRegistry'

/** Standalone 3D BusinessVerse pilot. Not yet mounted in StreetVerse routing.
 *  Missions are demo-only; rewards and purchases are NOT settled here.
 *  Reuse existing ImmersiveWorldViewport for WebXR after integration. */
const PILOTS=BUSINESSVERSE_VENUES.filter(v=>['sculptify-nightlife-dining','michael-fine-dining-catering','kevon-capital-nights'].includes(v.id))
type Pilot=typeof PILOTS[number]
const INTERACTIONS:Record<string,{name:string;color:number;step:string}[]>={
 'sculptify-nightlife-dining':[{name:'Order Desk',color:0x32a6b3,step:'accept_order'},{name:'Prep Station',color:0xaaaaaa,step:'prepare'},{name:'Stove',color:0xff8b33,step:'cook'},{name:'Service Counter',color:0x52bc79,step:'serve'}],
 'michael-fine-dining-catering':[{name:'Order Desk',color:0x32a6b3,step:'accept_order'},{name:'Prep Station',color:0xaaaaaa,step:'prepare'},{name:'Oven',color:0xff8b33,step:'bake'},{name:'Packing Table',color:0x52bc79,step:'package'}],
 'kevon-capital-nights':[{name:'Staff Desk',color:0x32a6b3,step:'check_in'},{name:'DJ Booth',color:0xb17dff,step:'perform'},{name:'Bar Counter',color:0xff8b33,step:'serve'}]
}
export default function StreetVerseBusinessPilot({initialVenueId}:{initialVenueId?:string}={}){
 const mount=useRef<HTMLDivElement>(null)
 const [venue,setVenue]=useState<Pilot>(()=>PILOTS.find(v=>v.id===initialVenueId)||PILOTS[0])
 const [done,setDone]=useState<string[]>(()=>{
  try{const id=initialVenueId||PILOTS[0].id;const value=JSON.parse(localStorage.getItem('streetverse.business.pilot.'+id)||'[]');return Array.isArray(value)?value.filter((v:unknown)=>typeof v==='string'):[]}catch{return []}
 })
 const [message,setMessage]=useState('Select a station to begin a demo job.')
 const [available,setAvailable]=useState(true)
 const stations=INTERACTIONS[venue.id]||[]
 useEffect(()=>{try{localStorage.setItem('streetverse.business.pilot.'+venue.id,JSON.stringify(done))}catch{/* demo persistence unavailable */}},[venue.id,done])
 useEffect(()=>{
  const host=mount.current;if(!host)return
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x141827)
  const camera=new THREE.PerspectiveCamera(60,1,0.1,100);camera.position.set(0,7,13);camera.lookAt(0,0,0)
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));host.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0xffffff,0x384057,2))
  const lamp=new THREE.DirectionalLight(0xffffff,2);lamp.position.set(4,8,5);scene.add(lamp)
  const objects:THREE.Object3D[]=[]
  function block(w:number,h:number,d:number,x:number,y:number,z:number,color:number,selectable=false){
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.55}))
   mesh.position.set(x,y,z);scene.add(mesh);if(selectable)objects.push(mesh);return mesh
  }
  block(13,.2,11,0,-.1,0,0x353848)
  block(13,4,.2,0,2,-5.5,0x25293a)
  block(.2,4,11,-6.5,2,0,0x292d42)
  block(.2,4,11,6.5,2,0,0x292d42)
  const stationData=INTERACTIONS[venue.id]||[]
  stationData.forEach((s,i)=>{
   const x=-4.5+i*3
   const m=block(1.7,1.3,1.3,x,.65,-1.5,s.color,true)
   m.userData.station=i
   block(.35,.35,.35,x,1.5,-1.5,0xf8d994)
  })
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2()
  const click=(event:PointerEvent)=>{
   const rect=renderer.domElement.getBoundingClientRect()
   pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1)
   ray.setFromCamera(pointer,camera)
   const hit=ray.intersectObjects(objects)[0]
   if(hit){const i=hit.object.userData.station as number;const item=stationData[i];setMessage('Selected '+item.name+'. Use the action button below to complete the step.')}
  }
  renderer.domElement.addEventListener('pointerdown',click)
  const resize=()=>{const w=Math.max(host.clientWidth,1),h=Math.max(host.clientHeight,1);renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
  const observer=new ResizeObserver(resize);observer.observe(host);resize()
  let raf=0;const animate=()=>{raf=requestAnimationFrame(animate);renderer.render(scene,camera)};animate()
  setAvailable(true)
  return()=>{cancelAnimationFrame(raf);observer.disconnect();renderer.domElement.removeEventListener('pointerdown',click);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(v=>v.dispose());else m.dispose()}});renderer.dispose();renderer.domElement.remove()}
 },[venue])
 const finish=(step:string)=>{
  if(done.includes(step))return
  const next=[...done,step];setDone(next)
  setMessage(next.length===stations.length?'Demo shift complete! No money has been issued.':step.replaceAll('_',' ')+' completed.')
 }
 return <section aria-label="StreetVerse BusinessVerse 3D pilot" style={{maxWidth:920}}>
  <h2>StreetVerse BusinessVerse — 3D Pilot</h2>
  <label htmlFor="business-pilot-venue">Choose business</label>{' '}
  <select id="business-pilot-venue" value={venue.id} onChange={e=>{const next=PILOTS.find(v=>v.id===e.target.value);if(next){setVenue(next);try{const saved=JSON.parse(localStorage.getItem('streetverse.business.pilot.'+next.id)||'[]');setDone(Array.isArray(saved)?saved.filter((v:unknown)=>typeof v==='string'):[])}catch{setDone([])}setMessage('Business selected.')}}}>
   {PILOTS.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
  </select>
  <div ref={mount} style={{height:350,width:'100%',touchAction:'manipulation',borderRadius:12,overflow:'hidden'}} role="img" aria-label="3D room with interactive workstations"/>
  <p role="status">{available?message:'3D renderer unavailable'}</p>
  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
   {stations.map(s=><button key={s.step} type="button" disabled={done.includes(s.step)} onClick={()=>finish(s.step)} style={{padding:12,minHeight:44}}>{done.includes(s.step)?'✓ ':''}{s.name}: {s.step.replaceAll('_',' ')}</button>)}
  </div>
  <p>Local demo progress is saved in this browser. No player wallet credit, server mission verification, real-money charge or XR session. Existing WebXR runtime remains separate.</p>
 </section>
}
