import {useEffect,useState} from 'react'
import HoloArenaOperatorConsole from './HoloArenaOperatorConsole'
export default function HoloArenaLauncher(){
 const [open,setOpen]=useState(false)
 useEffect(()=>{const fn=()=>setOpen(true);window.addEventListener('tryamm:holoarena-open',fn);(window as any).__showHoloArena=fn;return()=>{window.removeEventListener('tryamm:holoarena-open',fn);if((window as any).__showHoloArena===fn)delete (window as any).__showHoloArena}},[])
 return <>{<button type="button" aria-label="Open TRYAMM HoloArena" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:122,zIndex:9000,border:'1px solid #8b5cf699',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#160d2d,#0a2130)',color:'#fff',fontWeight:900,fontSize:10,cursor:'pointer'}}>🥽 HOLOARENA</button>}{open&&<HoloArenaOperatorConsole onClose={()=>setOpen(false)}/>}</>
}
