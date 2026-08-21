import {useEffect,useState} from 'react'
import ConversionCommandCenter from './ConversionCommandCenter'
export default function ConversionCommandLauncher(){
 const [open,setOpen]=useState(false)
 useEffect(()=>{const fn=()=>setOpen(true);window.addEventListener('tryamm:conversion-open',fn);return()=>window.removeEventListener('tryamm:conversion-open',fn)},[])
 return <>{<button type="button" aria-label="Open TRYAMM Help and Explore" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:126,zIndex:8998,border:'1px solid #4FE3FF77',borderRadius:999,padding:'9px 12px',background:'#091522',color:'#fff',fontSize:10,fontWeight:900,cursor:'pointer'}}>✦ HELP • EXPLORE</button>}{open&&<ConversionCommandCenter onClose={()=>setOpen(false)}/>}</>
}
