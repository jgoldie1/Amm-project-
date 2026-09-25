import {useEffect,useRef,useState} from 'react'

type Dir='up'|'down'|'left'|'right'

export default function StreetVerseMobileWalkControls(){
 const [mobile,setMobile]=useState(false)
 const active=useRef<Record<Dir,boolean>>({up:false,down:false,left:false,right:false})
 useEffect(()=>{setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||''));return()=>releaseAll()},[])
 const emit=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-input',{detail:{throttle:active.current.up?1:0,brake:active.current.down?1:0,steer:active.current.left?-1:active.current.right?1:0,horn:false,exit:false,source:'mobile-walk'}}))
 const set=(dir:Dir,value:boolean)=>{active.current[dir]=value;if(value&&navigator.vibrate)try{navigator.vibrate(10)}catch{};emit()}
 const releaseAll=()=>{active.current={up:false,down:false,left:false,right:false};emit()}
 useEffect(()=>{const release=()=>releaseAll();window.addEventListener('blur',release);window.addEventListener('pointercancel',release);document.addEventListener('visibilitychange',release);return()=>{window.removeEventListener('blur',release);window.removeEventListener('pointercancel',release);document.removeEventListener('visibilitychange',release)}},[])
 if(!mobile)return null
 return <div aria-label="StreetVerse mobile walking controls" style={{position:'fixed',left:10,bottom:'max(18px, env(safe-area-inset-bottom))',zIndex:17030,width:172,height:150,pointerEvents:'none',fontFamily:'system-ui',userSelect:'none',WebkitUserSelect:'none'}}>
   <div style={{position:'absolute',left:55,top:0}}><Pad label="▲" dir="up" onSet={set}/></div>
   <div style={{position:'absolute',left:0,top:50}}><Pad label="◀" dir="left" onSet={set}/></div>
   <div style={{position:'absolute',left:110,top:50}}><Pad label="▶" dir="right" onSet={set}/></div>
   <div style={{position:'absolute',left:55,top:100}}><Pad label="▼" dir="down" onSet={set}/></div>
   <div style={{position:'absolute',left:48,top:58,width:76,textAlign:'center',color:'#bfefff',fontSize:9,fontWeight:900,letterSpacing:'.08em'}}>MOVE</div>
 </div>
}

function Pad({label,dir,onSet}:{label:string;dir:Dir;onSet:(d:Dir,v:boolean)=>void}){
 return <button aria-label={`Move ${dir}`} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);onSet(dir,true)}} onPointerUp={e=>{try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{};onSet(dir,false)}} onPointerCancel={()=>onSet(dir,false)} onPointerLeave={e=>{if(e.buttons===0)onSet(dir,false)}} style={{pointerEvents:'auto',width:58,height:48,borderRadius:14,border:'1px solid #66dcff99',background:'rgba(4,20,31,.9)',color:'#dffaff',fontSize:20,fontWeight:950,touchAction:'none',WebkitTapHighlightColor:'transparent',boxShadow:'0 6px 18px #0008'}}>{label}</button>
}
