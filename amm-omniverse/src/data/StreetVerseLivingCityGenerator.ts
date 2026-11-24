import type {StreetVerseCommunitySlice} from '../config/streetverseCommunitySlices'
/**
 * StreetVerse Living City Generator — district-scale procedural layout contracts.
 * Synthetic playable geometry ONLY. Not real street maps, bridge engineering,
 * verified landmarks, completed GLBs, or a claim of production deployment.
 */
export type CityBuildPhase = 'prototype' | 'planned';
export type FeatureKind = 'road' | 'bridge' | 'transit' | 'building' | 'landmark' | 'mission';
export type CitySeed = {
  id: string; name: string; region: string; country: string;
  starterDistrict: string; theme: string; phase: CityBuildPhase;
  boroughs?: readonly string[];
  channels?: readonly string[];
};
export type CityFeature = { id: string; type: FeatureKind; x: number; z: number; length?: number; tag: string };
export type GeneratedDistrict = { cityId: string; district: string; seed: number; features: CityFeature[] };

export const STREETVERSE_STARTER_CITIES: readonly CitySeed[] = [
  {id:'chicago',name:'Chicago',region:'Illinois',country:'USA',starterDistrict:'Circle Park / Taylor Street',theme:'neighborhood-business-healthcare',phase:'prototype'},
  {id:'detroit',name:'Detroit',region:'Michigan',country:'USA',starterDistrict:'Downtown / Midtown',theme:'automotive-logistics',phase:'planned'},
  {id:'atlanta',name:'Atlanta',region:'Georgia',country:'USA',starterDistrict:'Downtown',theme:'film-music-television',phase:'planned'},
  {id:'philadelphia',name:'Philadelphia',region:'Pennsylvania',country:'USA',starterDistrict:'Center City',theme:'boxing-healthcare',phase:'planned'},
  {id:'miami',name:'Miami',region:'Florida',country:'USA',starterDistrict:'Downtown / Brickell',theme:'international-commerce-entertainment',phase:'planned'},
  {id:'las-vegas',name:'Las Vegas',region:'Nevada',country:'USA',starterDistrict:'The Strip',theme:'shows-hospitality',phase:'planned'},
  {id:'houston',name:'Houston',region:'Texas',country:'USA',starterDistrict:'Downtown',theme:'energy-medicine-space',phase:'planned'},
  {id:'dallas',name:'Dallas',region:'Texas',country:'USA',starterDistrict:'Downtown',theme:'technology-business',phase:'planned'},
  {id:'new-york',name:'New York City',region:'New York',country:'USA',starterDistrict:'Brooklyn',theme:'media-transit-careers',phase:'planned',boroughs:['Brooklyn','Manhattan','Queens','The Bronx','Staten Island']},
  {id:'los-angeles',name:'Los Angeles',region:'California',country:'USA',starterDistrict:'Hollywood',theme:'film-recording-studios',phase:'planned'},
  {id:'san-diego',name:'San Diego',region:'California',country:'USA',starterDistrict:'Gaslamp Quarter',theme:'wellness-tourism',phase:'planned'},
  {id:'sacramento',name:'Sacramento',region:'California',country:'USA',starterDistrict:'Downtown / R Street Corridor',theme:'streaming-broadcast-creator-production',phase:'planned',channels:['All American Network','Isaiah AI TV','StreetVerse Radio','Holo LIVE']},
  {id:'lagos',name:'Lagos',region:'Lagos',country:'Nigeria',starterDistrict:'Lagos Island',theme:'creator-commerce-music',phase:'planned'},
  {id:'addis-ababa',name:'Addis Ababa',region:'Addis Ababa',country:'Ethiopia',starterDistrict:'Bole',theme:'culture-business',phase:'planned'},
] as const;

export const STREETVERSE_REGIONAL_LINKS = [
  {id:'california',cities:['los-angeles','san-diego','sacramento'],mode:'intercity-travel-menu'},
  {id:'texas',cities:['houston','dallas'],mode:'intercity-travel-menu'},
  {id:'new-york-boroughs',cities:['new-york'],mode:'five-borough-transit-menu'},
  {id:'global',cities:['chicago','lagos','addis-ababa'],mode:'airport-travel-menu'}
] as const;

/** Stable, offline-safe hash; changing city ID or seed changes the layout. */
export function districtSeed(id: string): number {
  let h = 2166136261;
  for (const c of id) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
export function generateStarterDistrict(cityId: string, blocks = 4, area?: StreetVerseCommunitySlice): GeneratedDistrict {
  const city = STREETVERSE_STARTER_CITIES.find(c => c.id === cityId);
  if (!city) throw new Error('Unknown StreetVerse city: ' + cityId);
  if (!Number.isInteger(blocks) || blocks < 2 || blocks > 12) throw new Error('blocks must be an integer from 2 to 12');
  const features: CityFeature[] = [];
  const spacing = 80, extent = (blocks-1)*spacing;
  // Road grid leaves intersection nodes reachable and crossing-free by default.
  for(let i=0;i<blocks;i++) {
    features.push({id:`${cityId}:road:e:${i}`,type:'road',x:0,z:i*spacing,length:extent,tag:'east-west'});
    features.push({id:`${cityId}:road:n:${i}`,type:'road',x:i*spacing,z:0,length:extent,tag:'north-south'});
  }
  // Bridges span only a synthetic district canal; real geography needs licensed data.
  features.push({id:`${cityId}:bridge:1`,type:'bridge',x:spacing,z:spacing,length:spacing,tag:'synthetic-water-crossing'});
  features.push({id:`${cityId}:transit:1`,type:'transit',x:0,z:0,tag:'arrival-spawn'});
  features.push({id:`${cityId}:landmark:1`,type:'landmark',x:spacing,z:spacing,tag:'starter-district-hub'});
  features.push({id:`${cityId}:mission:1`,type:'mission',x:spacing,z:0,tag:'welcome-mission'});
  if (area && cityId !== 'chicago') throw new Error('Community areas require Chicago');
  const layoutId = area ? 'chicago:ca-' + area.communityAreaNumber : cityId;
  const initialSeed = districtSeed(layoutId);
  let seed = initialSeed;
  for(let i=0;i<blocks*blocks;i++){
    seed = (Math.imul(seed,1664525)+1013904223)>>>0;
    const x=(i%blocks)*spacing+24, z=Math.floor(i/blocks)*spacing+24;
    features.push({id:`${cityId}:building:${i}`,type:'building',x,z,tag:(seed%3===0?'commercial':seed%3===1?'residential':'civic')});
  }
  if (area) {
    for (const feature of features) feature.id = feature.id.replace('chicago:', layoutId + ':');
    for (const mission of area.missions) {
      features.push({id:layoutId + ':anchor:' + mission.id,type:'mission',x:mission.x,z:mission.y,tag:mission.label});
    }
  }
  return {cityId,district:area?.name ?? city.starterDistrict,seed:initialSeed,features};
}
export function validateStarterDistrict(district: GeneratedDistrict): string[] {
  const ids = district.features.map(f=>f.id);
  const errors: string[] = [];
  if(new Set(ids).size!==ids.length) errors.push('duplicate-feature-ids');
  if(!district.features.some(f=>f.type==='transit')) errors.push('missing-arrival');
  if(!district.features.some(f=>f.type==='mission')) errors.push('missing-first-mission');
  if(!district.features.some(f=>f.type==='road')) errors.push('missing-roads');
  for(const f of district.features) if(!Number.isFinite(f.x)||!Number.isFinite(f.z)) errors.push('invalid-position:'+f.id);
  return errors;
}
