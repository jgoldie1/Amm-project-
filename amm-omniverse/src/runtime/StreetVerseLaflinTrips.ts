export type TripPhase='gate'|'platform'|'riding'|'arrival'|'ramp'|'highway'|'exit'|'drop'|'save'
export const tripStops={
 platform:{x:-72,z:-42},arrival:{x:72,z:-42},
 ramp:{x:-48,z:-65},highway:{x:-42,z:-73},exit:{x:42,z:-73},drop:{x:48,z:-65},
}
export function trainAt(now:number){
 const t=(now/1000)%48
 const fraction=t<4?0:t<24?(t-4)/20:t<28?1:(48-t)/20
 return {x:-72*Math.cos(Math.PI*fraction),west:t<4,east:t>=24&&t<28}
}
export function advanceDelivery(phase:TripPhase,x:number,z:number,groundVehicle:boolean):TripPhase{
 if(!groundVehicle)return phase
 const order=['ramp','highway','exit','drop'] as const
 const i=order.findIndex(s=>s===phase)
 if(i<0)return phase
 const target=tripStops[order[i]]
 return Math.hypot(target.x-x,target.z-z)<=4?(order[i+1]??'save'):phase
}
export function onTripRoad(x:number,z:number){
 if(Math.abs(x)<=82&&Math.abs(z+73)<=2.5)return true
 return [-1,1].some(side=>{
  const t=Math.max(0,Math.min(1,((x-side*48)*(-6*side)+(z+65)*(-8))/100))
  return Math.hypot(x-(side*48-6*side*t),z-(-65-8*t))<=3
 })
}
type Options={
 position:()=>{x:number;z:number};vehicle:()=>boolean;groundVehicle:()=>boolean
 move:(x:number,z:number)=>void;save:()=>boolean
 rideCamera:(x:number)=>void
}
export function installLaflinTrips(host:HTMLElement,options:Options){
 const panel=document.createElement('details'),toggle=document.createElement('summary'),status=document.createElement('p')
 panel.style.cssText='position:absolute;top:30%;left:4px;z-index:44000;max-width:min(86vw,290px);padding:5px;background:#122636;color:white;border-radius:8px;font:600 15px system-ui'
 toggle.textContent='Laflin trips';toggle.style.cssText='min-height:44px;align-content:center;cursor:pointer'
 status.setAttribute('role','status');panel.append(toggle,status);host.append(panel)
 let phase:TripPhase='gate',now=0,arrivalTime=0,complete='',saved=false
 function button(label:string,fn:()=>void){
  const b=document.createElement('button');b.type='button';b.textContent=label;b.style.cssText='min-height:48px;margin:2px;padding:6px 10px';b.onclick=fn;panel.append(b);return b
 }
 const map=document.createElement('canvas')
 map.width=290;map.height=138;map.hidden=true;map.setAttribute('role','img');map.setAttribute('aria-label','Trip map, north up. Train platforms in gold, expressway and loading bay in teal, your position in white.')
 map.style.cssText='max-width:100%;background:#10202c'
 const mapToggle=button('Holo Map',()=>{map.hidden=!map.hidden;mapToggle.setAttribute('aria-expanded',String(!map.hidden));refresh()})
 mapToggle.setAttribute('aria-expanded','false');panel.append(map)
 function drawMap(x:number,z:number){
  if(map.hidden||!panel.open)return
  const ctx=map.getContext('2d');if(!ctx)return
  const px=(v:number)=>145+v*1.55,pz=(v:number)=>88+v
  ctx.clearRect(0,0,290,138)
  const line=(points:{x:number;z:number}[],color:string)=>{
   ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath()
   points.forEach((p,i)=>i?ctx.lineTo(px(p.x),pz(p.z)):ctx.moveTo(px(p.x),pz(p.z)));ctx.stroke()
  }
  line([tripStops.platform,tripStops.arrival],'#ffcb62')
  line([tripStops.ramp,tripStops.highway,tripStops.exit,tripStops.drop],'#47d8c3')
  ctx.font='12px system-ui';ctx.fillStyle='white'
  ctx.fillText('West platform',8,63);ctx.fillText('East Market',210,63);ctx.fillText('Expressway',105,30);ctx.fillText('Laflin gate',60,132)
  ctx.beginPath();ctx.arc(px(x),pz(z),4,0,2*Math.PI);ctx.fill()
 }
 const nearGate=()=>{const p=options.position();return !options.vehicle()&&Math.hypot(p.x+38,p.z-31)<10}
 function announce(text:string){
  window.dispatchEvent(new CustomEvent('tryamm:accessibility-announce',{detail:{text}}))
  if('speechSynthesis' in window && typeof SpeechSynthesisUtterance!=='undefined')window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
 }
 const rail=button('Ride the L',()=>{if(!nearGate())return;options.move(tripStops.platform.x,tripStops.platform.z);phase='platform';complete='';saved=false;refresh()})
 const drive=button('Drive a delivery',()=>{if(!nearGate())return;phase='ramp';complete='';saved=false;refresh()})
 const act=button('Board train',()=>{
  if(phase==='platform'&&trainAt(now).west&&!options.vehicle()&&Math.hypot(options.position().x+72,options.position().z+42)<6){
   arrivalTime=now-(now%48000)+24000;phase='riding'
  }else if(phase==='arrival'){options.move(tripStops.arrival.x,tripStops.arrival.z);phase='save'}
  else if(phase==='save'){
   if(!options.save()){complete='Storage unavailable. Tap Save to retry.';refresh();return}
   saved=true;complete='Trip complete. Arrival saved on this device.';announce(complete);phase='gate'
  }
  refresh()
 })
 const close=button('Cancel trip',()=>{if(phase==='riding'||phase==='arrival')options.move(tripStops.platform.x,tripStops.platform.z);phase='gate';complete='';panel.open=false;refresh()})
 const directions:Record<TripPhase,string>={gate:'Choose a trip at the Laflin gate.',platform:'Platform lift transfer complete. Board when the west train stops.',riding:'Riding to East Market.',arrival:'East Market. Tap Exit train for street level.',ramp:'Use DRIVE in a nearby car. Follow the map to the west on-ramp.',highway:'Merge onto the eastbound expressway.',exit:'Take the signed East Market exit.',drop:'Deliver at the market loading bay.',save:'Arrived. Save your place on this device.'}
 function refresh(){
  const stop=phase in tripStops?tripStops[phase as keyof typeof tripStops]:null
  const p=options.position()
  const hint=stop && ['ramp','highway','exit','drop','platform'].includes(phase)?' '+Math.round(Math.hypot(stop.x-p.x,stop.z-p.z))+' m · '+[stop.z<p.z-2?'north':stop.z>p.z+2?'south':'',stop.x<p.x-2?'west':stop.x>p.x+2?'east':''].filter(Boolean).join(' '):''
  drawMap(p.x,p.z)
  const line=(complete||directions[phase])+hint
  if(status.textContent!==line)status.textContent=line
  panel.hidden=phase==='gate'&&!nearGate()&&!saved
  rail.hidden=drive.hidden=phase!=='gate'||!nearGate()
  act.hidden=!['platform','arrival','save'].includes(phase);act.disabled=phase==='platform'&&(!trainAt(now).west||options.vehicle()||Math.hypot(p.x+72,p.z+42)>=6)
  act.textContent=phase==='save'?'Save arrival':phase==='arrival'?'Exit train':'Board train'
  close.hidden=phase==='gate'
 }
 let lastRefresh=-1000
 function frame(time:number){
  now=time
  if(phase==='riding'&&time>=arrivalTime){phase='arrival';announce('East Market. Exit the train on the platform side.');refresh()}
  if(phase==='riding'||phase==='arrival'){
   options.rideCamera(phase==='arrival'?72:trainAt(now).x)
   return true
  }
  const p=options.position(),next=advanceDelivery(phase,p.x,p.z,options.groundVehicle())
  if(next!==phase){phase=next;refresh();if(phase==='save')announce('Delivery received at East Market. Save your arrival.')}
  if(time-lastRefresh>=250){refresh();lastRefresh=time}
  return false
 }
 refresh()
 return {frame,dispose(){panel.remove()}}
}
