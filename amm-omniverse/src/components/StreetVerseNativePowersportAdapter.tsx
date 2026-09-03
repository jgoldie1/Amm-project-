import {useEffect,useRef} from 'react'

type Ride={id?:string;label?:string;wheels?:number;className?:string;grip?:number;steer?:number;roll?:number;stunts?:string[]}
type Pos={x?:number;z?:number}

function sizeFor(ride:Ride){const wheels=Number(ride.wheels||4),id=String(ride.id||'ride');if(wheels===2)return{length:2.55,width:.82,height:1.25,rideHeight:.72};if(wheels===3)return{length:3.75,width:2.15,height:1.25,rideHeight:.62};if(id==='utv'||id==='dune-buggy')return{length:3.7,width:2.05,height:1.65,rideHeight:.72};if(id==='go-kart')return{length:2.5,width:1.45,height:.8,rideHeight:.4};return{length:2.9,width:1.55,height:1.18,rideHeight:.62}}

export default function StreetVerseNativePowersportAdapter(){
 const player=useRef<Pos>({x:0,z:54}),seq=useRef(0)
 useEffect(()=>{
  const onPlayer=(e:Event)=>{const d=(e as CustomEvent<Pos>).detail||{};player.current={x:Number(d.x||0),z:Number(d.z||0)}}
  const onSpawn=(e:Event)=>{const ride=(e as CustomEvent<Ride>).detail||{};seq.current+=1;const size=sizeFor(ride);const x=Number(player.current.x||0)+4+(seq.current%2)*2,z=Number(player.current.z||0)+2;window.dispatchEvent(new CustomEvent('tryamm:streetverse-native-powersport-request',{detail:{...ride,id:ride.id||`powersport-${seq.current}`,instanceId:`${ride.id||'powersport'}-${Date.now()}-${seq.current}`,x,z,heading:0,enterable:true,drivable:true,nativeWorld:true,size,handling:{grip:Number(ride.grip||.85),steer:Number(ride.steer||1),roll:Number(ride.roll||.3)},stunts:Array.isArray(ride.stunts)?ride.stunts:[]}}));window.dispatchEvent(new CustomEvent('tryamm:streetverse-powersport-native-status',{detail:{state:'REQUESTED',ride:ride.label||ride.id||'POWERSPORT',x,z}}))}
  addEventListener('tryamm:streetverse-player-position',onPlayer);addEventListener('tryamm:streetverse-powersport-spawn',onSpawn)
  return()=>{removeEventListener('tryamm:streetverse-player-position',onPlayer);removeEventListener('tryamm:streetverse-powersport-spawn',onSpawn)}
 },[])
 return null
}
