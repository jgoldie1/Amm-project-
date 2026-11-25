export function completeCircleParkQuest(
  mission:{id:string;title:string;rewardXP:number},
  character:string,
  routeComplete=false,
){
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{
    mission,character,rewardXP:mission.rewardXP,missionId:mission.id,label:mission.title,
    xp:mission.rewardXP,oneTimeQuest:true,...(routeComplete?{routeComplete:true}:{}),
  }}))
}
