export type RPActionCategory='social'|'dance'|'emotion'|'relationship'|'work'|'sport'|'faith'|'public-safety'|'medical'|'creator'
export type RPActionPurpose='greet'|'celebrate'|'perform'|'react'|'comfort'|'romance'|'argue'|'work'|'train'|'serve'|'pray'|'pose'|'record'
export type RPActionEntry=Readonly<{
 id:string
 label:string
 category:RPActionCategory
 purposes:readonly RPActionPurpose[]
 tags:readonly string[]
 animationClip:string
 gifQuery:string
 loopable:boolean
 syncable:boolean
 npcCompatible:boolean
 playerCompatible:boolean
 reelFriendly:boolean
 liveFriendly:boolean
 durationMs:number
}>

export const STREETVERSE_RP_ACTIONS:readonly RPActionEntry[]=[
 {id:'wave-friendly',label:'Friendly Wave',category:'social',purposes:['greet'],tags:['wave','hello','hi','greet','friend'],animationClip:'wave-friendly',gifQuery:'friendly wave animation',loopable:false,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:2200},
 {id:'handshake',label:'Handshake',category:'social',purposes:['greet'],tags:['handshake','business','meet','greet'],animationClip:'handshake',gifQuery:'handshake animation',loopable:false,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:2600},
 {id:'hug',label:'Hug',category:'relationship',purposes:['comfort','romance','greet'],tags:['hug','comfort','family','friend','love'],animationClip:'hug',gifQuery:'hug animation',loopable:false,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:3200},
 {id:'laugh',label:'Laugh',category:'emotion',purposes:['react','celebrate'],tags:['laugh','funny','joke','happy'],animationClip:'laugh',gifQuery:'laughing animation',loopable:false,syncable:false,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:2600},
 {id:'argue',label:'Argue / Talk With Hands',category:'emotion',purposes:['argue','react'],tags:['argue','angry','talk','debate','hands'],animationClip:'argue',gifQuery:'arguing hand gestures animation',loopable:true,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:5200},
 {id:'sit-relaxed',label:'Sit Relaxed',category:'social',purposes:['pose','react'],tags:['sit','chair','bench','relax'],animationClip:'sit-relaxed',gifQuery:'sitting relaxed animation',loopable:true,syncable:false,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:8000},
 {id:'street-dance',label:'Street Dance',category:'dance',purposes:['perform','celebrate'],tags:['dance','street','party','club','music'],animationClip:'street-dance',gifQuery:'street dance animation',loopable:true,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:8000},
 {id:'two-step',label:'Two Step',category:'dance',purposes:['perform','celebrate'],tags:['dance','two step','party','slow groove'],animationClip:'two-step',gifQuery:'two step dance animation',loopable:true,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:8000},
 {id:'victory',label:'Victory Celebration',category:'emotion',purposes:['celebrate','react'],tags:['victory','win','cheer','celebrate','sports'],animationClip:'victory',gifQuery:'victory celebration animation',loopable:false,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:3400},
 {id:'pray-standing',label:'Standing Prayer',category:'faith',purposes:['pray'],tags:['pray','prayer','faith','worship','yahavah'],animationClip:'pray-standing',gifQuery:'standing prayer animation',loopable:true,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:7000},
 {id:'mechanic-work',label:'Mechanic Repair',category:'work',purposes:['work','serve'],tags:['mechanic','repair','car','wrench','work'],animationClip:'mechanic-work',gifQuery:'mechanic working animation',loopable:true,syncable:false,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:7000},
 {id:'security-scan',label:'Security Scan',category:'public-safety',purposes:['work','serve'],tags:['security','guard','inspect','scan','protect'],animationClip:'security-scan',gifQuery:'security guard scanning animation',loopable:true,syncable:false,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:5200},
 {id:'police-radio',label:'Radio Dispatch',category:'public-safety',purposes:['work','serve'],tags:['police','sheriff','radio','dispatch','public safety'],animationClip:'radio-dispatch',gifQuery:'police radio animation',loopable:true,syncable:false,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:4500},
 {id:'medical-assist',label:'Medical Assist',category:'medical',purposes:['serve','work'],tags:['medical','ems','ambulance','help','patient'],animationClip:'medical-assist',gifQuery:'paramedic helping patient animation',loopable:true,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:7000},
 {id:'basketball-dribble',label:'Basketball Dribble',category:'sport',purposes:['train','perform'],tags:['basketball','dribble','sport','court','training'],animationClip:'basketball-dribble',gifQuery:'basketball dribble animation',loopable:true,syncable:false,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:7000},
 {id:'creator-pose',label:'Creator Pose',category:'creator',purposes:['pose','record'],tags:['creator','camera','pose','reel','photo'],animationClip:'creator-pose',gifQuery:'creator posing animation',loopable:false,syncable:false,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:3000},
 {id:'mic-performance',label:'Mic Performance',category:'creator',purposes:['perform','record'],tags:['mic','rap','sing','perform','music','stage'],animationClip:'mic-performance',gifQuery:'microphone performance animation',loopable:true,syncable:true,npcCompatible:true,playerCompatible:true,reelFriendly:true,liveFriendly:true,durationMs:9000},
]

const norm=(s:string)=>s.toLowerCase().trim().replace(/\s+/g,' ')
export function searchStreetVerseRPActions(query:string,purpose?:RPActionPurpose|'all'){
 const q=norm(query)
 return STREETVERSE_RP_ACTIONS.filter(action=>{
  const purposeOk=!purpose||purpose==='all'||action.purposes.includes(purpose)
  if(!purposeOk)return false
  if(!q)return true
  const hay=norm([action.label,action.category,...action.purposes,...action.tags,action.animationClip,action.gifQuery].join(' '))
  return q.split(' ').every(token=>hay.includes(token))
 })
}

export const STREETVERSE_RP_SEARCH_CAPABILITIES={
 searchByName:true,
 searchByPurpose:true,
 searchByTag:true,
 gifPreviewQuery:true,
 nativeAnimationClip:true,
 favorite:true,
 addToWheel:true,
 loop:true,
 synchronizedActions:true,
 npcTargeting:true,
 playerTargeting:true,
 live:true,
 reel:true,
 externalGifProvider:'provider-gated',
} as const
