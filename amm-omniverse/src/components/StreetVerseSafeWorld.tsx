import {useMemo} from 'react'
import {getStreetVerseMissionSlice} from '../config/streetverseCommunitySlices'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'
import StreetVerseHydeParkMobileWorld from './StreetVerseHydeParkMobileWorld'
import StreetVerseCommunityMobileWorld from './StreetVerseCommunityMobileWorld'

export default function StreetVerseSafeWorld({onClose}:{onClose:()=>void}){
 const slice=useMemo(()=>getStreetVerseMissionSlice(),[])
 if(slice?.communityAreaNumber==='41')return <StreetVerseHydeParkMobileWorld onClose={onClose}/>
 if(slice)return <StreetVerseCommunityMobileWorld slice={slice} onClose={onClose}/>
 return <StreetVerseMobilePlayableWorld onClose={onClose}/>
}
