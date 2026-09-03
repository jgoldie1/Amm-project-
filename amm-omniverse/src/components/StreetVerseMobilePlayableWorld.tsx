import {useEffect,useRef,useState} from 'react'

const SAVE_KEY='tryamm.streetverse.mobile-playable.v1'
const WORLD=180
const MISSIONS=[
 {id:'studio',label:'Aniyah 64 Track Studio',x:32,y:38},
 {id:'market',label:'All American Marketplace',x:70,y:42},
 {id:'river',label:'Chicago Riverwalk',x:52,y:22},
 {id:'stage',label:'Creator Stage',x:68,y:72},
]

type Pos={x:number;y:number}
function loadPos():Pos{try{const p=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');return {x:Number.isFinite(p.x)?p.x:50,y:Number.isFinite(p.y)?p.y:68}}catch{return{x:50,y:68}}}

export default function StreetVerseMobilePlayableWorld({onClose}:{onClose:()=>void}){
 const [pos,setPos]=useState<Pos>(loadPos),[message,setMessage]=useState('StreetVerse Safe Play Mode • move through Chicago and reach mission markers.')
 const held=useRef({up:false,down:false,left:false,right:false})
 useEffect(()=>{
  let raf=0,last=performance.now(),lastSave=0
  const tick=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;const h=held.current;let dx=(h.right?1:0)-(h.left?1:0),dy=(h.down?1:0)-(h.up?1:0);if(dx||dy){const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;setPos(p=>({x:Math.max(4,Math.min(96,p.x+dx*24*dt)),y:Math.max(8,Math.min(92,p.y+dy*24*dt))}))}if(now-lastSave>800){lastSave=now;setPos(p=>{localStorage.setItem(SAVE_KEY,JSON.stringify({...p,updatedAt:new Date().toISOString()}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:(p.x-50)*1.8,z:(p.y-50)*1.8,speed:(dx||dy)?6:0,mobileSafeMode:true}}));return p})}raf=requestAnimationFrame(tick)}
  raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)
 },[])
 useEffect(()=>{for(const m of MISSIONS){const d=Math.hypot(pos.x-m.x,pos.y-m.y);if(d<5){setMessage(`Reached ${m.label} • mission zone active.`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-mission-zone',{detail:{id:m.id,label:m.label}}));break}}},[pos])
 const press=(k:keyof typeof held.current,v:boolean)=>{held.current[k]=v}
 const btn=(label:string,k:keyof typeof held.current)=> <button aria-label={label} onPointerDown={e=>{e.preventDefault();press(k,true)}} onPointerUp={()=>press(k,false)} onPointerCancel={()=>press(k,false)} onPointerLeave={()=>press(k,false)} style={{width:58,height:58,borderRadius:16,border:'1px solid #6fe8ff88',background:'#07131fe8',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none'}}>{label}</button>
 return <div style={{position:'fixed',inset:0,zIndex:16000,background:'#07101b',color:'#fff',fontFamily:'system-ui',overflow:'hidden'}}>
  <header style={{height:66,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 12px',background:'#030914ee',borderBottom:'1px solid #28425a'}}><div><b>STREETVERSE • CHICAGO</b><div style={{fontSize:11,color:'#8effb7'}}>SAFE PLAY MODE • CITY ACTIVE</div></div><button onClick={onClose} style={{width:42,height:42,borderRadius:12,border:'1px solid #567',background:'#101923',color:'#fff',fontSize:22}}>×</button></header>
  <div style={{position:'absolute',left:0,right:0,top:66,bottom:0,background:'linear-gradient(#162b39,#0b1721)'}}>
   <div style={{position:'absolute',inset:'3%',border:'2px solid #436273',borderRadius:18,overflow:'hidden',background:'#17251c'}}>
    {[20,50,80].map(v=><div key={'h'+v} style={{position:'absolute',left:0,right:0,top:`${v}%`,height:'10%',transform:'translateY(-50%)',background:'#242a31',borderTop:'1px solid #69727a',borderBottom:'1px solid #69727a'}}/>)}
    {[20,50,80].map(v=><div key={'v'+v} style={{position:'absolute',top:0,bottom:0,left:`${v}%`,width:'10%',transform:'translateX(-50%)',background:'#242a31',borderLeft:'1px solid #69727a',borderRight:'1px solid #69727a'}}/>)}
    {[[6,6,12,10],[30,5,12,12],[59,5,13,11],[84,7,9,12],[6,32,11,12],[32,32,12,12],[59,32,13,12],[84,32,9,12],[6,61,12,12],[31,61,13,12],[59,61,13,12],[84,61,9,12],[7,84,11,9],[32,84,12,9],[59,84,13,9],[84,84,9,9]].map((b,i)=><div key={i} style={{position:'absolute',left:`${b[0]}%`,top:`${b[1]}%`,width:`${b[2]}%`,height:`${b[3]}%`,borderRadius:5,background:['#263f54','#3b3153','#334c42','#533c30'][i%4],boxShadow:'0 5px 14px #0008'}}/>)}
    <div style={{position:'absolute',left:'43%',top:'13%',width:'14%',height:'5%',background:'#204d72',borderRadius:999,boxShadow:'0 0 15px #49a7ff88'}} title="Chicago River"/>
    {MISSIONS.map(m=><div key={m.id} style={{position:'absolute',left:`${m.x}%`,top:`${m.y}%`,transform:'translate(-50%,-50%)',width:18,height:18,borderRadius:'50%',background:'#ffd65a',boxShadow:'0 0 0 8px #ffd65a22,0 0 22px #ffd65a'}} title={m.label}/>) }
    <div style={{position:'absolute',left:`${pos.x}%`,top:`${pos.y}%`,transform:'translate(-50%,-50%)',width:22,height:22,borderRadius:'50%',background:'#67e8ff',border:'3px solid #fff',boxShadow:'0 0 0 8px #67e8ff22,0 0 24px #67e8ff',transition:'left 50ms linear,top 50ms linear'}}/>
   </div>
   <div style={{position:'absolute',left:12,top:12,right:12,padding:'9px 11px',borderRadius:12,background:'#030914dd',border:'1px solid #34566d',fontSize:12}}>{message}</div>
   <div style={{position:'absolute',left:14,bottom:18,display:'grid',gridTemplateColumns:'58px 58px 58px',gap:7}}><span/>{btn('↑','up')}<span/>{btn('←','left')}{btn('↓','down')}{btn('→','right')}</div>
   <div style={{position:'absolute',right:14,bottom:22,maxWidth:170,padding:9,borderRadius:12,background:'#030914dd',border:'1px solid #34566d',fontSize:10,lineHeight:1.4}}>This fallback keeps StreetVerse playable when the full 3D renderer is unavailable. Mission, dialogue, XP and Reel systems remain mounted around it.</div>
  </div>
 </div>
}
