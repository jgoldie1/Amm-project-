import {useEffect,useRef,useState} from 'react'

type Props={onClose:()=>void}
type Dir='up'|'down'|'left'|'right'
type ControlMode='one-hand'|'two-hand'

const MODE_KEY='tryamm:streetverse-control-mode'

export default function StreetVerseMobileGameShell({onClose}:Props){
 const [mobile,setMobile]=useState(false)
 const [mode,setMode]=useState<ControlMode>('one-hand')
 const active=useRef<Record<Dir,boolean>>({up:false,down:false,left:false,right:false})
 const emit=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-input',{detail:{throttle:active.current.up?1:0,brake:active.current.down?1:0,steer:active.current.left?-1:active.current.right?1:0,horn:false,exit:false,source:'mobile-game-shell'}}))
 const set=(direction:Dir,pressed:boolean)=>{active.current[direction]=pressed;emit()}
 const release=()=>{active.current={up:false,down:false,left:false,right:false};emit()}
 useEffect(()=>{
  setMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')||Math.min(window.innerWidth,window.innerHeight)<=600)
  try{const saved=localStorage.getItem(MODE_KEY);if(saved==='one-hand'||saved==='two-hand')setMode(saved)}catch{}
  const stop=()=>release()
  window.addEventListener('blur',stop);window.addEventListener('pointercancel',stop);document.addEventListener('visibilitychange',stop)
  return()=>{window.removeEventListener('blur',stop);window.removeEventListener('pointercancel',stop);document.removeEventListener('visibilitychange',stop)}
 },[])
 if(!mobile)return null
 const changeMode=(next:ControlMode)=>{release();setMode(next);try{localStorage.setItem(MODE_KEY,next)}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-control-mode',{detail:{mode:next}}))}
 const control=(label:string,direction:Dir)=><button aria-label={`StreetVerse ${direction}`} onPointerDown={e=>{e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);set(direction,true)}} onPointerUp={e=>{try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{};set(direction,false)}} onPointerCancel={()=>set(direction,false)} onPointerLeave={e=>{if(e.buttons===0)set(direction,false)}} style={{width:56,height:52,borderRadius:15,border:'2px solid #7be9ff',background:'#020914ee',color:'#fff',fontSize:24,fontWeight:900,touchAction:'none',boxShadow:'0 0 14px #00d9ff66'}}>{label}</button>
 const action=()=>{if(navigator.vibrate)try{navigator.vibrate(12)}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-action',{detail:{source:'mobile-game-shell',mode}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{source:'mobile-game-shell',mode}}))}
 const camera=(direction:'left'|'right')=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-camera-input',{detail:{direction,source:'mobile-game-shell'}}))
 const bottom='max(16px,env(safe-area-inset-bottom))'
 return <div data-streetverse-mobile-shell="v3" data-control-mode={mode} style={{position:'fixed',inset:0,zIndex:32000,pointerEvents:'none',fontFamily:'system-ui',userSelect:'none',WebkitUserSelect:'none'}}>
  <div style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',left:'max(10px,env(safe-area-inset-left))',display:'flex',gap:6,pointerEvents:'auto'}}>
   <button aria-pressed={mode==='one-hand'} onClick={()=>changeMode('one-hand')} style={modeButton(mode==='one-hand')}>1 HAND</button>
   <button aria-pressed={mode==='two-hand'} onClick={()=>changeMode('two-hand')} style={modeButton(mode==='two-hand')}>2 HAND</button>
  </div>
  <button onClick={onClose} aria-label="Exit StreetVerse" style={{position:'absolute',top:'max(8px,env(safe-area-inset-top))',right:'max(10px,env(safe-area-inset-right))',width:44,height:44,borderRadius:22,border:'1px solid #567',background:'#07131fee',color:'#fff',fontSize:20,pointerEvents:'auto'}}>×</button>
  <div aria-label="StreetVerse movement controls" style={{position:'absolute',left:'max(12px,env(safe-area-inset-left))',bottom,display:'grid',gridTemplateColumns:'56px 56px 56px',gap:6,pointerEvents:'auto'}}>
   <span/>{control('↑','up')}<span/>{control('←','left')}{control('↓','down')}{control('→','right')}
  </div>
  {mode==='two-hand'&&<div aria-label="StreetVerse camera controls" style={{position:'absolute',right:'max(14px,env(safe-area-inset-right))',bottom:'max(92px,calc(env(safe-area-inset-bottom) + 92px))',display:'flex',gap:8,pointerEvents:'auto'}}>
   <button aria-label="Look left" onClick={()=>camera('left')} style={secondaryButton}>↶</button>
   <button aria-label="Look right" onClick={()=>camera('right')} style={secondaryButton}>↷</button>
  </div>}
  <button aria-label="StreetVerse smart action" onClick={action} style={{position:'absolute',right:'max(14px,env(safe-area-inset-right))',bottom:'max(28px,env(safe-area-inset-bottom))',minWidth:96,height:58,borderRadius:29,border:'2px solid #ffd65a',background:'#221900ee',color:'#fff',fontWeight:900,pointerEvents:'auto',touchAction:'manipulation'}}>ACTION</button>
 </div>
}

const modeButton=(active:boolean)=>({minHeight:44,padding:'0 10px',borderRadius:12,border:`1px solid ${active?'#ffd65a':'#456'}`,background:active?'#221900ee':'#07131fee',color:'#fff',fontSize:10,fontWeight:900,touchAction:'manipulation'} as const)
const secondaryButton={width:52,height:48,borderRadius:16,border:'1px solid #7be9ff',background:'#020914dd',color:'#fff',fontSize:22,fontWeight:900,touchAction:'manipulation'} as const
