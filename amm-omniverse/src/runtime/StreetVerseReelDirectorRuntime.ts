export type StreetVerseReelShot=Readonly<{
 id:string
 label:string
 angle:'wide'|'medium'|'close'|'low'|'high'|'over-shoulder'|'pov'|'chase'
 startMs:number
 endMs:number
 purpose:string
}>

export const STREETVERSE_REEL_SHOTS:StreetVerseReelShot[]=[
 {id:'hook',label:'HOOK • CLOSE',angle:'close',startMs:0,endMs:2500,purpose:'Open on face/action immediately'},
 {id:'world',label:'WORLD • WIDE',angle:'wide',startMs:2500,endMs:6000,purpose:'Establish the StreetVerse location'},
 {id:'move',label:'MOVE • LOW',angle:'low',startMs:6000,endMs:9500,purpose:'Add motion and scale'},
 {id:'interaction',label:'INTERACTION • OTS',angle:'over-shoulder',startMs:9500,endMs:13500,purpose:'Show NPC/business interaction'},
 {id:'vehicle',label:'VEHICLE • CHASE',angle:'chase',startMs:13500,endMs:18000,purpose:'Show speed and gameplay consequence'},
 {id:'detail',label:'DETAIL • CLOSE',angle:'close',startMs:18000,endMs:21500,purpose:'Cut to hands, face, item, or UI payoff'},
 {id:'hero',label:'HERO • MEDIUM',angle:'medium',startMs:21500,endMs:26000,purpose:'Return to the character'},
 {id:'cta',label:'CTA • WIDE',angle:'wide',startMs:26000,endMs:30000,purpose:'Finish on world + clear next action'},
]

export function shotAt(ms:number){
 return STREETVERSE_REEL_SHOTS.find(s=>ms>=s.startMs&&ms<s.endMs)||STREETVERSE_REEL_SHOTS[STREETVERSE_REEL_SHOTS.length-1]
}

export function installStreetVerseReelDirector(){
 let timer:number|undefined
 let started=0
 let last=''
 const stop=()=>{if(timer)window.clearInterval(timer);timer=undefined;last=''}
 const onState=(event:Event)=>{
  const d=(event as CustomEvent<{state?:string}>).detail||{}
  if(d.state!=='recording'){stop();return}
  stop();started=performance.now()
  const tick=()=>{
   const elapsed=Math.max(0,performance.now()-started)
   const shot=shotAt(elapsed)
   if(shot.id!==last){
    last=shot.id
    window.dispatchEvent(new CustomEvent('tryamm:reel-director-shot',{detail:{...shot,elapsedMs:Math.round(elapsed),source:'streetverse-reel-director'}}))
    window.dispatchEvent(new CustomEvent('tryamm:reel-marker-recorded',{detail:{kind:'director-shot',shotId:shot.id,label:shot.label,angle:shot.angle,atMs:Math.round(elapsed)}}))
   }
  }
  tick();timer=window.setInterval(tick,160)
 }
 window.addEventListener('tryamm:reel-capture-state',onState)
 return{dispose:()=>{stop();window.removeEventListener('tryamm:reel-capture-state',onState)}}
}
