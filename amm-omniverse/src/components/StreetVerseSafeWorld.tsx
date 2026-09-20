import {useMemo} from 'react'
import {getStreetVerseCommunitySlice,getStreetVerseMissionSlice} from '../config/streetverseCommunitySlices'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'
import StreetVerseHydeParkMobileWorld from './StreetVerseHydeParkMobileWorld'
import StreetVerseCommunityMobileWorld from './StreetVerseCommunityMobileWorld'

export default function StreetVerseSafeWorld({onClose,communityAreaNumber}:{onClose:()=>void;communityAreaNumber?:string|number}){
 const slice=useMemo(()=>communityAreaNumber!==undefined?getStreetVerseCommunitySlice(communityAreaNumber):getStreetVerseMissionSlice(),[communityAreaNumber])
 if(slice?.communityAreaNumber==='41')return <StreetVerseHydeParkMobileWorld onClose={onClose}/>
 if(slice)return <StreetVerseCommunityMobileWorld slice={slice} onClose={onClose}/>
 return <StreetVerseMobilePlayableWorld onClose={onClose}/>
}
