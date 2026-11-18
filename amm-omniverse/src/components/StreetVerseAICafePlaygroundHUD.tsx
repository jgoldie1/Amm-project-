import {useEffect,useState} from 'react'
import AICafePlayground from './AICafePlayground'

/** Existing AI Cafe classroom accessible from StreetVerse's one-handed quick menu.
 * No second AI provider, job executor, payment, or game reward is created.
 */
export default function StreetVerseAICafePlaygroundHUD(){
 const [open,setOpen]=useState(false)
 useEffect(()=>{
  const onOpen=()=>setOpen(true)
  window.addEventListener('tryamm:open-ai-cafe-playground',onOpen)
  return()=>window.removeEventListener('tryamm:open-ai-cafe-playground',onOpen)
 },[])
 if(!open)return null
 return <div role="dialog" aria-modal="true" aria-label="StreetVerse AI Cafe Playground"
  style={{position:'fixed',inset:0,zIndex:43000,background:'rgba(1,8,14,.98)',overflowY:'auto',overscrollBehavior:'contain',padding:'max(12px,env(safe-area-inset-top)) 12px max(18px,env(safe-area-inset-bottom))',boxSizing:'border-box',color:'#fff'}}>
  <div style={{maxWidth:900,margin:'0 auto'}}>
   <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:9}}>
    <strong style={{fontSize:17}}>StreetVerse · AI Cafe Playground</strong>
    <button type="button" aria-label="Close StreetVerse AI Playground" onClick={()=>setOpen(false)}
     style={{minWidth:100,minHeight:48,borderRadius:12,border:'1px solid #77e4dc',background:'#102c38',color:'#fff',fontWeight:900,fontSize:14}}>✕ CLOSE</button>
   </div>
   <AICafePlayground/>
  </div>
 </div>
}
