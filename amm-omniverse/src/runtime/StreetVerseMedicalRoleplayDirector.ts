/**
 * Fictional, opt-in StreetVerse medical RP. No real patient records, medical
 * advice, telehealth visits, treatment decisions or surgery instructions.
 */
export type MedicalRoleplayScene='clinic-check-in'|'prenatal-visit'|'labor'|'postpartum'|'training-operating-room'|'recovery'|'telehealth-demo'
export type PregnancyStage='not-pregnant'|'first-trimester'|'second-trimester'|'third-trimester'|'labor'|'postpartum'
export type MedicalAvatarState={
 characterId:string;adultCharacter:boolean;consent:boolean;
 pregnancy:PregnancyStage;bellyScale:number;scene:MedicalRoleplayScene|null;
 companionIds:string[];privateSession:true;fictional:true;
}
export type MedicalSceneConfig={id:MedicalRoleplayScene;label:string;requiresAdult:boolean;simulationOnly:true;requiresConsent:true}
export const STREETVERSE_MEDICAL_SCENES:readonly MedicalSceneConfig[]=[
 {id:'clinic-check-in',label:'Hospital check-in',requiresAdult:false,simulationOnly:true,requiresConsent:true},
 {id:'prenatal-visit',label:'Prenatal appointment RP',requiresAdult:true,simulationOnly:true,requiresConsent:true},
 {id:'labor',label:'Labor and birth story scene',requiresAdult:true,simulationOnly:true,requiresConsent:true},
 {id:'postpartum',label:'Family recovery chapter',requiresAdult:true,simulationOnly:true,requiresConsent:true},
 {id:'training-operating-room',label:'Surgical team training simulation',requiresAdult:true,simulationOnly:true,requiresConsent:true},
 {id:'recovery',label:'Recovery and rehabilitation story',requiresAdult:false,simulationOnly:true,requiresConsent:true},
 {id:'telehealth-demo',label:'Fictional video consultation demo',requiresAdult:true,simulationOnly:true,requiresConsent:true}
]
const BELLY:Record<PregnancyStage,number>={'not-pregnant':1,'first-trimester':1.02,'second-trimester':1.15,'third-trimester':1.32,'labor':1.32,'postpartum':1.10}
const NEXT:Partial<Record<PregnancyStage,PregnancyStage>>={'first-trimester':'second-trimester','second-trimester':'third-trimester','third-trimester':'labor','labor':'postpartum'}
export function createStreetVerseMedicalAvatar(characterId:string,adultCharacter:boolean,consent=false):MedicalAvatarState{
 return {characterId,adultCharacter,consent,pregnancy:'not-pregnant',bellyScale:1,scene:null,companionIds:[],privateSession:true,fictional:true}
}
export function startFictionalPregnancy(state:MedicalAvatarState):MedicalAvatarState{
 if(!state.adultCharacter||!state.consent||state.pregnancy!=='not-pregnant')return state
 return {...state,pregnancy:'first-trimester',bellyScale:BELLY['first-trimester']}
}
export function advanceFictionalPregnancy(state:MedicalAvatarState):MedicalAvatarState{
 if(!state.adultCharacter||!state.consent)return state
 const pregnancy=NEXT[state.pregnancy];if(!pregnancy)return state
 return {...state,pregnancy,bellyScale:BELLY[pregnancy],scene:pregnancy==='labor'?'labor':pregnancy==='postpartum'?'postpartum':state.scene}
}
export function enterMedicalRoleplayScene(state:MedicalAvatarState,scene:MedicalRoleplayScene):MedicalAvatarState{
 const config=STREETVERSE_MEDICAL_SCENES.find(x=>x.id===scene)
 if(!config||!state.consent||config.requiresAdult&&!state.adultCharacter)return state
 if(scene==='labor'&&state.pregnancy!=='labor')return state
 if(scene==='postpartum'&&state.pregnancy!=='postpartum')return state
 return {...state,scene}
}
export function leaveMedicalRoleplay(state:MedicalAvatarState):MedicalAvatarState{
 return {...state,scene:null,companionIds:[]}
}
export const STREETVERSE_REAL_TELEHEALTH_GATE={
 connected:false,
 clinicalUseAllowed:false,
 requires:['verified clinician licensing and services','HIPAA security assessment and BAAs when applicable','private patient consent and records handling','qualified emergency escalation','telehealth provider contract'],
 gameWorldIntegration:'none',
 note:'Never display real consultation audio, video, protected health data or clinical decisions in a public RP world.'
} as const
