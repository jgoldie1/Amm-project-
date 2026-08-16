export type TravelMode='walk'|'bike'|'car'|'bus'|'subway'|'train'|'plane'|'boat'|'holo-portal'
export type JurisdictionCode='AL'|'AK'|'AZ'|'AR'|'CA'|'CO'|'CT'|'DE'|'FL'|'GA'|'HI'|'ID'|'IL'|'IN'|'IA'|'KS'|'KY'|'LA'|'ME'|'MD'|'MA'|'MI'|'MN'|'MS'|'MO'|'MT'|'NE'|'NV'|'NH'|'NJ'|'NM'|'NY'|'NC'|'ND'|'OH'|'OK'|'OR'|'PA'|'RI'|'SC'|'SD'|'TN'|'TX'|'UT'|'VT'|'VA'|'WA'|'WV'|'WI'|'WY'|'DC'

export interface TravelNode { id:string; name:string; jurisdiction:JurisdictionCode; kind:'city'|'airport'|'rail'|'subway'|'bus'|'port'|'portal'; modes:TravelMode[]; worldSceneId:string; accessible:boolean }
export interface TravelRoute { id:string; from:string; to:string; mode:TravelMode; durationMinutes:number; fareCredits:number; requiresAdultAccount?:boolean; teenAllowed:boolean }
export interface TeenSafetyProfile { ageBand:'under-13'|'13-15'|'16-17'|'adult'; guardianLinked:boolean; dmPolicy:'off'|'friends-only'|'guardian-approved'; voicePolicy:'off'|'friends-only'|'moderated'; locationPrecision:'hidden'|'coarse'|'full'; purchases:'blocked'|'guardian-approved'|'allowed'; matureMissions:boolean; publicDiscovery:boolean }
export interface TeenHubActivity { id:string; name:string; category:'sports'|'music'|'creator'|'education'|'esports'|'career'|'community'|'safe-social'; minAge:number; maxAge:number; requiresGuardianApproval?:boolean; competitive?:boolean }

export const jurisdictions:JurisdictionCode[]=['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC']

export const defaultTeenSafety:Record<TeenSafetyProfile['ageBand'],TeenSafetyProfile>={
  'under-13':{ageBand:'under-13',guardianLinked:true,dmPolicy:'off',voicePolicy:'off',locationPrecision:'hidden',purchases:'blocked',matureMissions:false,publicDiscovery:false},
  '13-15':{ageBand:'13-15',guardianLinked:true,dmPolicy:'friends-only',voicePolicy:'friends-only',locationPrecision:'hidden',purchases:'guardian-approved',matureMissions:false,publicDiscovery:false},
  '16-17':{ageBand:'16-17',guardianLinked:true,dmPolicy:'guardian-approved',voicePolicy:'moderated',locationPrecision:'coarse',purchases:'guardian-approved',matureMissions:false,publicDiscovery:true},
  adult:{ageBand:'adult',guardianLinked:false,dmPolicy:'guardian-approved',voicePolicy:'moderated',locationPrecision:'full',purchases:'allowed',matureMissions:true,publicDiscovery:true}
}

export const teenTakeoverActivities:TeenHubActivity[]=[
  {id:'teen-hoops',name:'Teen Takeover Hoops',category:'sports',minAge:13,maxAge:17,competitive:true},
  {id:'teen-track',name:'Teen Track & Field',category:'sports',minAge:13,maxAge:17,competitive:true},
  {id:'teen-music',name:'Teen Studio Sessions',category:'music',minAge:13,maxAge:17,requiresGuardianApproval:true},
  {id:'teen-creator',name:'Creator Challenge',category:'creator',minAge:13,maxAge:17},
  {id:'teen-esports',name:'Safe Esports League',category:'esports',minAge:13,maxAge:17,competitive:true},
  {id:'teen-coding',name:'Game & Coding Lab',category:'education',minAge:13,maxAge:17},
  {id:'teen-career',name:'Future Career Lab',category:'career',minAge:15,maxAge:17},
  {id:'teen-community',name:'Community Quest',category:'community',minAge:13,maxAge:17},
  {id:'teen-social',name:'Guardian-Safe Hangout',category:'safe-social',minAge:13,maxAge:17,requiresGuardianApproval:true}
]

export function teenCanAccess(profile:TeenSafetyProfile,activity:TeenHubActivity,age:number){
  if(age<activity.minAge||age>activity.maxAge) return false
  if(profile.ageBand==='adult') return false
  if(activity.requiresGuardianApproval&&!profile.guardianLinked) return false
  return true
}

export function canUseRoute(route:TravelRoute,profile:TeenSafetyProfile){
  if(profile.ageBand==='adult') return true
  if(!route.teenAllowed) return false
  if(route.requiresAdultAccount&&!profile.guardianLinked) return false
  return true
}

export function portalTransition(sceneFrom:string,sceneTo:string){
  return {
    phases:['save-player-state','fade-to-holo','stream-destination','restore-player-state','rebuild-npc-context','resume-world'] as const,
    from:sceneFrom,to:sceneTo,
    visual:'quantum-corridor',
    physicalTeleport:false
  }
}

export const seedTravelNodes:TravelNode[]=[
  {id:'chi-core',name:'Chicago Core',jurisdiction:'IL',kind:'city',modes:['car','bus','subway','train','plane','holo-portal'],worldSceneId:'streetverse-chicago',accessible:true},
  {id:'det-core',name:'Detroit Core',jurisdiction:'MI',kind:'city',modes:['car','bus','train','plane','holo-portal'],worldSceneId:'streetverse-detroit',accessible:true},
  {id:'nyc-core',name:'New York Core',jurisdiction:'NY',kind:'city',modes:['car','bus','subway','train','plane','boat','holo-portal'],worldSceneId:'streetverse-nyc',accessible:true},
  {id:'la-core',name:'Los Angeles Core',jurisdiction:'CA',kind:'city',modes:['car','bus','train','plane','holo-portal'],worldSceneId:'streetverse-la',accessible:true},
  {id:'dc-core',name:'Washington D.C. Core',jurisdiction:'DC',kind:'city',modes:['car','bus','subway','train','plane','holo-portal'],worldSceneId:'streetverse-dc',accessible:true}
]

export function buildJurisdictionPortalNodes():TravelNode[]{
  return jurisdictions.map(code=>({id:`portal-${code.toLowerCase()}`,name:`${code} Portal Hub`,jurisdiction:code,kind:'portal',modes:['holo-portal'],worldSceneId:`streetverse-${code.toLowerCase()}-hub`,accessible:true}))
}

export function buildNationalPortalRoutes(nodes:TravelNode[]):TravelRoute[]{
  const portals=nodes.filter(n=>n.kind==='portal')
  const routes:TravelRoute[]=[]
  for(let i=0;i<portals.length;i++) for(let j=i+1;j<portals.length;j++){
    routes.push({id:`${portals[i].id}-${portals[j].id}`,from:portals[i].id,to:portals[j].id,mode:'holo-portal',durationMinutes:1,fareCredits:0,teenAllowed:true})
    routes.push({id:`${portals[j].id}-${portals[i].id}`,from:portals[j].id,to:portals[i].id,mode:'holo-portal',durationMinutes:1,fareCredits:0,teenAllowed:true})
  }
  return routes
}
