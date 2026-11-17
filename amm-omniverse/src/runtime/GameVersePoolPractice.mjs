/** Accessible, deterministic 2-ball POOL PRACTICE puzzle. No money/prizes/chips/multiplayer. */
export const POOL_PRACTICE_RULES=Object.freeze({mode:'skill-practice-only',wagers:false,entryFees:false,payouts:false,prizes:false,creditSpending:false,ranked:false})
export const POOL_POCKETS=Object.freeze([[10,10],[300,10],[590,10],[10,290],[300,290],[590,290],[590,150]])
export function newPoolPractice(){return {schema:'tryamm.gameverse.pool-practice.v1',cue:{x:170,y:150,vx:0,vy:0},target:{x:340,y:150,vx:0,vy:0},potted:false,shots:0,complete:false,cashValue:0}}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(v))?Number(v):min))
export function shootPoolPractice(state,angle=0,power=7){
 if(!state||state.schema!=='tryamm.gameverse.pool-practice.v1'||state.complete)return {ok:false,state,error:'Reset the table to continue.'}
 if(state.shots>=12)return {ok:false,state,error:'Practice shot limit reached.'}
 const theta=clamp(angle,-60,60)*Math.PI/180
 const speed=140+clamp(power,1,10)*32
 const cue={...state.cue,vx:Math.cos(theta)*speed,vy:Math.sin(theta)*speed}
 const target={...state.target}
 let potted=false
 const r=10,dt=0.016
 for(let frame=0;frame<650;frame++){
  for(const ball of [cue,target]){
   ball.x+=ball.vx*dt;ball.y+=ball.vy*dt
   ball.vx*=.987;ball.vy*=.987
   if(ball.x<r){ball.x=r;ball.vx=Math.abs(ball.vx)*.85}
   if(ball.x>600-r){ball.x=600-r;ball.vx=-Math.abs(ball.vx)*.85}
   if(ball.y<r){ball.y=r;ball.vy=Math.abs(ball.vy)*.85}
   if(ball.y>300-r){ball.y=300-r;ball.vy=-Math.abs(ball.vy)*.85}
  }
  if(!potted){
   const dx=target.x-cue.x,dy=target.y-cue.y,d=Math.hypot(dx,dy)
   if(d>0&&d<r*2&&((cue.vx-target.vx)*dx+(cue.vy-target.vy)*dy)>0){
    const nx=dx/d,ny=dy/d,closing=(cue.vx-target.vx)*nx+(cue.vy-target.vy)*ny
    cue.vx-=closing*nx;cue.vy-=closing*ny
    target.vx+=closing*nx;target.vy+=closing*ny
    target.x=cue.x+nx*20.01;target.y=cue.y+ny*20.01
   }
   if(POOL_POCKETS.some(([x,y])=>Math.hypot(target.x-x,target.y-y)<19))potted=true
  }
  if(potted)break
  if(Math.hypot(cue.vx,cue.vy)<.08&&Math.hypot(target.vx,target.vy)<.08)break
 }
 return {ok:true,state:{...state,cue,target,potted,shots:state.shots+1,complete:potted||state.shots+1>=12},message:potted?'Target ball pocketed! Free skill-practice complete.':'Target not pocketed. Adjust aim and retry.'}
}
export function poolPracticeReceipt(state){return {schema:'tryamm.gameverse.pool-practice-receipt.v1',shots:state.shots,potted:state.potted,simulated:true,creditsAwarded:0,cashValue:0,realPrize:false,backendVerified:false}}
