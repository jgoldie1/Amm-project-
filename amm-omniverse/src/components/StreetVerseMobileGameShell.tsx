import {useEffect,useRef,useState} from 'react'

type Props={onClose:()=>void}
type Dir='up'|'down'|'left'|'right'

export default function StreetVerseMobileGameShell({onClose}:Props){
 const [mobile,setMobile]=useState(false)
 const active=useRef<Record<Dir,boolean>>({up:false,down:false,left:false,right:false})
 const emit=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-input',{detail:{throttle:active.current.up?1:0,brake:active.current.down?1:0,steer:active.current.left?-1:active.current.right?1:0,horn:false,exit:false,source:'mobile-game-shell'}}))
 const set=(direction:Dir,pressed:boolean)=>{active.current[direction]=pressed;emit()}
 const release=()=>{active.current={up:false,down:false,left:false,right:false};emit()}
 useEffect(()=>{setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')||Math.min(window.innerWidth,window.innerHeight)<=600);const stop=()=>release();window.addEventListener('blur',stop);window.addEventListener('pointercancel',stop);document.addEventListener('visibilitychange',stop);return()=>{window.removeEventListener('blur',stop);window.removeEventListener('pointercancel',stop);document.removeEventListener('visibilitychange',stop)}},[])
 if(!mobile)return null
 const control=(label:string,direction:Dir)=><button aria-label={`StreetVerse ${direction}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);set(direction,true)}} onPointerUp={e=>{try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{};set(direction,false)}} onPointerCancel={()=>set(direction,false)} onPointerLeave={e=>{if(e.buttons===0)set(direction,false)}} style={{width:56,height:52,borderRadius:15,border:'2px solid #7be9ff',background:'#020914ee',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none',boxShadow:'0 0 14px #00d9ff66'}}>{label}</button>
 const action=()=>{window.dispatchEvent(new CustomEvent('tryamm:streetverse-action',{detail:{source:'mobile-game-shell'}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{source:'mobile-game-shell'}}))}
 return <div data-streetverse-mobile-shell="v2" style={{position:'fixed',inset:0,zIndex:32000,pointerEvents:'none',fontFamily:'system-ui'}}>
  <div style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',left:10,padding:'5px 8px',borderRadius:9,background:'#00131fe8',border:'1px solid #35e7ff',color:'#9ff5ff',fontSize:10,fontWeight:900,pointerEvents:'none'}}>SV MOBILE SHELL • LIVE</div>
  <button onClick={onClose} aria-label="Exit StreetVerse" style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',right:10,width:44,height:44,borderRadius:22,border:'1px solid #567',background:'#07131fee',color:'#fff',fontSize:20,pointerEvents:'auto'}}>×</button>
  <div aria-label="StreetVerse movement controls" style={{position:'absolute',left:'max(12px,env(safe-area-inset-left))',bottom:'max(16px,env(safe-area-inset-bottom))',display:'grid',gridTemplateColumns:'56px 56px 56px',gap:6,pointerEvents:'auto'}}>
   <span/>{control('↑','up')}<span/>{control('←','left')}{control('↓','down')}{control('→','right')}
  </div>
  <button aria-label="StreetVerse action" onClick={action} style={{position:'absolute',right:'max(14px,env(safe-area-inset-right))',bottom:'max(28px,env(safe-area-inset-bottom))',minWidth:88,height:56,borderRadius:28,border:'2px solid #ffd65a',background:'#221900ee',color:'#fff',fontWeight:900,pointerEvents:'auto'}}>ACTION</button>
 </div>
}
