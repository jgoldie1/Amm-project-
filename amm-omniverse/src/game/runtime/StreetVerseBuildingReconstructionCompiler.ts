// StreetVerse building reconstruction: game-world configuration, not construction engineering.
export type Level={id:string;label:string;elevationM:number;rooms:{id:string;label:string;doorIds:string[]}[]};
export type Connection={id:string;kind:'stairs'|'elevator'|'accessible-ramp';from:string;to:string;accessible:boolean};
export type Shell={widthM:number;depthM:number;levels:Level[]};
export type Source={id:string;kind:'floor-plan'|'blueprint'|'scan'|'photo'|'owner-model';rights:'owner-authorized'|'licensed'|'tryamm-created'|'reference-only'|'unknown';currentPrivateInterior?:boolean;sensitiveInfrastructure?:boolean};
export type BuildingPlan={id:string;cityId:string;district:string;label:string;source:Source[];shell:Shell;connections:Connection[];publicEntryLevelId:string;layers:{electrical:boolean;plumbing:boolean;hvac:boolean};assetStore:{namespace:'spaceverse';version:string;assetIds:string[]};interiorAccess:'public-simulation'|'owner-approved'|'locked'};
export type Result={id:string;status:'preview-only';levels:{id:string;label:string;roomCount:number}[];navigation:Record<string,string[]>;surface:{widthM:number;depthM:number;store:string};layers:string[];warnings:string[];playable:false};
const MAX_LEVELS=80;
export function compileBuildingReconstruction(plan:BuildingPlan):Result{
 if(!plan||!/^[a-z0-9-]{3,90}$/.test(plan.id)||!/^[a-z0-9-]{5,80}$/.test(plan.cityId))throw Error('invalid_building_identity');
 const {widthM,depthM,levels}=plan.shell||{};
 if(!Number.isFinite(widthM)||!Number.isFinite(depthM)||widthM<=0||depthM<=0||widthM>500||depthM>500||!Array.isArray(levels)||levels.length<1||levels.length>MAX_LEVELS)throw Error('invalid_shell');
 const ids=new Set(levels.map(l=>l.id));
 if(ids.size!==levels.length||!ids.has(plan.publicEntryLevelId))throw Error('invalid_levels');
 for(const l of levels){if(!Number.isFinite(l.elevationM)||!Number.isFinite(l.heightM)||l.heightM<2||l.heightM>25||!Array.isArray(l.rooms)||l.rooms.length>200)throw Error('invalid_level_geometry');if(new Set(l.rooms.map(r=>r.id)).size!==l.rooms.length)throw Error('duplicate_room')}
 const navigation:Record<string,string[]>={};
 for(const l of levels)navigation[l.id]=[];
 for(const c of plan.connections||[]){if(!ids.has(c.from)||!ids.has(c.to)||c.from===c.to)throw Error('invalid_connection');navigation[c.from].push(c.to);navigation[c.to].push(c.from)}
 const visited=new Set([plan.publicEntryLevelId]),queue=[plan.publicEntryLevelId];
 while(queue.length){const n=queue.shift()!;for(const x of navigation[n])if(!visited.has(x)){visited.add(x);queue.push(x)}}
 const warnings:string[]=[];
 if(visited.size!==ids.size)warnings.push('Some floors have no navigable connection');
 if(levels.length>1&&!plan.connections?.some(c=>c.kind==='elevator'||c.kind==='accessible-ramp'))warnings.push('No accessible vertical route');
 if((plan.source||[]).some(s=>s.rights==='unknown'||s.rights==='reference-only'))warnings.push('Restricted source: do not publish derived assets');
 if((plan.source||[]).some(s=>s.currentPrivateInterior||s.sensitiveInfrastructure))warnings.push('Private or sensitive infrastructure: withhold from public scene');
 if(!plan.assetStore||plan.assetStore.namespace!=='spaceverse'||!/^v[0-9]+$/.test(plan.assetStore.version)||!Array.isArray(plan.assetStore.assetIds))throw Error('invalid_asset_manifest');
 return {id:plan.id,status:'preview-only',levels:levels.map(l=>({id:l.id,label:l.label,roomCount:l.rooms.length})),navigation,surface:{widthM,depthM,store:'spaceverse/'+plan.id+'/'+plan.assetStore.version},layers:Object.entries(plan.layers||{}).filter(([,v])=>v===true).map(([k])=>k+'-visual-simulation'),warnings,playable:false};
}
// Municipal architectural plans and MEP data must be authorized, licensed and redacted.
// This module must never be used for actual structural, electrical, plumbing, fire or permit approval.
