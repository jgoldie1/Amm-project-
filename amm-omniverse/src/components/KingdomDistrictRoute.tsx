import {useEffect,useRef} from 'react'
import {installStreetVerseAbracadabraGeniiRuntime} from '../runtime/StreetVerseAbracadabraGeniiRuntime'
import {installStreetVerseSoundBankRuntime} from '../runtime/StreetVerseSoundBankRuntime'
import {installMindOverMatterCleanRoomRuntime} from '../runtime/MindOverMatterCleanRoomRuntime'
import {installHoloForgeRuntime} from '../runtime/HoloForgeAssetRuntime'
import StreetVerseRPActionSearch from './StreetVerseRPActionSearch'
import StreetVerseRPOmnibar from './StreetVerseRPOmnibar'
export default function KingdomDistrictRoute(){
 const frameRef=useRef<HTMLIFrameElement|null>(null)
 useEffect(()=>installStreetVerseAbracadabraGeniiRuntime(),[])
 useEffect(()=>installStreetVerseSoundBankRuntime(),[])
 useEffect(()=>{installMindOverMatterCleanRoomRuntime();installHoloForgeRuntime()},[])
 useEffect(()=>{document.documentElement.dataset.tryammKingdomRoute='canonical-iframe';return()=>{delete document.documentElement.dataset.tryammKingdomRoute}},[])
 useEffect(()=>{
  const allowed=new Set(['/kingdom-of-yahisrael','/kingdom-workbook','/metaverse-bible','/faithverse','/ethiopian-bible','/kingdoms-press','/servants-of-christ','/network'])
  const open=(event:Event)=>{const route=String((event as CustomEvent<{destination?:string}>).detail?.destination||'');if(allowed.has(route))window.location.href=route}
  window.addEventListener('tryamm:kingdom-portal-request',open as EventListener)
  return()=>window.removeEventListener('tryamm:kingdom-portal-request',open as EventListener)
 },[])
 useEffect(()=>{
  const bible=(event:Event)=>{const pkg=(event as CustomEvent<any>).detail;if(pkg?.planId)frameRef.current?.contentWindow?.postMessage({channel:'tryamm:kingdom-control',type:'BIBLE_WORLD_PREVIEW',package:pkg},window.location.origin)}
  window.addEventListener('tryamm:bible-world-hebrew-school-preview-ready',bible as EventListener)
  return()=>window.removeEventListener('tryamm:bible-world-hebrew-school-preview-ready',bible as EventListener)
 },[])
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
  <a href='/kingdom-of-yahisrael' aria-label='Return to Kingdom of Yahisrael' style={{position:'fixed',left:10,top:'calc(env(safe-area-inset-top, 0px) + 10px)',zIndex:24003,minHeight:40,display:'inline-flex',alignItems:'center',padding:'0 11px',borderRadius:999,border:'1px solid #e8b944aa',background:'#0a0c12dd',color:'#fff4bd',fontSize:9,fontWeight:950,textDecoration:'none',backdropFilter:'blur(10px)'}}>👑 YAHISRAEL • WHERE HEAVEN MEETS EARTH</a>
  <div style={{position:'fixed',left:10,right:10,bottom:'calc(env(safe-area-inset-bottom, 0px) + 10px)',zIndex:24002,maxWidth:620,margin:'0 auto'}}><StreetVerseRPActionSearch compact/><StreetVerseRPOmnibar compact/></div>
  <iframe
   ref={frameRef}
   onLoad={sendBiblePreview}
   title="Kingdom District"
   src="/streetverse-kingdom/index.html"
   data-tryamm-kingdom-canonical="true"
   allow="fullscreen; gamepad"
   style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0,background:'#15122c'}}
  />
 </main>
}