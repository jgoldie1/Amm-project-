import {useEffect} from 'react'
import StreetVerseRPActionSearch from './StreetVerseRPActionSearch'
export default function KingdomDistrictRoute(){
 useEffect(()=>{document.documentElement.dataset.tryammKingdomRoute='canonical-iframe';return()=>{delete document.documentElement.dataset.tryammKingdomRoute}},[])
 return <main style={{position:'fixed',inset:0,zIndex:24000,background:'#15122c'}}>
  <div style={{position:'fixed',left:10,right:10,bottom:'calc(env(safe-area-inset-bottom, 0px) + 10px)',zIndex:24002,maxWidth:620,margin:'0 auto'}}><StreetVerseRPActionSearch compact/></div>
  <iframe
   title="Kingdom District"
   src="/streetverse-kingdom/index.html"
   data-tryamm-kingdom-canonical="true"
   allow="fullscreen; gamepad"
   style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0,background:'#15122c'}}
  />
 </main>
}