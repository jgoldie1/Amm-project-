export type RemoteWorkLane='contact-center'|'streamer'|'creator'|'commerce'|'developer'|'moderator'|'trainer'|'business-operator'
export type RemoteWorkProfile={id:string;lane:RemoteWorkLane;level:number;status:'available'|'working'|'break'|'offline';skills:string[];city?:string;country?:string;sessionStartedAt?:number;tasksCompleted:number;qualityScore:number}

const KEY='tryamm_middleverse_remote_work_v1'
let installed=false
const LANES=[
 {id:'contact-center',label:'AI Contact Center',skills:['customer-support','sales','compliance','dnc','escalation']},
 {id:'streamer',label:'Work-from-Home Streamer',skills:['live','hosting','moderation','shopping','creator-commerce']},
 {id:'creator',label:'Creator Studio Worker',skills:['reels','editing','publishing','campaigns']},
 {id:'commerce',label:'Marketplace Operator',skills:['orders','vendors','inventory','fulfillment']},
 {id:'developer',label:'AI Developer Workstation',skills:['code-review','testing','incidents','automation']},
 {id:'moderator',label:'Trust & Safety Moderator',skills:['moderation','escalation','community-safety']},
 {id:'trainer',label:'Academy Trainer',skills:['training','coaching','qa','accessibility']},
 {id:'business-operator',label:'Living World Business Operator',skills:['sourcing','storefront','marketing','fulfillment']},
] as const

function load():RemoteWorkProfile|null{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}
function save(x:RemoteWorkProfile){try{localStorage.setItem(KEY,JSON.stringify(x))}catch{}}
function publish(profile:RemoteWorkProfile|null){window.dispatchEvent(new CustomEvent('tryamm:middleverse-remote-work-state',{detail:{schema:'tryamm.middleverse.remote-work.v1',profile,lanes:LANES,features:['wfh','streamer-shifts','ai-assist','training','qa','compliance','creator-commerce','global-work','living-world-business','accessibility','progression'],at:Date.now()}}))}

export function installMiddleverseRemoteWorkRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 let profile=load();queueMicrotask(()=>publish(profile))
 window.addEventListener('tryamm:middleverse-remote-work-request',()=>publish(profile))
 window.addEventListener('tryamm:middleverse-remote-work-start',(e:Event)=>{
  const d=(e as CustomEvent<any>).detail||{};const lane=String(d.lane||'streamer') as RemoteWorkLane
  const valid=LANES.some(x=>x.id===lane);if(!valid)return
  profile={id:String(d.id||profile?.id||`worker-${Date.now()}`),lane,level:Math.max(1,Number(d.level||profile?.level||1)),status:'working',skills:[...((LANES.find(x=>x.id===lane)?.skills||[]) as readonly string[])],city:d.city||profile?.city,country:d.country||profile?.country,sessionStartedAt:Date.now(),tasksCompleted:profile?.tasksCompleted||0,qualityScore:profile?.qualityScore||100};save(profile);publish(profile)
  window.dispatchEvent(new CustomEvent('tryamm:middleverse-shift-started',{detail:profile}))
 })
 window.addEventListener('tryamm:middleverse-remote-work-task-complete',(e:Event)=>{if(!profile)return;const d=(e as CustomEvent<any>).detail||{};profile={...profile,tasksCompleted:profile.tasksCompleted+1,qualityScore:Math.max(0,Math.min(100,profile.qualityScore+Number(d.qualityDelta||0)))};save(profile);publish(profile)})
 window.addEventListener('tryamm:middleverse-remote-work-status',(e:Event)=>{if(!profile)return;const status=(e as CustomEvent<any>).detail?.status;if(!['available','working','break','offline'].includes(status))return;profile={...profile,status};save(profile);publish(profile)})
 window.addEventListener('tryamm:world-location-changed',(e:Event)=>{if(!profile)return;const d=(e as CustomEvent<any>).detail||{};profile={...profile,city:d.city||profile.city,country:d.country||profile.country};save(profile);publish(profile)})
}
