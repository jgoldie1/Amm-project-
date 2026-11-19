import {useEffect,useState} from 'react'

export default function StreetVerseFlyingCarHUD(){
 const [active,setActive]=useState(false)
 const [mode,setMode]=useState<'ground'|'flight'>('ground')
 useEffect(()=>{
  const onVehicle=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.entered===false){setActive(false);setMode('ground');return}setActive(d.flightCapable===true);if(d.flightCapable!==true)setMode('ground')}
  const onState=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};if(d.requestedMode==='flight'||d.requestedMode==='ground')setMode(d.requestedMode)}
  const onLanded=()=>setMode('ground')
  addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
  addEventListener('tryamm:streetverse-flying-car-state',onState)
  addEventListener('tryamm:streetverse-flying-car-landed',onLanded)
  return()=>{removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle);removeEventListener('tryamm:streetverse-flying-car-state',onState);removeEventListener('tryamm:streetverse-flying-car-landed',onLanded)}
 },[])
 if(!active)return null
 const next=mode==='ground'?'flight':'ground'
 return <button type="button" aria-label={mode==='ground'?'Deploy flying car and take off':'Land flying car'} onClick={()=>dispatchEvent(new CustomEvent('tryamm:streetverse-flying-car-mode',{detail:{mode:next,source:'flying-car-hud'}}))} style={{position:'fixed',right:'max(12px,env(safe-area-inset-right))',bottom:'calc(env(safe-area-inset-bottom) + 148px)',zIndex:57500,minHeight:64,minWidth:148,padding:'12px 18px',borderRadius:18,border:'3px solid #8ff5ff',background:mode==='ground'?'#0b5567ee':'#5b2d8bee',color:'#fff',fontWeight:1000,fontSize:18,touchAction:'manipulation',boxShadow:'0 10px 28px #0009'}}>{mode==='ground'?'✈ FLY':'↓ LAND'}</button>
}
