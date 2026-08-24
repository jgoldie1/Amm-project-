import { useEffect } from 'react'

export default function HoloGPTEventAlias(){
  useEffect(()=>{
    const open=()=>{
      const show=(window as any).__showHoloGPT
      if(typeof show==='function')show()
      else window.dispatchEvent(new CustomEvent('tryamm:open-hologpt',{detail:{source:'event-alias'}}))
    }
    window.addEventListener('tryamm:hologpt-open',open)
    return()=>window.removeEventListener('tryamm:hologpt-open',open)
  },[])
  return null
}
