import {useMemo} from 'react'
import {getStreetVerseCommunitySlice,getStreetVerseMissionSlice} from '../config/streetverseCommunitySlices'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'
import StreetVerseHydeParkMobileWorld from './StreetVerseHydeParkMobileWorld'
import StreetVerseCommunityMobileWorld from './StreetVerseCommunityMobileWorld'
import CircleParkHolographicWorld from './CircleParkHolographicWorld'

function circleParkRequested(){
 if(typeof window==='undefined')return false
 const query=new URLSearchParams(window.location.search)
 return query.get('place')==='circle-park'||window.location.hash.includes('circle-park')
}

export default function StreetVerseSafeWorld({onClose,communityAreaNumber}:{onClose:()=>void;communityAreaNumber?:string|number}){
 const circlePark=useMemo(circleParkRequested,[])
 const slice=useMemo(()=>communityAreaNumber!==undefined?getStreetVerseCommunitySlice(communityAreaNumber):getStreetVerseMissionSlice(),[communityAreaNumber])
 if(circlePark)return <CircleParkHolographicWorld onClose={onClose}/>
 if(slice?.communityAreaNumber==='41')return <StreetVerseHydeParkMobileWorld onClose={onClose}/>
 if(slice)return <StreetVerseCommunityMobileWorld slice={slice} onClose={onClose}/>
 return <StreetVerseMobilePlayableWorld onClose={onClose}/>
}
