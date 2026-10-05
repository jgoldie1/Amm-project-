'use strict';
const TRYAMM_KINGDOM_CHANNEL='tryamm:streetverse-kingdom';
const send=(type,detail={})=>{
  const payload={channel:TRYAMM_KINGDOM_CHANNEL,type,source:'streetverse-kingdom',...detail};
  try{window.parent&&window.parent!==window&&window.parent.postMessage(payload,window.location.origin)}catch{}
  try{window.dispatchEvent(new CustomEvent('tryamm:kingdom-local-event',{detail:payload}))}catch{}
};
send('KINGDOM_READY',{district:'kingdom-district',build:'kingdom-district-v2'});
let lastVehicle=null,lastWaypoint='',lastPositionAt=0;
setInterval(()=>{
  try{
    if(typeof player==='undefined')return;
    const vehicle=player.inCar?String(cars.indexOf(player.inCar)):'';
    if(vehicle!==lastVehicle){
      send(vehicle?'VEHICLE_ENTERED':'VEHICLE_EXITED',{vehicleId:vehicle||lastVehicle||undefined,x:player.pos.x,y:player.pos.y,z:player.pos.z});
      lastVehicle=vehicle;
    }
    const wp=typeof waypoint!=='undefined'&&waypoint?waypoint.name:'';
    if(wp!==lastWaypoint){if(wp)send('WAYPOINT_SET',{destination:wp,x:waypoint.pos.x,y:0,z:waypoint.pos.z});lastWaypoint=wp}
    const now=Date.now();
    if(now-lastPositionAt>1000){lastPositionAt=now;send('PLAYER_MOVED',{district:typeof zoneName==='function'?zoneName(player.pos.x,player.pos.z):'kingdom-district',x:player.pos.x,y:player.pos.y,z:player.pos.z,vehicleId:vehicle||undefined})}
  }catch{}
},250);