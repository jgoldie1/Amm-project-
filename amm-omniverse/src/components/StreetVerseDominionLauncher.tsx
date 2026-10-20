import {lazy,Suspense,useState} from 'react'
const StreetVerseDistrictDominionPanel=lazy(()=>import('./StreetVerseDistrictDominionPanel'))

/** Present in both the independent safe HTML entry and the real 3D route.
 * Button does not load any game bundle, assets or backend data until requested. */
export default function StreetVerseDominionLauncher(){
 const [open,setOpen]=useState(false)
 return <>
  <button data-streetverse-dominion-launch="true"
    aria-label="Open District Dominion turf and city builder"
    onClick={()=>setOpen(true)}
    style={{position:'fixed',right:12,bottom:168,zIndex:32000,minHeight:52,padding:'9px 13px',
     background:'#0d2b35f2',color:'#a3ffe0',border:'2px solid #7befca',
     borderRadius:14,boxShadow:'0 5px 18px #0009',fontSize:12,fontWeight:950}}>
   ⚔ TURF + CITY
  </button>
  {open&&<Suspense fallback={<div role="status" style={{position:'fixed',inset:0,zIndex:45000,display:'grid',placeItems:'center',background:'#061221',color:'#fff'}}>
   OPENING DISTRICT DOMINION…
  </div>}><StreetVerseDistrictDominionPanel onClose={()=>setOpen(false)}/></Suspense>}
 </>
}
