import {useState,type CSSProperties,type KeyboardEvent} from 'react'

type Zone='shore'|'boat'|'fishing'|'dialogue'|'reflection'
type Spot={id:Zone;x:number;y:number;symbol:string;label:string}
const PLACES:readonly Spot[]=[
 {id:'shore',x:1,y:1,symbol:'🌅',label:'Shore'},
 {id:'boat',x:6,y:1,symbol:'⛵',label:'Boat'},
 {id:'fishing',x:6,y:4,symbol:'🎣',label:'Fishing'},
 {id:'dialogue',x:2,y:4,symbol:'📖',label:'Gospel Study'},
 {id:'reflection',x:1,y:5,symbol:'🕊️',label:'Reflect'}
]
const KEY='tryamm:faithverse:galilee:player-position:v1'
type Point={x:number;y:number}
function readPlayer():Point{try{const d=JSON.parse(localStorage.getItem(KEY)||'{}');return{x:Number.isInteger(d.x)?Math.min(7,Math.max(0,d.x)):0,y:Number.isInteger(d.y)?Math.min(5,Math.max(0,d.y)):0}}catch{return{x:0,y:0}}}
const btn:CSSProperties={minHeight:58,background:'#17435b',color:'#fff',border:'1px solid #8dc4d0',borderRadius:14,padding:'10px 16px',fontSize:20,fontWeight:900,cursor:'pointer',touchAction:'manipulation'}
export default function FaithGalileePlayfield({onReach}:{onReach:(target:Zone)=>void}){
 const [position,setPosition]=useState<Point>(readPlayer)
 const [note,setNote]=useState('Move the player using arrow keys or one-hand buttons, then interact near a landmark.')
 const move=(dx:number,dy:number)=>{
  const next={x:Math.max(0,Math.min(7,position.x+dx)),y:Math.max(0,Math.min(5,position.y+dy))}
  setPosition(next);try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}
  const close=PLACES.find(s=>Math.abs(s.x-next.x)+Math.abs(s.y-next.y)<=1)
  setNote(close?'Near '+close.label+'. Choose INTERACT to enter that location.':'Move toward a highlighted landmark.')
 }
 const interact=()=>{
  const close=PLACES.find(s=>Math.abs(s.x-position.x)+Math.abs(s.y-position.y)<=1)
  if(!close){setNote('Move to within one square of a landmark to interact.');return}
  onReach(close.id);setNote('Entered '+close.label+'. Complete that activity using the mission controls.')
 }
 const onKey=(e:KeyboardEvent<HTMLDivElement>)=>{
  const dirs:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}
  if(dirs[e.key]){e.preventDefault();move(...dirs[e.key])}
  if(e.key==='Enter'||e.key===' '){e.preventDefault();interact()}
 }
 return <section aria-label="Galilee one-handed playable map" style={{background:'#0b2936',color:'#fff',border:'1px solid #6b9eab',borderRadius:16,padding:'clamp(12px,3vw,18px)',display:'grid',gap:12}}>
  <h2 style={{fontSize:21,margin:0}}>Walk the Galilee shoreline · 2D accessible fallback</h2>
  <p style={{fontSize:13,lineHeight:1.6,margin:0}}>The symbols are interactive roleplay waypoints, not historically verified 3D scenery. Use the arrow controls and INTERACT to choose a location.</p>
  <div tabIndex={0} onKeyDown={onKey} role="application" aria-label="Galilee game area; arrows move and Enter interacts" style={{outlineOffset:5,border:'2px solid #64939e',borderRadius:12,background:'linear-gradient(#456b75,#2e6874 65%,#124b5f 65%)',padding:5}}>
   <div aria-hidden="true" style={{display:'grid',gridTemplateColumns:'repeat(8,minmax(0,1fr))',gap:2}}>
    {Array.from({length:48},(_,i)=>{const x=i%8,y=Math.floor(i/8),spot=PLACES.find(p=>p.x===x&&p.y===y),here=x===position.x&&y===position.y;return <div key={i} style={{aspectRatio:'1',minHeight:30,borderRadius:6,display:'grid',placeItems:'center',border:spot?'1px solid #f4d785':'1px solid #a1d6db33',background:here?'#f1d59e':spot?'#32546a':'#16344366',color:here?'#051922':'#fff',fontSize:'clamp(15px,3.5vw,28px)'}}>{here?'🧍':spot?.symbol||''}</div>})}
   </div>
  </div>
  <p role="status" aria-live="polite" style={{fontSize:14,lineHeight:1.6,margin:0}}>{note} · Position ({position.x+1}, {position.y+1})</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8}}>
   <div/><button style={btn} onClick={()=>move(0,-1)} aria-label="Move north">↑</button><div/>
   <button style={btn} onClick={()=>move(-1,0)} aria-label="Move west">←</button>
   <button style={{...btn,fontSize:15,background:'#2e674b'}} onClick={interact}>INTERACT</button>
   <button style={btn} onClick={()=>move(1,0)} aria-label="Move east">→</button>
   <div/><button style={btn} onClick={()=>move(0,1)} aria-label="Move south">↓</button><div/>
  </div>
  <p style={{fontSize:12,color:'#d4e5ea',lineHeight:1.5,margin:0}}>Landmarks: shore, boat, fishing, Gospel study, and reflection. Movement and checkpoint position stay on this device. No online multiplayer or 3D collision is asserted.</p>
 </section>
}
