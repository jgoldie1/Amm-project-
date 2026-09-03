import { useEffect, useRef, useState } from 'react'

export default function StreetVerseGamepadBridge(){
  const [connected,setConnected]=useState(false)
  const [driving,setDriving]=useState(false)
  const prevRef=useRef({enter:false,horn:false})

  useEffect(()=>{
    const onControlled=(event:Event)=>setDriving(Boolean((event as CustomEvent<{entered?:boolean}>).detail?.entered))
    window.addEventListener('tryamm:streetverse-vehicle-controlled',onControlled)
    let raf=0
    const poll=()=>{
      const gp=(navigator.getGamepads?.()||[])[0]
      setConnected(Boolean(gp))
      if(gp){
        const steer=Math.abs(gp.axes?.[0]||0)>.16?(gp.axes?.[0]||0):0
        const throttle=Math.max(gp.buttons?.[7]?.value||0,gp.buttons?.[0]?.pressed?1:0)
        const brake=gp.buttons?.[6]?.value||0
        const enter=Boolean(gp.buttons?.[3]?.pressed||gp.buttons?.[9]?.pressed)
        const horn=Boolean(gp.buttons?.[1]?.pressed)
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-input',{detail:{steer,throttle,brake,horn}}))
        if(enter&&!prevRef.current.enter){
          window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-interact',{detail:{entered:!driving,source:'gamepad'}}))
        }
        if(horn&&!prevRef.current.horn){
          window.dispatchEvent(new CustomEvent('tryamm:streetverse-drive-sound',{detail:{kind:'horn',source:'gamepad'}}))
        }
        prevRef.current={enter,horn}
      }else{
        prevRef.current={enter:false,horn:false}
      }
      raf=requestAnimationFrame(poll)
    }
    poll()
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('tryamm:streetverse-vehicle-controlled',onControlled)}
  },[driving])

  return <div aria-live="polite" style={{position:'fixed',right:14,top:134,zIndex:16996,pointerEvents:'none',padding:'6px 9px',borderRadius:999,background:'#03111ddd',border:'1px solid #8effb744',color:connected?'#8effb7':'#a8b5c2',fontSize:9,fontWeight:900,fontFamily:'system-ui,sans-serif'}}>
    {connected?(driving?'🎮 CONTROLLER • DRIVING':'🎮 CONTROLLER • READY'):'🎮 CONTROLLER • DISCONNECTED'}
  </div>
}
