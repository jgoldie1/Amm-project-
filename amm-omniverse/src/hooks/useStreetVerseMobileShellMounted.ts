import {useEffect,useState} from 'react'

export default function useStreetVerseMobileShellMounted(){
 const [mounted,setMounted]=useState(false)
 useEffect(()=>{
  if(typeof document==='undefined')return
  const sync=()=>setMounted(Boolean(document.querySelector('[data-streetverse-mobile-shell]')))
  sync()
  const observer=new MutationObserver(sync)
  observer.observe(document.body,{childList:true,subtree:true})
  const raf=requestAnimationFrame(sync)
  return()=>{cancelAnimationFrame(raf);observer.disconnect()}
 },[])
 return mounted
}
