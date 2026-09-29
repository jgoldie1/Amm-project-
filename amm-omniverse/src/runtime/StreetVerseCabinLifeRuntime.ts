export type StreetVerseSeatProfile={
 vehicleId:string
 seatId:string
 seatHeight:number
 headClearance:number
 hipOffsetY:number
 cameraOffsetY:number
 recline:number
}

export type StreetVerseCabinPreference={
 shoes:'on'|'off'
 outerwear:'on'|'off'
 musicMode:'off'|'holo-music'|'owned'|'licensed-radio'
 entertainment:'music'|'reels'|'live'|'passenger'|'off'
}

const DEFAULT_SEAT:StreetVerseSeatProfile={vehicleId:'',seatId:'driver',seatHeight:.72,headClearance:.16,hipOffsetY:0,cameraOffsetY:.08,recline:6}
let installed=false
let prefs:StreetVerseCabinPreference={shoes:'on',outerwear:'on',musicMode:'holo-music',entertainment:'music'}

function clamp(n:number,min:number,max:number){return Math.max(min,Math.min(max,n))}
function fitSeat(detail:any){
 const avatarHeight=clamp(Number(detail.avatarHeight||1.78),1.2,2.25)
 const cabinHeight=clamp(Number(detail.cabinHeight||1.32),.9,2.1)
 const seatHeight=clamp(Number(detail.seatHeight||DEFAULT_SEAT.seatHeight),.35,1.1)
 const requiredClearance=.12
 const seatedHead=seatHeight+avatarHeight*.55
 const overflow=Math.max(0,seatedHead-(cabinHeight-requiredClearance))
 const hipOffsetY=-clamp(overflow,0,.42)
 const cameraOffsetY=clamp(.08-overflow*.35,-.08,.12)
 const recline=clamp(6+overflow*32,4,18)
 return {vehicleId:String(detail.vehicleId||''),seatId:String(detail.seatId||'driver'),seatHeight,headClearance:requiredClearance,hipOffsetY,cameraOffsetY,recline,avatarHeight,cabinHeight,fitVerified:seatedHead+hipOffsetY<=cabinHeight-requiredClearance+.01}
}

export function installStreetVerseCabinLifeRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 addEventListener('tryamm:streetverse-vehicle-seat-request',(event:Event)=>{
  const fit=fitSeat((event as CustomEvent<any>).detail||{})
  dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-seat-fit',{detail:fit}))
  dispatchEvent(new CustomEvent('tryamm:streetverse-camera-seat-fit',{detail:{vehicleId:fit.vehicleId,cameraOffsetY:fit.cameraOffsetY,recline:fit.recline}}))
 })
 addEventListener('tryamm:streetverse-cabin-preference',(event:Event)=>{
  const d=(event as CustomEvent<Partial<StreetVerseCabinPreference>>).detail||{}
  prefs={...prefs,...d}
  dispatchEvent(new CustomEvent('tryamm:streetverse-avatar-wardrobe-state',{detail:{shoes:prefs.shoes,outerwear:prefs.outerwear,scope:'vehicle-cabin',restoreOnExit:true}}))
  dispatchEvent(new CustomEvent('tryamm:streetverse-cabin-state',{detail:{...prefs}}))
 })
 addEventListener('tryamm:streetverse-cabin-music-request',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  dispatchEvent(new CustomEvent('tryamm:holo-music-play-request',{detail:{source:'streetverse-cabin',trackId:d.trackId,playlistId:d.playlistId,mode:prefs.musicMode,rightsRequired:true}}))
 })
 addEventListener('tryamm:streetverse-vehicle-controlled',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(d.entered){
   dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-seat-request',{detail:{vehicleId:d.vehicleId,seatId:d.seatId||'driver',avatarHeight:d.avatarHeight,cabinHeight:d.cabinHeight,seatHeight:d.seatHeight}}))
   dispatchEvent(new CustomEvent('tryamm:streetverse-cabin-state',{detail:{...prefs,vehicleId:d.vehicleId,active:true}}))
  }else{
   dispatchEvent(new CustomEvent('tryamm:streetverse-avatar-wardrobe-state',{detail:{shoes:'on',outerwear:'on',scope:'vehicle-cabin',restore:true}}))
   dispatchEvent(new CustomEvent('tryamm:streetverse-cabin-state',{detail:{active:false}}))
  }
 })
}
