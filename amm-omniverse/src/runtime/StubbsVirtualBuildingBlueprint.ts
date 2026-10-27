/** TRYAMM reusable virtual building blueprint. Not an engineering or permit document. */
export type BuildingService='power'|'lighting'|'water'|'drainage'|'data'|'fire-safety'
export type Surface='streetverse'|'live'|'website'|'omnibox'|'training'
export type BlueprintNode={id:string;kind:'room'|'door'|'fixture'|'service';level:number;x:number;y:number;service?:BuildingService}
export type VirtualBlueprint={id:string;district:string;licenseApproved:boolean;ownerApproved:boolean;nodes:BlueprintNode[];surfaces:Surface[];title:string}
const safe=/^[a-z0-9_-]{1,64}$/i
const surfaces:Surface[]=['streetverse','live','website','omnibox','training']
const services:BuildingService[]=['power','lighting','water','drainage','data','fire-safety']
export function validateVirtualBlueprint(b:VirtualBlueprint){
 const errors:string[]=[]
 if(!safe.test(b.id)||!safe.test(b.district)||!b.title||b.title.length>120)errors.push('identity_invalid')
 if(!b.licenseApproved||!b.ownerApproved)errors.push('rights_unapproved')
 if(!Array.isArray(b.nodes)||b.nodes.length===0||b.nodes.length>300)errors.push('node_budget_invalid')
 const ids=new Set<string>()
 for(const n of b.nodes||[]){
  if(!safe.test(n.id)||ids.has(n.id)||!Number.isInteger(n.level)||n.level<0||n.level>30||!Number.isFinite(n.x)||!Number.isFinite(n.y)||Math.abs(n.x)>1000||Math.abs(n.y)>1000)errors.push('node_invalid')
  if(n.service&&(!services.includes(n.service)||n.kind!=='service'&&n.kind!=='fixture'))errors.push('service_invalid')
  ids.add(n.id)
 }
 if(!Array.isArray(b.surfaces)||!b.surfaces.length||b.surfaces.some(s=>!surfaces.includes(s)))errors.push('surface_invalid')
 return{valid:errors.length===0,errors:[...new Set(errors)]}
}
export function planBlueprintReuse(b:VirtualBlueprint){
 const check=validateVirtualBlueprint(b)
 if(!check.valid)return{ready:false,outputs:[],errors:check.errors}
 const outputs=b.surfaces.map(surface=>({surface,blueprintId:b.id,mode:surface==='streetverse'?'interactive-scene':surface==='live'?'virtual-set':surface==='website'?'interactive-showroom':surface==='omnibox'?'film-set':'training-simulation'}))
 return{ready:true,outputs,errors:[]}
}
export const BLUEPRINT_SAFETY=Object.freeze({realConstructionCertified:false,realElectricalDesign:false,realPlumbingDesign:false,permitReady:false,serverPaymentsEnabled:false,autoPublish:false})
