export type StreetVerseCharacterDevelopmentState=Readonly<{
 characterId:string
 level:number
 xp:number
 skillXp:Readonly<Record<string,number>>
 unlockedOutfits:readonly string[]
 unlockedEras:readonly string[]
 relationshipLevel:number
 storyFlags:readonly string[]
 updatedAt:string
 authority:'SERVER'
}>

export const STREETVERSE_CHARACTER_LEVEL_XP=(level:number)=>Math.max(0,Math.round((level-1)*(level-1)*500))

export const createCharacterDevelopmentState=(characterId:string):StreetVerseCharacterDevelopmentState=>({
 characterId,
 level:1,
 xp:0,
 skillXp:{},
 unlockedOutfits:['default'],
 unlockedEras:['current'],
 relationshipLevel:0,
 storyFlags:[],
 updatedAt:new Date(0).toISOString(),
 authority:'SERVER',
})

export const requestCharacterDevelopmentAward=(detail:{
 characterId:string
 source:string
 skill?:string
 xp:number
 storyFlag?:string
})=>window.dispatchEvent(new CustomEvent('tryamm:character-development-award-request',{detail:{...detail,serverValidate:true}}))

export const requestCharacterOutfitUnlock=(detail:{characterId:string;outfitId:string;source:string})=>
 window.dispatchEvent(new CustomEvent('tryamm:character-outfit-unlock-request',{detail:{...detail,serverValidate:true}}))

export const requestCharacterEraUnlock=(detail:{characterId:string;eraId:string;source:string})=>
 window.dispatchEvent(new CustomEvent('tryamm:character-era-unlock-request',{detail:{...detail,serverValidate:true}}))

const key=(id:string)=>'tryamm:character-development-cache:v1:'+id

export function installStreetVerseCharacterDevelopmentRuntime(characterId:string){
 let state=createCharacterDevelopmentState(characterId)
 try{
  const parsed=JSON.parse(localStorage.getItem(key(characterId))||'null')
  if(parsed?.characterId===characterId&&parsed?.authority==='SERVER')state=parsed
 }catch{}

 const publish=()=>window.dispatchEvent(new CustomEvent('tryamm:character-development-updated',{detail:state}))
 const cache=()=>{try{localStorage.setItem(key(characterId),JSON.stringify(state))}catch{};publish()}

 const onSync=(e:Event)=>{
  const next=(e as CustomEvent<StreetVerseCharacterDevelopmentState>).detail
  if(!next||next.characterId!==characterId||next.authority!=='SERVER')return
  state={...next,updatedAt:new Date().toISOString()}
  cache()
 }

 const onMission=(e:Event)=>{
  const d=(e as CustomEvent<Record<string,unknown>>).detail||{}
  const skill=String(d.skill||d.lane||'Leadership')
  requestCharacterDevelopmentAward({characterId,source:'mission-complete',skill,xp:Number(d.xp||100),storyFlag:typeof d.missionId==='string'?'mission:'+d.missionId:undefined})
 }

 const onInteraction=(e:Event)=>{
  const d=(e as CustomEvent<Record<string,unknown>>).detail||{}
  if(String(d.characterId||characterId)!==characterId)return
  requestCharacterDevelopmentAward({characterId,source:'character-interaction',skill:String(d.skill||'Mentoring'),xp:25})
 }

 const onRepair=()=>requestCharacterDevelopmentAward({characterId,source:'vehicle-repair',skill:'Logistics',xp:40})
 const onSecurity=()=>requestCharacterDevelopmentAward({characterId,source:'security-mission',skill:'Protection',xp:80})

 window.addEventListener('tryamm:character-development-sync',onSync)
 window.addEventListener('tryamm:streetverse-mission-complete',onMission)
 window.addEventListener('tryamm:streetverse-character-interaction-complete',onInteraction)
 window.addEventListener('tryamm:streetverse-repair-complete',onRepair)
 window.addEventListener('tryamm:streetverse-security-mission-complete',onSecurity)
 queueMicrotask(publish)

 return{
  getState:()=>state,
  dispose:()=>{
   window.removeEventListener('tryamm:character-development-sync',onSync)
   window.removeEventListener('tryamm:streetverse-mission-complete',onMission)
   window.removeEventListener('tryamm:streetverse-character-interaction-complete',onInteraction)
   window.removeEventListener('tryamm:streetverse-repair-complete',onRepair)
   window.removeEventListener('tryamm:streetverse-security-mission-complete',onSecurity)
  }
 }
}
