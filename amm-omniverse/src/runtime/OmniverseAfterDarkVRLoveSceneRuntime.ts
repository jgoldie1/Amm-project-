import {compileAfterDarkStory,type AfterDarkStoryRequest} from './OmniverseAfterDarkStoryStudioRuntime'

export type AfterDarkVRLoveSceneRequest=AfterDarkStoryRequest&{
 mode?:'immersive-vr'|'immersive-ar'
 sceneId?:string
 relationshipId?:string
}

export type AfterDarkVRLoveScenePlan={
 id:string
 mode:'immersive-vr'|'immersive-ar'
 rating:'18+ MATURE / NON-EXPLICIT'
 relationshipId:string
 prompt:string
 sceneBeats:string[]
 spatialAudio:string[]
 interactionRules:string[]
 cinematicCues:string[]
 outputs:Array<'VR_MR'|'REEL'|'TV_EPISODE'>
}

const STORAGE='tryamm.omniverse.after-dark.vr-love-memory.v1'
let installed=false

export function compileAfterDarkVRLoveScene(request:AfterDarkVRLoveSceneRequest):AfterDarkVRLoveScenePlan{
 if(!request.ageVerified)throw new Error('after-dark-vr-age-assurance-required')
 if(!request.consentAccepted)throw new Error('after-dark-vr-consent-required')
 const story=compileAfterDarkStory({...request,createReel:true,createTvEpisode:true})
 return{
  id:request.sceneId||'vr-love-'+Date.now(),
  mode:request.mode||'immersive-vr',
  rating:'18+ MATURE / NON-EXPLICIT',
  relationshipId:request.relationshipId||'relationship-local',
  prompt:request.prompt,
  sceneBeats:[
   'arrive in shared immersive location',
   'mutual greeting / chemistry beat',
   'conversation and choice',
   'consensual dance / embrace / kiss if selected',
   'fade-to-black if the story implies sexual intimacy',
   'aftermath / next-scene relationship beat',
   ...story.sceneBeats,
  ],
  spatialAudio:['environment bed','dialogue priority','music ducking','footstep/proximity cues','non-graphic mature ambience only'],
  interactionRules:[
   'both participants must be adults',
   'active consent is required before interactive romance',
   'either participant may pause or stop at any time',
   'no explicit sex-act animation',
   'no pornographic visual generation',
   'private-session device cues require separate device consent',
  ],
  cinematicCues:['establishing spatial shot','shared two-shot','reaction close-up','slow orbit during romantic beat','fade-to-black transition','aftermath shot'],
  outputs:['VR_MR','REEL','TV_EPISODE'],
 }
}

function remember(plan:AfterDarkVRLoveScenePlan){
 try{const old=JSON.parse(localStorage.getItem(STORAGE)||'[]');localStorage.setItem(STORAGE,JSON.stringify([...(Array.isArray(old)?old:[]),plan].slice(-100)))}catch{}
}

export function installOmniverseAfterDarkVRLoveSceneRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true
 const onRequest=(event:Event)=>{
  const request=(event as CustomEvent<AfterDarkVRLoveSceneRequest>).detail
  if(!request?.prompt)return
  try{
   const plan=compileAfterDarkVRLoveScene(request)
   remember(plan)
   window.dispatchEvent(new CustomEvent('tryamm:meta-quest-request-immersive',{detail:{mode:plan.mode,source:'after-dark-vr-love-scene',sceneId:plan.id}}))
   window.dispatchEvent(new CustomEvent('tryamm:after-dark-vr-scene-plan',{detail:plan}))
   window.dispatchEvent(new CustomEvent('tryamm:after-dark-vr-spatial-audio',{detail:{sceneId:plan.id,cues:plan.spatialAudio,rating:plan.rating}}))
   window.dispatchEvent(new CustomEvent('tryamm:after-dark-vr-cinematic-cues',{detail:{sceneId:plan.id,cues:plan.cinematicCues}}))
   if(request.privateSession)window.dispatchEvent(new CustomEvent('tryamm:after-dark-private-intimacy-audio',{detail:{ageVerified:true,privateSession:true,consented:true,source:'vr-love-scene'}}))
   window.dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'after-dark-vr-love-scene',sceneId:plan.id,rating:plan.rating,prompt:plan.prompt}}))
   window.dispatchEvent(new CustomEvent('tryamm:after-dark-tv-episode-draft',{detail:{source:'after-dark-vr-love-scene',sceneId:plan.id,rating:plan.rating,prompt:plan.prompt,beats:plan.sceneBeats}}))
   window.dispatchEvent(new CustomEvent('tryamm:after-dark-vr-love-scene-ready',{detail:plan}))
  }catch(error){
   window.dispatchEvent(new CustomEvent('tryamm:after-dark-vr-love-scene-blocked',{detail:{error:error instanceof Error?error.message:String(error)}}))
  }
 }
 addEventListener('tryamm:after-dark-vr-love-scene-request',onRequest)
 window.dispatchEvent(new CustomEvent('tryamm:after-dark-vr-love-runtime-ready',{detail:{trueWebXRBridge:true,consentGated:true,fadeToBlack:true,reels:true,tvEpisodes:true}}))
 return()=>{removeEventListener('tryamm:after-dark-vr-love-scene-request',onRequest);installed=false}
}