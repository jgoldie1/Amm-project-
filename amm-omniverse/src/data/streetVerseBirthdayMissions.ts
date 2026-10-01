export type StreetVerseMission=Readonly<{id:string;title:string;marker:{x:number;z:number};objective:{x:number;z:number;label:string};xp:number;credits:number;requiresVehicle?:boolean}>
export const NEAR_WEST_BIRTHDAY_MISSIONS:readonly StreetVerseMission[]=[
 {id:'birthday-taylor-run',title:'Taylor Street First Run',marker:{x:-650,z:700},objective:{x:-360,z:710,label:'Drive to the Taylor Street delivery point'},xp:250,credits:1500,requiresVehicle:true},
 {id:'birthday-uic-meet',title:'UIC CollegeBook Meet',marker:{x:-610,z:760},objective:{x:-760,z:650,label:'Reach the UIC CollegeBook gateway'},xp:175,credits:900},
]
export const requestMissionReward=(mission:StreetVerseMission)=>window.dispatchEvent(new CustomEvent('tryamm:mission-reward-request',{detail:{missionId:mission.id,xp:mission.xp,credits:mission.credits,currency:'SV_CREDITS'}}))
