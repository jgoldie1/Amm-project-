import {useEffect,useState} from 'react'
import {UIC_PACKAGE_ID,type UICPackageStage} from '../runtime/StreetVerseUICPackageRuntime'
type Nearby={stage:UICPackageStage;canPickup:boolean;canDeliver:boolean}
export default function StreetVerseUICPackageHUD(){
 const [nearby,setNearby]=useState<Nearby>({stage:'awaiting-pickup',canPickup:false,canDeliver:false})
 const [message,setMessage]=useState('Find the package at Circle Park, then deliver it to UIC.')
 useEffect(()=>{
  const onState=(event:Event)=>setNearby((event as CustomEvent<Nearby>).detail)
  const onResult=(event:Event)=>{const detail=(event as CustomEvent<{ok:boolean;action:string;reason?:string}>).detail;setMessage(detail.ok?detail.action==='pickup'?'Package collected. Drive to the UIC drop-off.':'UIC package delivered.':detail.reason||'Move closer and exit your car.')}
  window.addEventListener('tryamm:streetverse-uic-package-state',onState)
  window.addEventListener('tryamm:streetverse-uic-package-result',onResult)
  return()=>{window.removeEventListener('tryamm:streetverse-uic-package-state',onState);window.removeEventListener('tryamm:streetverse-uic-package-result',onResult)}
 },[])
 const button={minHeight:48,borderRadius:10,background:'#134e62',color:'#e9ffff',border:'1px solid #76efff',padding:'8px 12px',fontWeight:800}
 return <section data-streetverse-uic-package="true" style={{position:'fixed',left:8,bottom:'calc(env(safe-area-inset-bottom) + 154px)',zIndex:44001,maxWidth:225,background:'rgba(4,22,35,.91)',border:'1px solid #6be7f6',borderRadius:12,padding:9,color:'white',font:'12px system-ui'}}>
  <strong>📦 UIC DELIVERY</strong><div aria-live="polite">{nearby.stage==='delivered'?'DELIVERED':nearby.stage==='carrying'?'PACKAGE ON BOARD':'PACKAGE AWAITING PICKUP'}</div>
  {nearby.canPickup&&<button style={button} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-uic-package-interact',{detail:{action:'pickup',packageId:UIC_PACKAGE_ID}}))}>PICK UP PACKAGE</button>}
  {nearby.canDeliver&&<button style={button} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-uic-package-interact',{detail:{action:'deliver',packageId:UIC_PACKAGE_ID}}))}>DELIVER PACKAGE</button>}
  <div>{message}</div>
 </section>
}
