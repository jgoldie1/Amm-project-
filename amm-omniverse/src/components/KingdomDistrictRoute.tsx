import {useEffect,useRef} from 'react'
import StreetVerseRPActionSearch from './StreetVerseRPActionSearch'
export default function KingdomDistrictRoute(){
 const frameRef=useRef<HTMLIFrameElement|null>(null)
 useEffect(()=>{document.documentElement.dataset.tryammKingdomRoute='canonical-iframe';return()=>{delete document.documentElement.dataset.tryammKingdomRoute}},[])
 useEffect(()=>{
  const forward=(event:Event)=>{
   const detail=(event as CustomEvent<Record<string,unknown>>).detail||{}
   frameRef.current?.contentWindow?.postMessage({channel:'tryamm:kingdom-control',type:'RP_ACTION',...detail},window.location.origin)
  }
  window.addEventListener('tryamm:streetverse-rp-action-play',forward)
  window.addEventListener('tryamm:streetverse-rp-sync-request',forward)
  return()=>{window.removeEventListener('tryamm:streetverse-rp-action-play',forward);window.removeEventListener('tryamm:streetverse-rp-sync-request',forward)}
 },[])
 return <main style={{position:'fixed',inset:0,zIndex:24000,background:'#15122c'}}>
  <div style={{position:'fixed',left:10,right:10,bottom:'calc(env(safe-area-inset-bottom, 0px) + 10px)',zIndex:24002,maxWidth:620,margin:'0 auto'}}><StreetVerseRPActionSearch compact/></div>
  <iframe
   ref={frameRef}
   title="Kingdom District"
   src="/streetverse-kingdom/index.html"
   data-tryamm-kingdom-canonical="true"
   allow="fullscreen; gamepad"
   style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0,background:'#15122c'}}
  />
 </main>
}