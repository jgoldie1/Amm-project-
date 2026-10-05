import {useEffect} from 'react'
export default function KingdomDistrictRoute(){
 useEffect(()=>{document.documentElement.dataset.tryammKingdomRoute='canonical-iframe';return()=>{delete document.documentElement.dataset.tryammKingdomRoute}},[])
 return <main style={{position:'fixed',inset:0,zIndex:24000,background:'#15122c'}}>
  <iframe
   title="Kingdom District"
   src="/streetverse-kingdom/index.html"
   data-tryamm-kingdom-canonical="true"
   allow="fullscreen; gamepad"
   style={{position:'absolute',inset:0,width:'100%',height:'100%',border:0,background:'#15122c'}}
  />
 </main>
}