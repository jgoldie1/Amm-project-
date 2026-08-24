import { useEffect, useState } from 'react'

type Phase='entering'|'entered'|'leaving'|'left'|'memory-cleared'|null

export default function StreetVersePortalTransition(){
  const [phase,setPhase]=useState<Phase>(null)
  useEffect(()=>{
    let timer=0
    const onTransition=(event:Event)=>{
      const next=String((event as CustomEvent<any>).detail?.phase||'') as Phase
      setPhase(next)
      window.clearTimeout(timer)
      timer=window.setTimeout(()=>setPhase(null),900)
    }
    window.addEventListener('tryamm:streetverse-transition',onTransition)
    return()=>{window.removeEventListener('tryamm:streetverse-transition',onTransition);window.clearTimeout(timer)}
  },[])
  if(!phase||phase==='memory-cleared')return null
  const entering=phase==='entering'||phase==='entered'
  return <div aria-live="polite" style={{position:'fixed',inset:0,zIndex:15090,pointerEvents:'none',display:'grid',placeItems:'center',background:entering?'radial-gradient(circle at center,rgba(79,227,255,.16),rgba(2,4,12,.78))':'rgba(2,4,12,.7)',backdropFilter:'blur(7px)',animation:'tryammPortalFade .9s ease both'}}>
    <div style={{textAlign:'center',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',padding:20}}><div style={{fontSize:42,filter:'drop-shadow(0 0 22px #4fe3ff)'}}>◈</div><div style={{marginTop:8,fontSize:11,fontWeight:950,letterSpacing:3,color:'#4FE3FF'}}>{entering?'ENTERING STREETVERSE':'SAVING STREETVERSE'}</div><div style={{fontSize:10,color:'#9fb2c8',marginTop:7}}>{entering?'Restoring your world, checkpoint and adaptive performance profile.':'Preserving checkpoint, world memory and session state.'}</div></div>
    <style>{`@keyframes tryammPortalFade{0%{opacity:0}18%{opacity:1}78%{opacity:1}100%{opacity:0}}`}</style>
  </div>
}
