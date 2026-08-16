export type ChinaHub={id:string;name:string;kind:'municipality'|'city'|'region-hub'|'sar-hub';themes:string[];sports:string[];travel:string[];missionTags:string[]}

export const chinaLivingWorld={
 id:'china-living-world',name:'China Living World',region:'East Asia',
 localization:{primary:'zh-Hans',fallback:'en',spoken:['Mandarin/Putonghua'],script:'Simplified Chinese',regionalLanguageHooks:true},
 engines:['unreal','unity','godot','web-holo'],
 systems:['Copy Smart NPC','Dynamic Mission Director','Teen Takeover','SportsOS','CreatorOS','BusinessOS','OmniPlayer','HoloGPT','Stubbs AI','Quantum Beat','Holographic Overlay','Lottie 2.0','accessibility','translation','cloud-save','multiplayer'],
 hubs:[
  {id:'beijing',name:'Beijing',kind:'municipality',themes:['historic-core','modern-capital','universities','parks','arts'],sports:['basketball','football','winter-sports','table-tennis'],travel:['subway','rail','high-speed-rail','bus','car','plane','holo-portal'],missionTags:['history','creator','sports','education','mystery']},
  {id:'shanghai',name:'Shanghai',kind:'municipality',themes:['skyline','waterfront','finance','fashion','night-city'],sports:['basketball','football','esports','racing'],travel:['subway','rail','high-speed-rail','bus','car','plane','boat','holo-portal'],missionTags:['business','fashion','music','racing','creator']},
  {id:'shenzhen',name:'Shenzhen',kind:'city',themes:['technology','hardware','design','startups','coast'],sports:['basketball','football','esports'],travel:['metro','rail','high-speed-rail','bus','car','plane','ferry','holo-portal'],missionTags:['technology','robotics','creator','business','holo']},
  {id:'guangzhou',name:'Guangzhou',kind:'city',themes:['commerce','river','food','sports','creator'],sports:['basketball','football','badminton'],travel:['metro','rail','high-speed-rail','bus','car','plane','boat','holo-portal'],missionTags:['marketplace','food','sports','music']},
  {id:'chengdu',name:'Chengdu',kind:'city',themes:['parks','food','music','technology','mountain-gateway'],sports:['basketball','football','esports'],travel:['metro','rail','high-speed-rail','bus','car','plane','holo-portal'],missionTags:['creator','food','exploration','technology']},
  {id:'chongqing',name:'Chongqing',kind:'municipality',themes:['vertical-city','rivers','bridges','night-city','mountains'],sports:['basketball','football','racing'],travel:['metro','rail','high-speed-rail','bus','car','plane','river','holo-portal'],missionTags:['driving','exploration','mystery','creator']},
  {id:'xian',name:"Xi'an",kind:'city',themes:['historic-city','archaeology','universities','technology'],sports:['basketball','football','track'],travel:['metro','rail','high-speed-rail','bus','car','plane','holo-portal'],missionTags:['history','archaeology','education','secret']},
  {id:'hangzhou',name:'Hangzhou',kind:'city',themes:['lake','technology','commerce','creator'],sports:['basketball','football','esports'],travel:['metro','rail','high-speed-rail','bus','car','plane','boat','holo-portal'],missionTags:['technology','business','creator','exploration']},
  {id:'harbin',name:'Harbin',kind:'city',themes:['winter-city','ice','architecture','northeast'],sports:['ice-hockey','winter-sports','basketball'],travel:['metro','rail','high-speed-rail','bus','car','plane','holo-portal'],missionTags:['winter','sports','festival','exploration']},
  {id:'hainan',name:'Hainan Hub',kind:'region-hub',themes:['tropical-island','beaches','marine','resorts'],sports:['volleyball','football','water-sports','racing'],travel:['rail','bus','car','plane','boat','holo-portal'],missionTags:['marine','rescue','sports','travel']},
  {id:'hong-kong',name:'Hong Kong Hub',kind:'sar-hub',themes:['harbor','vertical-city','film','finance','creator'],sports:['football','basketball','racing'],travel:['metro','rail','bus','car','plane','ferry','holo-portal'],missionTags:['film','business','creator','travel']},
  {id:'macao',name:'Macao Hub',kind:'sar-hub',themes:['historic-center','events','hospitality','motorsport'],sports:['racing','basketball','football'],travel:['bus','car','ferry','plane','holo-portal'],missionTags:['events','hospitality','racing','history']}
 ] as ChinaHub[],
 campaigns:[
  {id:'china-rail-quest',name:'China Rail Quest',loop:['city-discovery','high-speed-rail','regional-mission','secret-clue','next-hub']},
  {id:'east-asia-champions',name:'East Asia Champions Circuit',loop:['qualify','travel','tournament','creator-event','finals']},
  {id:'future-city-lab',name:'Future City Lab',loop:['design','prototype','test','community-score','upgrade']},
  {id:'silk-road-mysteries',name:'Silk Road Mysteries',loop:['rumor','explore','puzzle','archive','unlock']}
 ],
 worldRules:{preservePlayerState:true,realMoneyFastTravelAdvantage:false,teenSafeRouting:true,regionalContentReview:true,offlineFallback:true}
} as const

export function getChinaHub(id:string){return chinaLivingWorld.hubs.find(h=>h.id===id)}
