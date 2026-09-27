import {useMemo} from 'react'
import {getStreetVerseCommunitySlice,getStreetVerseMissionSlice} from '../config/streetverseCommunitySlices'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'
import StreetVerseHydeParkMobileWorld from './StreetVerseHydeParkMobileWorld'
import StreetVerseCommunityMobileWorld from './StreetVerseCommunityMobileWorld'
import CircleParkHolographicWorld from './CircleParkHolographicWorld'
import HoloArenaWorld from './HoloArenaWorld'

function routeRequest(){
 if(typeof window==='undefined')return {circlePark:false,holoArena:false}
 const query=new URLSearchParams(window.location.search)
 return {
  circlePark:query.get('place')==='circle-park'||window.location.hash.includes('circle-park'),
  holoArena:window.location.pathname.includes('/streetverse/holo-arena')||query.has('arena'),
 }
}

export default function StreetVerseSafeWorld({onClose,communityAreaNumber}:{onClose:()=>void;communityAreaNumber?:string|number}){
 const route=useMemo(routeRequest,[])
 const slice=useMemo(()=>communityAreaNumber!==undefined?getStreetVerseCommunitySlice(communityAreaNumber):getStreetVerseMissionSlice(),[communityAreaNumber])
 if(route.holoArena)return <HoloArenaWorld onClose={onClose}/>
 if(route.circlePark)return <CircleParkHolographicWorld onClose={onClose}/>
 if(slice?.communityAreaNumber==='41')return <StreetVerseHydeParkMobileWorld onClose={onClose}/>
 if(slice)return <StreetVerseCommunityMobileWorld slice={slice} onClose={onClose}/>
 return <StreetVerseMobilePlayableWorld onClose={onClose}/>
}
