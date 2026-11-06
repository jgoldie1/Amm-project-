/** Local, evidence-driven certification only. Does not certify multiplayer, real commerce or real devices. */
export const CERT_KEY='tryamm.streetverse.chicago-cert.v1'
export const CERT_RELOAD_KEY='tryamm.streetverse.chicago-cert-reload.v1'
export const CERT_STEPS=['shop-entry','npc-dialogue','wardrobe','checkout','van-drive','delivery','reload'] as const
export type CertStep=typeof CERT_STEPS[number]
export type CertEvidence={step:CertStep;at:string;detail:string}
export type ChicagoCert={version:1;events:CertEvidence[];startedAt:string}
export const emptyCert=():ChicagoCert=>({version:1,events:[],startedAt:new Date().toISOString()})
export function markCert(state:ChicagoCert,step:CertStep,detail:string,at=new Date().toISOString()):ChicagoCert{
 if(!CERT_STEPS.includes(step)||!detail||state.events.some(e=>e.step===step))return state
 return {...state,events:[...state.events,{step,at,detail:detail.slice(0,180)}]}
}
export function readCert(raw:string|null):ChicagoCert{
 if(!raw)return emptyCert()
 try{const d=JSON.parse(raw);if(d?.version!==1||!Array.isArray(d.events)||d.events.length>30||typeof d.startedAt!=='string')return emptyCert()
 return {...d,events:d.events.filter((e:CertEvidence)=>CERT_STEPS.includes(e?.step)&&typeof e.detail==='string'&&typeof e.at==='string')}}catch{return emptyCert()}
}
export const certComplete=(c:ChicagoCert)=>CERT_STEPS.every(step=>c.events.some(e=>e.step===step))
