import {useMemo,useState} from 'react'
/** Fictional Tampa mansion duplex, 12 bedrooms total (6 per wing), no real-estate representation. */
export const LATEASIA_MANSION_ROOMS=[
 ...Array.from({length:6},(_,i)=>({id:'east-'+(i+1),wing:'East',name:'East Bedroom '+(i+1)})),
 ...Array.from({length:6},(_,i)=>({id:'west-'+(i+1),wing:'West',name:'West Bedroom '+(i+1)}))
]
export const LATEASIA_MANSION_POSITION:[number,number,number]=[-723,0,844]
export function StreetVerseTampaLaTeasiaMansion(){
 const [doorsOpen,setDoorsOpen]=useState(false)
 const [lightsOn,setLightsOn]=useState(true)
 const rooms=useMemo(()=>LATEASIA_MANSION_ROOMS,[])
 return <group name="lateasia-12-bedroom-mansion-duplex" position={LATEASIA_MANSION_POSITION}>
  {/* Two wings, six bedrooms each, arranged around a grand shared atrium. */}
  {[-1,1].map((side)=><group key={side} position={[side*15,0,0]}>
   <mesh receiveShadow castShadow position={[0,3,0]}><boxGeometry args={[24,6,22]}/><meshStandardMaterial color={side<0?'#eee0d4':'#e7d8cf'}/></mesh>
   <mesh receiveShadow castShadow position={[0,7.1,0]}><boxGeometry args={[24,2.2,22]}/><meshStandardMaterial color="#e9ded5"/></mesh>
   <mesh castShadow position={[0,8.5,0]}><boxGeometry args={[26,.7,24]}/><meshStandardMaterial color="#3e404b" metalness={.25}/></mesh>
   {[-1,0,1].map((column)=><group key={column}>
    {[-1,1].map((floor)=><group key={floor} position={[column*7,floor<0?2.2:6.6,11.1]}>
     <mesh><boxGeometry args={[4.5,3.3,.16]}/><meshStandardMaterial color={lightsOn?'#9bd5e4':'#35434c'} transparent opacity={.8}/></mesh>
     <mesh position={[0,0,.14]}><boxGeometry args={[4.8,.15,.2]}/><meshStandardMaterial color="#e5c66d" metalness={.65}/></mesh>
    </group>)}
   </group>)}
   {/* six individually recognizable bedroom suites, three on each floor */}
   {rooms.filter(r=>r.wing===(side<0?'West':'East')).map((room,i)=><group key={room.id} name={room.id} position={[(i%3-1)*7.3,i<3?1.2:5.5,-3]}>
    <mesh position={[0,.4,0]}><boxGeometry args={[4,.5,5]}/><meshStandardMaterial color="#b69c84"/></mesh>
    <mesh position={[0,.9,-.9]}><boxGeometry args={[2.7,.45,2.5]}/><meshStandardMaterial color="#f5dbe5"/></mesh>
    <mesh position={[0,1.5,-2.2]}><boxGeometry args={[3,1.5,.4]}/><meshStandardMaterial color="#af8da0"/></mesh>
   </group>)}
  </group>)}
  {/* Shared double-height entry and gold-trimmed porte cochère */}
  <mesh castShadow position={[0,4,0]}><boxGeometry args={[8,8,16]}/><meshStandardMaterial color="#f2e8df"/></mesh>
  <mesh castShadow position={[0,8.7,0]}><boxGeometry args={[10,1.1,18]}/><meshStandardMaterial color="#bca45e" metalness={.55}/></mesh>
  <mesh position={[0,2,8.2]}><boxGeometry args={[doorsOpen?5:.12,4,.25]}/><meshStandardMaterial color="#6b4233"/></mesh>
  <mesh position={[0,5.2,8.2]}><boxGeometry args={[5,1,.2]}/><meshStandardMaterial color="#e4c570" metalness={.7}/></mesh>
  {/* Landscaped circular drive, fountain, pool, rear patio and garden */}
  <mesh receiveShadow position={[0,-.08,24]}><cylinderGeometry args={[11,11,.12,48]}/><meshStandardMaterial color="#c4c3bd"/></mesh>
  <mesh position={[0,.35,24]}><cylinderGeometry args={[3,3,.6,32]}/><meshStandardMaterial color="#8aa7b6" metalness={.25}/></mesh>
  <mesh position={[0,.75,24]}><cylinderGeometry args={[1,1,.5,24]}/><meshStandardMaterial color="#dfd4c0"/></mesh>
  <mesh position={[0,-.02,-19]}><boxGeometry args={[19,.1,9]}/><meshStandardMaterial color="#60a9c7" metalness={.2} roughness={.15}/></mesh>
  <mesh position={[0,.05,-25]}><boxGeometry args={[26,.12,4]}/><meshStandardMaterial color="#d2c6b8"/></mesh>
  {[-1,1].map(side=><group key={side}>
   <mesh position={[side*29,2,5]}><boxGeometry args={[.5,4,33]}/><meshStandardMaterial color="#e8dcc7"/></mesh>
   {Array.from({length:5},(_,i)=><mesh key={i} position={[side*33,.9,i*9-18]}><sphereGeometry args={[2,10,8]}/><meshStandardMaterial color="#487e4b"/></mesh>)}
  </group>)}
 </group>
}
export function StreetVerseTampaMansionControls(){
 const [open,setOpen]=useState(false)
 const [lights,setLights]=useState(true)
 const [doors,setDoors]=useState(false)
 const control={minHeight:48,width:'100%',padding:8,borderRadius:8,fontWeight:700} as const
 return <section aria-label="LaTeasia mansion controls" style={{position:'absolute',left:12,top:80,zIndex:37,width:'min(265px,60vw)',padding:10,borderRadius:12,color:'white',background:'rgba(28,24,42,.95)',border:'1px solid #d9c08c'}}>
  <button type="button" style={control} onClick={()=>setOpen(v=>!v)}>{open?'CLOSE':'OPEN'} LATEASIA MANSION</button>
  {open&&<div style={{fontSize:12}}>
   <p>12-bedroom duplex mansion · 6 suites per wing · pool · fountain · landscaped drive · gold trim.</p>
   <button type="button" style={control} onClick={()=>{setDoors(v=>!v);window.dispatchEvent(new CustomEvent('tryamm:tampa-mansion-controls',{detail:{doorsOpen:!doors,lightsOn:lights}}))}}>{doors?'CLOSE':'OPEN'} FRONT DOOR</button>
   <button type="button" style={control} onClick={()=>{setLights(v=>!v);window.dispatchEvent(new CustomEvent('tryamm:tampa-mansion-controls',{detail:{doorsOpen:doors,lightsOn:!lights}}))}}>{lights?'TURN OFF':'TURN ON'} LIGHTS</button>
   <p>Visual prototype only. Rooms, ownership, and furnishings are not yet fully interactive.</p>
  </div>}
 </section>
}
