export type CaribbeanStatus='sovereign'|'us-territory'|'uk-overseas-territory'|'french-overseas'|'dutch-country'|'dutch-special-municipality'|'other-territory'
export type CaribbeanTravel='plane'|'boat'|'ferry'|'car'|'bus'|'walk'|'bike'|'holo-portal'

export interface CaribbeanWorldHub {
  id:string
  name:string
  status:CaribbeanStatus
  parent?:string
  capitalOrHub:string
  languages:string[]
  travel:CaribbeanTravel[]
  sceneId:string
  teenTakeover:boolean
  sports:string[]
  creator:string[]
  environments:string[]
  missionTags:string[]
}

const commonTravel:CaribbeanTravel[]=['plane','boat','ferry','holo-portal']

export const caribbeanWorlds:CaribbeanWorldHub[]=[
  {id:'ag',name:'Antigua and Barbuda',status:'sovereign',capitalOrHub:"St. John's",languages:['English'],travel:commonTravel,sceneId:'caribbean-antigua-barbuda',teenTakeover:true,sports:['cricket','football','basketball','track'],creator:['music','dance','festival','film'],environments:['beaches','harbors','historic-town','islands'],missionTags:['tourism','sports','creator','marine','community']},
  {id:'bs',name:'The Bahamas',status:'sovereign',capitalOrHub:'Nassau',languages:['English'],travel:commonTravel,sceneId:'caribbean-bahamas',teenTakeover:true,sports:['basketball','track','football','sailing'],creator:['music','Junkanoo-inspired-original-festival','film','fashion'],environments:['cays','beaches','marinas','city'],missionTags:['island-hopping','marine','sports','creator','business']},
  {id:'bb',name:'Barbados',status:'sovereign',capitalOrHub:'Bridgetown',languages:['English'],travel:commonTravel,sceneId:'caribbean-barbados',teenTakeover:true,sports:['cricket','football','track','surfing'],creator:['music','festival','fashion','film'],environments:['coast','city','hills','historic'],missionTags:['sports','creator','tourism','business','community']},
  {id:'cu',name:'Cuba',status:'sovereign',capitalOrHub:'Havana',languages:['Spanish'],travel:['plane','boat','holo-portal'],sceneId:'caribbean-cuba',teenTakeover:true,sports:['baseball','boxing','basketball','track'],creator:['music','dance','film','visual-art'],environments:['historic-city','coast','mountains','farmland'],missionTags:['sports','music','history','community','exploration']},
  {id:'dm',name:'Dominica',status:'sovereign',capitalOrHub:'Roseau',languages:['English','Dominican Creole French'],travel:commonTravel,sceneId:'caribbean-dominica',teenTakeover:true,sports:['cricket','football','basketball','track'],creator:['music','festival','nature-film'],environments:['rainforest','waterfalls','mountains','coast'],missionTags:['eco','rescue','exploration','creator','community']},
  {id:'do',name:'Dominican Republic',status:'sovereign',capitalOrHub:'Santo Domingo',languages:['Spanish'],travel:['plane','boat','car','bus','holo-portal'],sceneId:'caribbean-dominican-republic',teenTakeover:true,sports:['baseball','basketball','boxing','volleyball'],creator:['music','dance','film','fashion'],environments:['city','beaches','mountains','historic'],missionTags:['baseball','creator','business','racing','community']},
  {id:'gd',name:'Grenada',status:'sovereign',capitalOrHub:"St. George's",languages:['English'],travel:commonTravel,sceneId:'caribbean-grenada',teenTakeover:true,sports:['cricket','football','track','swimming'],creator:['music','festival','food'],environments:['coast','hills','rainforest','harbor'],missionTags:['food','eco','creator','marine','community']},
  {id:'ht',name:'Haiti',status:'sovereign',capitalOrHub:'Port-au-Prince',languages:['Haitian Creole','French'],travel:['plane','boat','bus','holo-portal'],sceneId:'caribbean-haiti',teenTakeover:true,sports:['football','basketball','track'],creator:['music','art','fashion','film'],environments:['city','coast','mountains','rural'],missionTags:['community','creator','sports','resilience','education']},
  {id:'jm',name:'Jamaica',status:'sovereign',capitalOrHub:'Kingston',languages:['English','Jamaican Patois'],travel:['plane','boat','car','bus','holo-portal'],sceneId:'caribbean-jamaica',teenTakeover:true,sports:['track','football','cricket','basketball'],creator:['music','dance','film','fashion'],environments:['city','beaches','mountains','coast'],missionTags:['music','track','creator','business','community']},
  {id:'kn',name:'Saint Kitts and Nevis',status:'sovereign',capitalOrHub:'Basseterre',languages:['English'],travel:commonTravel,sceneId:'caribbean-st-kitts-nevis',teenTakeover:true,sports:['cricket','football','track'],creator:['music','festival','food'],environments:['islands','beaches','volcanic-hills','historic'],missionTags:['island-hopping','sports','creator','tourism']},
  {id:'lc',name:'Saint Lucia',status:'sovereign',capitalOrHub:'Castries',languages:['English','Saint Lucian Creole French'],travel:commonTravel,sceneId:'caribbean-st-lucia',teenTakeover:true,sports:['cricket','football','track','sailing'],creator:['music','festival','food'],environments:['pitons-inspired-original-mountains','rainforest','coast','city'],missionTags:['eco','creator','sports','marine']},
  {id:'vc',name:'Saint Vincent and the Grenadines',status:'sovereign',capitalOrHub:'Kingstown',languages:['English'],travel:commonTravel,sceneId:'caribbean-st-vincent-grenadines',teenTakeover:true,sports:['cricket','football','basketball','sailing'],creator:['music','festival','film'],environments:['island-chain','beaches','volcanic-terrain','harbors'],missionTags:['island-hopping','marine','sports','creator']},
  {id:'tt',name:'Trinidad and Tobago',status:'sovereign',capitalOrHub:'Port of Spain',languages:['English'],travel:['plane','boat','car','bus','holo-portal'],sceneId:'caribbean-trinidad-tobago',teenTakeover:true,sports:['cricket','football','track','basketball'],creator:['music','carnival-inspired-original-festival','film','fashion'],environments:['city','coast','rainforest','industrial'],missionTags:['music','festival','sports','energy','business']},

  {id:'pr',name:'Puerto Rico',status:'us-territory',parent:'United States',capitalOrHub:'San Juan',languages:['Spanish','English'],travel:['plane','boat','car','bus','holo-portal'],sceneId:'caribbean-puerto-rico',teenTakeover:true,sports:['baseball','basketball','boxing','volleyball','track'],creator:['music','dance','film','food','fashion'],environments:['historic-city','rainforest','coast','mountains'],missionTags:['sports','creator','business','racing','community']},
  {id:'vi',name:'U.S. Virgin Islands',status:'us-territory',parent:'United States',capitalOrHub:'Charlotte Amalie',languages:['English'],travel:commonTravel,sceneId:'caribbean-us-virgin-islands',teenTakeover:true,sports:['basketball','baseball','sailing','track'],creator:['music','festival','food'],environments:['islands','beaches','harbors','historic'],missionTags:['marine','sports','creator','tourism']},

  {id:'ai',name:'Anguilla',status:'uk-overseas-territory',parent:'United Kingdom',capitalOrHub:'The Valley',languages:['English'],travel:commonTravel,sceneId:'caribbean-anguilla',teenTakeover:true,sports:['football','cricket','sailing'],creator:['music','festival','food'],environments:['beaches','island','harbors'],missionTags:['marine','creator','sports']},
  {id:'vg',name:'British Virgin Islands',status:'uk-overseas-territory',parent:'United Kingdom',capitalOrHub:'Road Town',languages:['English'],travel:commonTravel,sceneId:'caribbean-bvi',teenTakeover:true,sports:['sailing','basketball','football'],creator:['music','festival','food'],environments:['islands','marinas','beaches','hills'],missionTags:['sailing','island-hopping','creator','business']},
  {id:'ky',name:'Cayman Islands',status:'uk-overseas-territory',parent:'United Kingdom',capitalOrHub:'George Town',languages:['English'],travel:commonTravel,sceneId:'caribbean-cayman',teenTakeover:true,sports:['football','swimming','basketball','sailing'],creator:['music','food','film'],environments:['coast','city','reefs','islands'],missionTags:['marine','finance-fiction','sports','creator']},
  {id:'ms',name:'Montserrat',status:'uk-overseas-territory',parent:'United Kingdom',capitalOrHub:'Brades',languages:['English'],travel:['plane','boat','holo-portal'],sceneId:'caribbean-montserrat',teenTakeover:true,sports:['cricket','football','track'],creator:['music','history','film'],environments:['volcanic-terrain','coast','hills'],missionTags:['volcano','rescue','exploration','creator']},
  {id:'tc',name:'Turks and Caicos Islands',status:'uk-overseas-territory',parent:'United Kingdom',capitalOrHub:'Cockburn Town',languages:['English'],travel:commonTravel,sceneId:'caribbean-turks-caicos',teenTakeover:true,sports:['football','basketball','sailing'],creator:['music','food','film'],environments:['cays','beaches','reefs','harbors'],missionTags:['marine','tourism','sports','creator']},

  {id:'gp',name:'Guadeloupe',status:'french-overseas',parent:'France',capitalOrHub:'Basse-Terre',languages:['French','Guadeloupean Creole'],travel:commonTravel,sceneId:'caribbean-guadeloupe',teenTakeover:true,sports:['football','basketball','cycling','sailing'],creator:['music','dance','food','film'],environments:['rainforest','volcanic-terrain','beaches','city'],missionTags:['cycling','eco','creator','marine']},
  {id:'mq',name:'Martinique',status:'french-overseas',parent:'France',capitalOrHub:'Fort-de-France',languages:['French','Martinican Creole'],travel:commonTravel,sceneId:'caribbean-martinique',teenTakeover:true,sports:['football','basketball','sailing','cycling'],creator:['music','dance','food','film'],environments:['city','rainforest','coast','mountains'],missionTags:['creator','eco','sports','marine']},
  {id:'bl',name:'Saint Barthélemy',status:'french-overseas',parent:'France',capitalOrHub:'Gustavia',languages:['French'],travel:commonTravel,sceneId:'caribbean-st-barthelemy',teenTakeover:true,sports:['sailing','football','water-sports'],creator:['fashion','food','music'],environments:['island','marina','beaches','hills'],missionTags:['marine','fashion','creator','tourism']},
  {id:'mf',name:'Saint Martin',status:'french-overseas',parent:'France',capitalOrHub:'Marigot',languages:['French','English'],travel:commonTravel,sceneId:'caribbean-saint-martin',teenTakeover:true,sports:['football','basketball','sailing'],creator:['music','food','fashion'],environments:['shared-island','beaches','city','harbor'],missionTags:['cross-border','creator','sports','marine']},

  {id:'aw',name:'Aruba',status:'dutch-country',parent:'Kingdom of the Netherlands',capitalOrHub:'Oranjestad',languages:['Dutch','Papiamento','English','Spanish'],travel:commonTravel,sceneId:'caribbean-aruba',teenTakeover:true,sports:['football','baseball','sailing'],creator:['music','dance','food','film'],environments:['desert-island','beaches','city','coast'],missionTags:['racing','marine','creator','sports']},
  {id:'cw',name:'Curaçao',status:'dutch-country',parent:'Kingdom of the Netherlands',capitalOrHub:'Willemstad',languages:['Dutch','Papiamento','English'],travel:commonTravel,sceneId:'caribbean-curacao',teenTakeover:true,sports:['football','baseball','sailing'],creator:['music','art','food','film'],environments:['colorful-city-inspired-original','coast','desert','harbor'],missionTags:['creator','marine','sports','business']},
  {id:'sx',name:'Sint Maarten',status:'dutch-country',parent:'Kingdom of the Netherlands',capitalOrHub:'Philipsburg',languages:['Dutch','English'],travel:commonTravel,sceneId:'caribbean-sint-maarten',teenTakeover:true,sports:['football','basketball','sailing'],creator:['music','food','festival'],environments:['shared-island','beaches','city','harbor'],missionTags:['cross-border','creator','sports','marine']},
  {id:'bq-bo',name:'Bonaire',status:'dutch-special-municipality',parent:'Netherlands',capitalOrHub:'Kralendijk',languages:['Dutch','Papiamento'],travel:commonTravel,sceneId:'caribbean-bonaire',teenTakeover:true,sports:['diving','sailing','football'],creator:['music','food','nature-film'],environments:['reefs','desert-island','coast'],missionTags:['marine','eco','exploration']},
  {id:'bq-sa',name:'Saba',status:'dutch-special-municipality',parent:'Netherlands',capitalOrHub:'The Bottom',languages:['Dutch','English'],travel:['plane','boat','holo-portal'],sceneId:'caribbean-saba',teenTakeover:true,sports:['hiking','football','diving'],creator:['music','nature-film'],environments:['mountain-island','coast','reef'],missionTags:['hiking','eco','marine','exploration']},
  {id:'bq-se',name:'Sint Eustatius',status:'dutch-special-municipality',parent:'Netherlands',capitalOrHub:'Oranjestad',languages:['Dutch','English'],travel:['plane','boat','holo-portal'],sceneId:'caribbean-sint-eustatius',teenTakeover:true,sports:['football','diving','hiking'],creator:['music','history','nature-film'],environments:['volcanic-island','coast','historic'],missionTags:['history','eco','marine','exploration']}
]

export const caribbeanPortalNetwork={
  hubId:'caribbean-portal-nexus',
  preserves:['player-id','avatar','inventory','wallet-entitlements','xp','missions','npc-relationships','accessibility','language','teen-safety-profile'],
  transportModes:['plane','boat','ferry','regional-road','holo-portal'],
  rules:{respectLocalLanguage:true,localizationRequired:true,culturalReviewRequired:true,realWorldClaimsVerified:true,noTrademarkCopying:true}
}

export function getCaribbeanWorld(id:string){ return caribbeanWorlds.find(w=>w.id===id) }
export function worldsByStatus(status:CaribbeanStatus){ return caribbeanWorlds.filter(w=>w.status===status) }
export function teenCaribbeanWorlds(){ return caribbeanWorlds.filter(w=>w.teenTakeover) }
