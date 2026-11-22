import {useEffect,useState} from 'react'
type Mode='jump'|'hop'|'vault'
const btn={minHeight:55,minWidth:88,borderRadius:13,padding:'10px 14px',fontWeight:900,fontSize:15,color:'#fff',background:'#19465b',border:'1px solid #a9e3ef',touchAction:'manipulation' as const}
export default function StreetVerseParkourHUD(){
 const [expanded,setExpanded]=useState(false),[message,setMessage]=useState('Use JUMP / HOP while on foot. Vaulting only works when a safe obstacle is validated.')
 useEffect(()=>{const listener=(e:Event)=>setMessage(String((e as CustomEvent<{message?:string}>).detail?.message||'Movement updated'));window.addEventListener('tryamm:streetverse-parkour-feedback',listener);return()=>window.removeEventListener('tryamm:streetverse-parkour-feedback',listener)},[])
 const run=(action:Mode)=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-parkour-action',{detail:{action,source:'large-mobile-button'}}))
 return <aside aria-label="StreetVerse jump and parkour controls" style={{position:'fixed',left:8,top:'max(105px,env(safe-area-inset-top))',zIndex:40020,maxWidth:'calc(100vw - 16px)',font:'14px system-ui'}}>
  <button style={btn} aria-expanded={expanded} onClick={()=>setExpanded(v=>!v)}>↟ PARKOUR / JUMP</button>
  {expanded&&<div style={{background:'#061a2aee',color:'#fff',borderRadius:13,padding:12,marginTop:7,maxWidth:320,display:'grid',gap:8,border:'1px solid #6caabb'}}>
   <strong>Move BJ · One-hand parkour</strong>
   <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:7}}>
    <button style={btn} onClick={()=>run('jump')}>↟ JUMP</button>
    <button style={btn} onClick={()=>run('hop')}>↗ HOP</button>
    <button style={btn} onClick={()=>run('vault')}>⇧ VAULT</button>
    <button style={btn} onClick={()=>setExpanded(false)}>CLOSE</button>
   </div>
   <p role="status" aria-live="polite" style={{margin:0,fontSize:13,lineHeight:1.5}}>{message}</p>
   <small>Spacebar jumps with a keyboard. No wall-clipping: advanced vaulting and climbing are still gated by collision testing.</small>
  </div>}
 </aside>
}
