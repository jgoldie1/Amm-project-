import {useEffect,useMemo,useRef,useState} from 'react'

const SAVE_KEY='tryamm.streetverse.mobile-playable.v2'
const MISSIONS=[
 {id:'studio',label:'Aniyah 64 Track Studio',x:32,y:38},
 {id:'market',label:'All American Marketplace',x:70,y:42},
 {id:'river',label:'Chicago Riverwalk',x:52,y:22},
 {id:'stage',label:'Creator Stage',x:68,y:72},
]

type Pos={x:number;y:number}
function loadPos():Pos{try{const p=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');return {x:Number.isFinite(p.x)?p.x:50,y:Number.isFinite(p.y)?p.y:68}}catch{return{x:50,y:68}}}

const BUILDINGS=[
 {left:0,width:17,height:48,label:'TRYAMM TOWER'},{left:13,width:15,height:37,label:'OMNI MARKET'},{left:25,width:13,height:56,label:'64 TRACK'},{left:35,width:17,height:43,label:'HOLO PLAZA'},{left:49,width:13,height:62,label:'STUBBS AI'},{left:59,width:17,height:46,label:'CREATOR HUB'},{left:73,width:13,height:54,label:'OMNI CASH'},{left:84,width:16,height:41,label:'CHICAGO LIVE'},
]

const PEOPLE=[{left:'13%',top:'39%'},{left:'21%',top:'53%'},{left:'77%',top:'45%'},{left:'84%',top:'61%'},{left:'63%',top:'34%'}]

export default function StreetVerseMobilePlayableWorld({onClose}:{onClose:()=>void}){
 const [pos,setPos]=useState<Pos>(loadPos)
 const [message,setMessage]=useState('StreetVerse City is active • walk the avenue and reach a mission beacon.')
 const held=useRef({up:false,down:false,left:false,right:false})
 const roadShift=useMemo(()=>Math.max(-22,Math.min(22,(pos.x-50)*.45)),[pos.x])
 const forwardShift=useMemo(()=>Math.max(-18,Math.min(18,(68-pos.y)*.3)),[pos.y])

 useEffect(()=>{let raf=0,last=performance.now(),lastSave=0;const tick=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;const h=held.current;let dx=(h.right?1:0)-(h.left?1:0),dy=(h.down?1:0)-(h.up?1:0);if(dx||dy){const len=Math.hypot(dx,dy)||1;dx/=len;dy/=len;setPos(p=>({x:Math.max(4,Math.min(96,p.x+dx*24*dt)),y:Math.max(8,Math.min(92,p.y+dy*24*dt))}))}if(now-lastSave>800){lastSave=now;setPos(p=>{localStorage.setItem(SAVE_KEY,JSON.stringify({...p,updatedAt:new Date().toISOString()}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:(p.x-50)*1.8,z:(p.y-50)*1.8,speed:(dx||dy)?6:0,mobileSafeMode:true,htmlCity:true}}));return p})}raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);return()=>cancelAnimationFrame(raf)},[])
 useEffect(()=>{for(const m of MISSIONS){const d=Math.hypot(pos.x-m.x,pos.y-m.y);if(d<6){setMessage(`Reached ${m.label} • mission zone active.`);window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-mission-zone',{detail:{id:m.id,label:m.label}}));return}}setMessage('StreetVerse City is active • walk the avenue and reach a mission beacon.')},[pos])

 const press=(k:keyof typeof held.current,v:boolean)=>{held.current[k]=v}
 const btn=(label:string,k:keyof typeof held.current)=> <button aria-label={label} onPointerDown={e=>{e.preventDefault();press(k,true)}} onPointerUp={()=>press(k,false)} onPointerCancel={()=>press(k,false)} onPointerLeave={()=>press(k,false)} style={{width:58,height:58,borderRadius:17,border:'1px solid #7be9ff99',background:'#07131ff2',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none',boxShadow:'0 8px 25px #0008'}}>{label}</button>
 const openReel=()=>{window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'streetverse-mobile'}}));window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:'Opening Reel Creator'}}))}

 return <div data-streetverse-html-city="true" style={{position:'fixed',inset:0,zIndex:18000,background:'#07101b',color:'#fff',fontFamily:'system-ui',overflow:'hidden'}}>
  <header style={{height:64,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 12px',background:'#020712f5',borderBottom:'1px solid #274963',position:'relative',zIndex:40}}>
   <div><b style={{letterSpacing:.8}}>STREETVERSE • CHICAGO</b><div style={{fontSize:11,color:'#8effb7'}}>CITY ACTIVE • MOBILE WALK MODE</div></div>
   <div style={{display:'flex',gap:7}}><button onClick={openReel} aria-label="Open Reel Creator" style={{height:42,borderRadius:12,border:'1px solid #ff7ce8',background:'#251027',color:'#fff',fontWeight:900,padding:'0 11px'}}>● REEL</button><button onClick={onClose} aria-label="Close StreetVerse" style={{width:42,height:42,borderRadius:12,border:'1px solid #567',background:'#101923',color:'#fff',fontSize:22}}>×</button></div>
  </header>
  <main style={{position:'absolute',left:0,right:0,top:64,bottom:0,overflow:'hidden',background:'linear-gradient(#65a6c9 0%,#98cbe3 35%,#d9a979 36%,#19232b 67%,#070b10 100%)'}}>
   <div aria-hidden="true" style={{position:'absolute',left:0,right:0,top:0,height:'38%',background:'linear-gradient(#4a8eb9,#9cc8df 65%,#f3b172)',overflow:'hidden'}}><div style={{position:'absolute',right:'9%',top:'9%',width:52,height:52,borderRadius:'50%',background:'#ffe5a2',boxShadow:'0 0 55px #ffe5a2aa'}}/><div style={{position:'absolute',left:0,right:0,bottom:0,height:'82%',transform:`translateX(${roadShift*.18}px) translateY(${forwardShift*.14}px)`,transition:'transform 80ms linear'}}>{BUILDINGS.map((b,i)=><div key={b.label} style={{position:'absolute',left:`${b.left}%`,bottom:0,width:`${b.width}%`,height:`${b.height}%`,minHeight:90,border:'1px solid #111b25',background:i%3===0?'linear-gradient(90deg,#293b4a,#17232e)':i%3===1?'linear-gradient(90deg,#493d45,#26242c)':'linear-gradient(90deg,#304543,#182827)',boxShadow:'0 0 20px #0007'}}><div style={{position:'absolute',left:5,right:5,top:8,fontSize:7,fontWeight:900,textAlign:'center',color:'#d8f7ff',textShadow:'0 1px 3px #000'}}>{b.label}</div><div style={{position:'absolute',inset:'24px 8px 8px',background:'repeating-linear-gradient(90deg,#ffd978 0 4px,transparent 4px 12px),repeating-linear-gradient(0deg,#92dfff55 0 4px,transparent 4px 13px)',opacity:.8}}/></div>)}</div></div>
   <div aria-hidden="true" style={{position:'absolute',left:0,right:0,top:'34%',bottom:0,overflow:'hidden'}}>
    <div style={{position:'absolute',left:'-25%',right:'-25%',top:'2%',height:'22%',background:'#c8c2b1',clipPath:'polygon(0 0,100% 0,83% 100%,17% 100%)',borderTop:'5px solid #efeadc'}}/>
    <div style={{position:'absolute',left:'8%',right:'8%',top:'7%',bottom:'-15%',background:'#20242a',clipPath:'polygon(35% 0,65% 0,96% 100%,4% 100%)',boxShadow:'inset 0 0 0 2px #424850'}}><div style={{position:'absolute',left:'49.2%',top:0,bottom:0,width:'1.6%',background:'repeating-linear-gradient(180deg,#f9e46d 0 28px,transparent 28px 56px)',transform:`translateX(${roadShift}px)`}}/><div style={{position:'absolute',left:'23%',top:'16%',width:22,height:38,borderRadius:7,background:'#e64b45',boxShadow:'0 8px 16px #0008',transform:`translate(${roadShift*.35}px,${forwardShift}px) scale(.72)`}}><div style={{margin:'5px 3px',height:8,background:'#bde8ff',borderRadius:2}}/></div><div style={{position:'absolute',right:'24%',top:'31%',width:26,height:45,borderRadius:7,background:'#e6c845',boxShadow:'0 8px 16px #0008',transform:`translate(${-roadShift*.25}px,${-forwardShift*.45}px) scale(.88)`}}><div style={{margin:'5px 3px',height:9,background:'#bde8ff',borderRadius:2}}/></div><div style={{position:'absolute',left:'31%',top:'54%',width:30,height:50,borderRadius:8,background:'#3b7dde',boxShadow:'0 9px 18px #0009',transform:`translate(${roadShift*.2}px,${forwardShift*.3}px)`}}><div style={{margin:'6px 4px',height:10,background:'#bde8ff',borderRadius:2}}/></div></div>
    {PEOPLE.map((p,i)=><div key={i} style={{position:'absolute',left:p.left,top:p.top,width:14,height:32,zIndex:8,transform:`translateX(${roadShift*(i%2?.08:-.08)}px)`}}><div style={{width:11,height:11,borderRadius:'50%',background:i%2?'#6f442f':'#b57651',margin:'0 auto'}}/><div style={{width:13,height:16,borderRadius:'5px 5px 2px 2px',background:i%3===0?'#ff7ce8':i%3===1?'#7fe8c7':'#ffd166',margin:'1px auto'}}/><div style={{width:3,height:8,background:'#111',display:'inline-block',marginLeft:3}}/><div style={{width:3,height:8,background:'#111',display:'inline-block',marginLeft:3}}/></div>)}
    <div aria-label="Dog" style={{position:'absolute',right:'15%',top:'58%',zIndex:8,fontSize:22,filter:'drop-shadow(0 3px 3px #0008)'}}>🐕</div>
    <div style={{position:'absolute',left:'4%',top:'11%',padding:'6px 9px',borderRadius:7,background:'#0a3150',border:'2px solid #dceeff',fontSize:9,fontWeight:900}}>WACKER DR</div><div style={{position:'absolute',right:'5%',top:'15%',padding:'6px 9px',borderRadius:7,background:'#123d26',border:'2px solid #e4ffe8',fontSize:9,fontWeight:900}}>ALL AMERICAN MARKETPLACE</div>
    <div aria-label="Player" style={{position:'absolute',left:'50%',bottom:'17%',width:30,height:50,transform:'translateX(-50%)',zIndex:12}}><div style={{position:'absolute',left:8,top:0,width:15,height:15,borderRadius:'50%',background:'#8b5a3c',border:'2px solid #e9c6aa'}}/><div style={{position:'absolute',left:5,top:15,width:21,height:25,borderRadius:'8px 8px 5px 5px',background:'#23d9f4',border:'2px solid #fff',boxShadow:'0 0 20px #23d9f4aa'}}/><div style={{position:'absolute',left:8,top:39,width:6,height:11,background:'#111',borderRadius:3}}/><div style={{position:'absolute',right:7,top:39,width:6,height:11,background:'#111',borderRadius:3}}/></div>
    {MISSIONS.map((m,i)=><div key={m.id} title={m.label} style={{position:'absolute',left:`${18+i*21}%`,top:`${28+(i%2)*13}%`,zIndex:9,textAlign:'center',transform:`translateX(${roadShift*(i%2?.15:-.15)}px)`}}><div style={{width:14,height:14,margin:'auto',borderRadius:'50%',background:'#ffd65a',border:'2px solid #fff',boxShadow:'0 0 0 8px #ffd65a33,0 0 25px #ffd65a'}}/><div style={{marginTop:7,padding:'4px 6px',borderRadius:7,background:'#030914d9',fontSize:8,fontWeight:800,whiteSpace:'nowrap'}}>{m.label}</div></div>)}
   </div>
   <div style={{position:'absolute',left:10,right:10,top:10,zIndex:30,padding:'9px 11px',borderRadius:12,background:'#030914e8',border:'1px solid #4e7891',fontSize:12,boxShadow:'0 6px 20px #0007'}}>{message}</div>
   <div style={{position:'absolute',left:14,bottom:18,zIndex:35,display:'grid',gridTemplateColumns:'58px 58px 58px',gap:7}}><span/>{btn('↑','up')}<span/>{btn('←','left')}{btn('↓','down')}{btn('→','right')}</div>
   <div style={{position:'absolute',right:12,bottom:18,zIndex:35,maxWidth:160,padding:9,borderRadius:12,background:'#030914df',border:'1px solid #34566d',fontSize:10,lineHeight:1.35}}>HTML CITY MODE<br/><b style={{color:'#8effb7'}}>No WebGL required.</b><br/>People • traffic • dog • missions • Reel entry.</div>
  </main>
 </div>
}
