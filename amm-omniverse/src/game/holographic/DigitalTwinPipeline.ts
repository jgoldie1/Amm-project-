import * as THREE from 'three'

export type TwinEvidence='authoritative-gis'|'licensed-plan'|'owner-authorized'|'open-data'|'permissioned-scan'|'conceptual'
export type TwinLOD='footprint'|'massing'|'exterior'|'interior-authorized'|'interactive'

export interface DigitalTwinPart{
 id:string;kind:'site'|'building'|'floor'|'wall'|'door'|'window'|'stairs'|'elevator'|'room'|'fixture'|'accessible-route'
 evidence:TwinEvidence;lod:TwinLOD;verified:boolean;sensitive?:boolean
}

export interface DigitalTwinManifest{
 id:string;label:string;crs:string;origin?:{lat:number;lng:number};parts:DigitalTwinPart[]
 rightsCleared:boolean;surveyAccurate:boolean;updatedAt:string
}

export const CIRCLE_PARK_TWIN:DigitalTwinManifest={
 id:'chi-circle-park-digital-twin-v1',
 label:'Circle Park Digital Twin',
 crs:'EPSG:4326',
 parts:[
  {id:'site',kind:'site',evidence:'conceptual',lod:'massing',verified:false},
  {id:'buildings',kind:'building',evidence:'conceptual',lod:'massing',verified:false},
  {id:'entrance-demo',kind:'door',evidence:'conceptual',lod:'interactive',verified:false},
  {id:'accessible-route-demo',kind:'accessible-route',evidence:'conceptual',lod:'interactive',verified:false},
 ],
 rightsCleared:false, surveyAccurate:false, updatedAt:new Date(0).toISOString()
}

export function twinReadyForAccuracy(manifest:DigitalTwinManifest){
 return manifest.rightsCleared&&manifest.surveyAccurate&&manifest.parts.filter(p=>!p.sensitive).every(p=>p.verified)
}

export function createTwinDebugOverlay(manifest:DigitalTwinManifest){
 const group=new THREE.Group();group.name=`${manifest.id}-debug`
 manifest.parts.forEach((part,i)=>{
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.18,8,6),new THREE.MeshBasicMaterial({color:part.verified?0x38ff88:0xffcc33}))
  marker.position.set(i*.5,1,0);marker.userData=part;group.add(marker)
 })
 return group
}

export const DIGITAL_TWIN_PIPELINE=[
 'authoritative/open geospatial footprint',
 'rights-cleared exterior references or scan',
 'CAD/BIM structural model',
 'mobile LOD optimization',
 'collision/navigation mesh',
 'authorized interaction graph',
 'holographic presentation layer',
 'historical memory/time layers',
 'QA: geometry + rights + accessibility + mobile performance',
] as const

export const DIGITAL_TWIN_RULES=[
 'Never label conceptual geometry as survey-accurate.',
 'Do not infer or publish current private interiors or sensitive security/infrastructure.',
 'Every persistent source asset carries provenance, rights and confidence metadata.',
 'Google map/street imagery may be linked/viewed only under applicable terms; do not turn reference-only imagery into owned TRYAMM textures/geometry.',
 'Historical interiors require lawful records or permissioned contributor material.',
 'Generate separate mobile LODs rather than rendering full CAD/BIM complexity on phones.'
] as const
