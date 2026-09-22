import {useEffect,useState} from 'react'

type Props={onClose:()=>void}

const emit=(direction:'up'|'down'|'left'|'right',pressed:boolean)=>{
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-input',{detail:{direction,pressed,source:'mobile-game-shell'}}))
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobile-input',{detail:{direction,pressed,source:'mobile-game-shell'}}))
}

export default function StreetVerseMobileGameShell({onClose}:Props){
 const [mobile,setMobile]=useState(false)
 useEffect(()=>{setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')||Math.min(window.innerWidth,window.innerHeight)<=600)},[])
 if(!mobile)return null
 const control=(label:string,direction:'up'|'down'|'left'|'right')=><button aria-label={`StreetVerse ${direction}`} onPointerDown={e=>{e.preventDefault();emit(direction,true)}} onPointerUp={()=>emit(direction,false)} onPointerCancel={()=>emit(direction,false)} onPointerLeave={()=>emit(direction,false)} style={{width:56,height:52,borderRadius:15,border:'2px solid #7be9ff',background:'#020914ee',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none',boxShadow:'0 0 14px #00d9ff66'}}>{label}</button>
 return <div data-streetverse-mobile-shell="v1" style={{position:'fixed',inset:0,zIndex:32000,pointerEvents:'none',fontFamily:'system-ui'}}>
  <div style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',left:10,padding:'5px 8px',borderRadius:9,background:'#00131fe8',border:'1px solid #35e7ff',color:'#9ff5ff',fontSize:10,fontWeight:900,pointerEvents:'none'}}>SV MOBILE SHELL • LIVE</div>
  <button onClick={onClose} aria-label="Exit StreetVerse" style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',right:10,width:44,height:44,borderRadius:22,border:'1px solid #567',background:'#07131fee',color:'#fff',fontSize:20,pointerEvents:'auto'}}>×</button>
  <div aria-label="StreetVerse movement controls" style={{position:'absolute',left:'max(12px,env(safe-area-inset-left))',bottom:'max(16px,env(safe-area-inset-bottom))',display:'grid',gridTemplateColumns:'56px 56px 56px',gap:6,pointerEvents:'auto'}}>
   <span/>{control('↑','up')}<span/>{control('←','left')}{control('↓','down')}{control('→','right')}
  </div>
  <button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-action',{detail:{source:'mobile-game-shell'}}))} style={{position:'absolute',right:'max(14px,env(safe-area-inset-right))',bottom:'max(28px,env(safe-area-inset-bottom))',minWidth:88,height:56,borderRadius:28,border:'2px solid #ffd65a',background:'#221900ee',color:'#fff',fontWeight:900,pointerEvents:'auto'}}>ACTION</button>
 </div>
}
