import { useRef, useState } from 'react'
type Vector={x:number;y:number}
export default function StreetVerseTouchJoystick(){
 const active=useRef<number|null>(null)
 const [vector,setVector]=useState<Vector>({x:0,y:0})
 const emit=(x:number,y:number)=>{
  const next={x:Math.max(-1,Math.min(1,x)),y:Math.max(-1,Math.min(1,y))}
  setVector(next)
  window.dispatchEvent(new CustomEvent('tryamm:immersive-touch-move',{detail:next}))
 }
 const move=(event:React.PointerEvent<HTMLDivElement>)=>{
  if(active.current!==event.pointerId)return
  const box=event.currentTarget.getBoundingClientRect()
  const radius=Math.min(box.width,box.height)/2
  emit((event.clientX-box.left-box.width/2)/radius,(event.clientY-box.top-box.height/2)/radius)
 }
 const release=(event:React.PointerEvent<HTMLDivElement>)=>{
  if(active.current!==event.pointerId)return
  active.current=null;emit(0,0)
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)
 }
 return <div role="group" aria-label="Move in StreetVerse with one hand" style={{position:'absolute',bottom:'max(24px,env(safe-area-inset-bottom))',left:16,zIndex:5,display:'grid',gap:4,justifyItems:'center',touchAction:'none'}}>
  <div onPointerDown={event=>{active.current=event.pointerId;event.currentTarget.setPointerCapture(event.pointerId);move(event)}} onPointerMove={move} onPointerUp={release} onPointerCancel={release} style={{position:'relative',width:132,height:132,borderRadius:'50%',border:'2px solid #8feaff',background:'rgba(4,25,45,.67)',boxShadow:'0 0 22px #0bf4',touchAction:'none',userSelect:'none'}} aria-label="Touch joystick for walking">
   <div style={{position:'absolute',left:'50%',top:'50%',width:50,height:50,borderRadius:'50%',background:'#9be9ff',border:'3px solid #14506a',transform:`translate(calc(-50% + ${vector.x*35}px),calc(-50% + ${vector.y*35}px))`,pointerEvents:'none'}}/>
  </div>
  <span style={{fontSize:11,fontWeight:800,color:'#fff',textShadow:'0 1px 4px black'}}>MOVE</span>
 </div>
}
