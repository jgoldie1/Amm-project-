/** Stubbs Blueprint Graph: original cross-surface building design contract.
 * Conceptual game/digital-twin data, NOT construction, engineering, wiring, or permit documents.
 * No asset generation, external service calls, payment or production side effects.
 */
export type BuildingSurface='streetverse'|'live'|'website'|'training'|'omnibox'
export type SystemKind='electrical'|'plumbing'|'hvac'|'structural'|'accessibility'
export type BlueprintRoom={id:string;name:string;floor:number;areaM2:number}
export type BlueprintFixture={id:string;roomId:string;kind:SystemKind;label:string;approvedForDisplay:boolean}
export type BuildingBlueprint={id:string;ownerId:string;title:string;rooms:BlueprintRoom[];fixtures:BlueprintFixture[];rightsApproved:boolean;surfaces:BuildingSurface[];professionalReview:'not-reviewed'|'reviewed';version:number}
const ID=/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/
const SURFACES=new Set<BuildingSurface>(['streetverse','live','website','training','omnibox'])
const KINDS=new Set<SystemKind>(['electrical','plumbing','hvac','structural','accessibility'])
export function validateBlueprint(b:BuildingBlueprint){
 const errors:string[]=[]
 if(!ID.test(b.id)||!ID.test(b.ownerId)||!b.title?.trim()||b.title.length>160)errors.push('invalid_identity')
 if(!Number.isSafeInteger(b.version)||b.version<1)errors.push('invalid_version')
 if(!Array.isArray(b.rooms)||b.rooms.length<1||b.rooms.length>200)errors.push('invalid_rooms')
 const roomIds=new Set<string>()
 for(const r of b.rooms||[]){
  if(!ID.test(r.id)||roomIds.has(r.id)||!Number.isSafeInteger(r.floor)||r.floor<0||r.floor>100||!Number.isFinite(r.areaM2)||r.areaM2<=0||r.areaM2>100000)errors.push('invalid_room')
  roomIds.add(r.id)
 }
 const fixtureIds=new Set<string>()
 if(!Array.isArray(b.fixtures)||b.fixtures.length>1200)errors.push('invalid_fixtures')
 for(const f of b.fixtures||[]){
  if(!ID.test(f.id)||fixtureIds.has(f.id)||!roomIds.has(f.roomId)||!KINDS.has(f.kind)||!f.label?.trim())errors.push('invalid_fixture')
  fixtureIds.add(f.id)
 }
 if(!Array.isArray(b.surfaces)||b.surfaces.some(x=>!SURFACES.has(x)))errors.push('invalid_surfaces')
 if(!b.rightsApproved)errors.push('rights_unapproved')
 return{valid:errors.length===0,errors:[...new Set(errors)]}
}
export function createSurfaceManifest(b:BuildingBlueprint,surface:BuildingSurface){
 const result=validateBlueprint(b)
 if(!result.valid)return{ready:false,reason:result.errors.join(','),fixtures:[],rooms:[]}
 if(!b.surfaces.includes(surface))return{ready:false,reason:'surface_not_authorized',fixtures:[],rooms:[]}
 const fixtures=b.fixtures.filter(f=>f.approvedForDisplay)
 return{ready:true,reason:surface==='training'&&b.professionalReview!=='reviewed'?'concept_training_only':'concept_visualization_only',
  id:b.id,version:b.version,surface,rooms:b.rooms.map(r=>({...r})),fixtures:fixtures.map(f=>({...f}))}
}
export const BLUEPRINT_SAFETY=Object.freeze({realConstructionUse:false,realWorldElectricalInstructions:false,realWorldPlumbingInstructions:false,automaticPublishing:false,paymentAccess:false})
