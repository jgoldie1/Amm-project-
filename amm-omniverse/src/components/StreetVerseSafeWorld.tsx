import {useMemo} from 'react'
import {getStreetVerseCommunitySlice,getStreetVerseMissionSlice} from '../config/streetverseCommunitySlices'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'
import StreetVerseHydeParkMobileWorld from './StreetVerseHydeParkMobileWorld'
import StreetVerseCommunityMobileWorld from './StreetVerseCommunityMobileWorld'
import CircleParkHolographicWorld from './CircleParkHolographicWorld'
import HoloArenaWorld from './HoloArenaWorld'
import StreetVerseGlobalWorld from './StreetVerseGlobalWorld'

function routeRequest(){
 if(typeof window==='undefined')return {circlePark:false,holoArena:false,global:false}
 const query=new URLSearchParams(window.location.search)
 return {
  circlePark:query.get('place')==='circle-park'||window.location.hash.includes('circle-park'),
  holoArena:window.location.pathname.includes('/streetverse/holo-arena')||query.has('arena'),
  global:query.get('global')==='1'||window.location.pathname.includes('/streetverse/global'),
 }
}

export default function StreetVerseSafeWorld({onClose,communityAreaNumber}:{onClose:()=>void;communityAreaNumber?:string|number}){
 const route=useMemo(routeRequest,[])
 const slice=useMemo(()=>communityAreaNumber!==undefined?getStreetVerseCommunitySlice(communityAreaNumber):getStreetVerseMissionSlice(),[communityAreaNumber])
 const restore3D=<button type="button" data-streetverse-restore-3d="true" aria-label="Open full 3D StreetVerse Chicago" onClick={()=>{
  const url=new URL(window.location.href)
  url.searchParams.delete('safe')
  if(url.searchParams.get('mode')==='safe')url.searchParams.delete('mode')
  url.searchParams.set('graphics','3d')
  window.location.assign(url.toString())
 }} style={{position:'fixed',right:12,bottom:'calc(env(safe-area-inset-bottom, 0px) + 88px)',zIndex:45000,minHeight:50,padding:'10px 16px',borderRadius:14,border:'2px solid #8fffe2',background:'#074837',color:'#fff',font:'900 14px/1.2 system-ui',boxShadow:'0 6px 22px #000b'}}>OPEN 3D CHICAGO</button>
 if(route.holoArena)return <HoloArenaWorld onClose={onClose}/>
 if(route.global)return <StreetVerseGlobalWorld onClose={onClose} onEnterChicago={()=>{const url=new URL(window.location.href);url.searchParams.delete('global');url.searchParams.set('city','chicago');window.location.assign(url.toString())}}/>
 if(route.circlePark)return <CircleParkHolographicWorld onClose={onClose}/>
 if(slice?.communityAreaNumber==='41')return <><StreetVerseHydeParkMobileWorld onClose={onClose}/>{restore3D}</>
 if(slice)return <><StreetVerseCommunityMobileWorld slice={slice} onClose={onClose}/>{restore3D}</>
 return <><StreetVerseMobilePlayableWorld onClose={onClose}/>{restore3D}</>
}
