// Follow the east side of campus, then the south-facing Student Union entrance.
// The GV05 activity marker is at Academic Hall and is not a vehicle destination.
export const unionRoute = [
  {x:0,z:66, label:'Welcome gate'},
  {x:36,z:66, label:'Campus east drive'},
  {x:36,z:1, label:'Student Union turnoff'},
  {x:18,z:1, label:'Student Union entrance'},
] as const

export function nextUnionLeg(x:number,z:number,leg:number,yaw?:number) {
  while (leg < unionRoute.length && Math.hypot(x-unionRoute[leg].x,z-unionRoute[leg].z)<4) leg++
  const target=unionRoute[leg]
  if (!target) return {leg, text:'Arrived at the Student Union entrance'}
  const dx=target.x-x, dz=target.z-z
  const direction=Math.abs(dx)>Math.abs(dz) ? (dx>0?'east':'west') : (dz>0?'south':'north')
  let instruction='Head '+direction
  if(yaw!==undefined && Number.isFinite(yaw)){
    const angle=Math.atan2(-dz,dx)-yaw
    const turn=Math.atan2(Math.sin(angle),Math.cos(angle))
    instruction=Math.abs(turn)>2.6?'Turn around':Math.abs(turn)<0.4?'Continue straight':turn>0?'Turn left':'Turn right'
  }
  return {leg,text:`${instruction} to ${target.label} · ${Math.round(Math.hypot(dx,dz))} units`}
}

export const unionDrive=[{x:0,z:58},...unionRoute]
export function onUnionDrive(x:number,z:number){
  return unionDrive.slice(1).some((point,index)=>{
    const start=unionDrive[index]
    return x>=Math.min(start.x,point.x)-2.5 && x<=Math.max(start.x,point.x)+2.5
      && z>=Math.min(start.z,point.z)-2.5 && z<=Math.max(start.z,point.z)+2.5
  })
}
