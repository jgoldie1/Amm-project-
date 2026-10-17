export type StarPath='music'|'film'|'live-host'|'gaming'|'sports'|'fashion'|'comedy'|'education'|'news'|'creator';
export type StarChallenge={id:string;path:StarPath;title:string;mode:'solo'|'collab'|'live'|'mixed-reality';proof:string[];rewards:string[]};
export const STARVERSE_NEXT_LEVEL={
 id:'starverse',label:'StarVerse — Anyone Can Be A Star',
 promise:'turn talent into a playable career with persistent audience, skills, credits and earnings',
 systems:[
  'AI talent coach and audition builder','virtual stages and studios','LIVE/PK/reels/long-form premieres',
  'mixed-reality reach-in interaction layer','gesture/hand interaction adapters','spatial stage portals',
  'holographic audience and gifting','cross-verse performances','creator quests and skill progression',
  'casting and collaboration graph','fan clubs and agency/family groups','sponsor and brand mission hooks',
  'creator storefront and ticketing hooks','portable Star Passport','accessibility-first performance controls'
 ],
 paths:['music','film','live-host','gaming','sports','fashion','comedy','education','news','creator'] as StarPath[],
 progression:['discover','practice','audition','collaborate','perform','publish','grow audience','monetize','headline','mentor','own a studio/label/channel'],
 mixedReality:{
  inputs:['hand tracking','controller','touch','voice','gaze/accessible switch adapters'],
  interactions:['reach into scene','grab approved virtual props','point/select','conduct/direct performers','open portals','place holographic set pieces'],
  safety:['interaction boundary','comfort mode','seated mode','one-hand mode','reduced motion','no physical-force claims']
 },
 aiCareerLoop:['profile talent','recommend challenge','coach rehearsal','stage performance','capture reel','translate/localize','distribute to connected channels','measure response','recommend next opportunity'],
 economy:['gifts/tips','tickets','subscriptions','sponsorships','digital goods','creator commerce','licensed collaborations','challenge reward pools','studio/agency services'],
 integrity:['server-authoritative earnings','age/rating gates','anti-bot/fraud checks','rights/provenance record','human appeal path']
} as const;

export const STARVERSE_CHALLENGES:StarChallenge[]=[
 {id:'holo-stage-debut',path:'live-host',title:'Holo Stage Debut',mode:'mixed-reality',proof:['complete rehearsal','perform live set','capture highlight reel'],rewards:['XP','audience discovery boost','eligible tips/gifts']},
 {id:'global-collab',path:'music',title:'Global Collaboration Session',mode:'collab',proof:['join approved session','publish original collaboration'],rewards:['credits','revenue split record','cross-region discovery']},
 {id:'director-room',path:'film',title:'Director Room',mode:'mixed-reality',proof:['block scene','direct AI/NPC cast','publish scene'],rewards:['film XP','portfolio credit']},
 {id:'creator-arena',path:'gaming',title:'Creator Arena',mode:'live',proof:['host playable challenge','complete audience interaction goal'],rewards:['host XP','sponsor eligibility']}
];
