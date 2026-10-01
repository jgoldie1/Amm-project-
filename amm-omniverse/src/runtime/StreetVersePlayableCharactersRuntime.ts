import {STREETVERSE_FAMILY_CHARACTER_PRODUCTION} from '../data/StreetVerseFamilyCharacterProduction'
const KEY='tryamm.streetverse.playable-character.v1'
let installed=false

export type StreetVersePlayableCharacter={id:string;label:string;index:number;role:string;missionLane?:string;presentation?:'male'|'female'|'neutral'|'pending';assetId?:string;visualStatus?:'published-rig'|'body-base'|'fallback'}
export type CreatorRolePreset={id:string;label:string;missionLane:string}

const CREATOR_ASSIGNMENTS_KEY='tryamm.streetverse.creator-cast.assignments.v1'
export const CREATOR_ROLE_PRESETS:CreatorRolePreset[]=[
  {id:'rapper',label:'Rapper',missionLane:'Chicago Rap / Open Mic'},
  {id:'singer',label:'Singer',missionLane:'Chicago Singer / Live Stage'},
  {id:'producer',label:'Music Producer',missionLane:'Music Producer / Studio'},
  {id:'dj',label:'DJ',missionLane:'DJ / Holo LIVE'},
  {id:'dancer',label:'Dancer',missionLane:'Dance / Performance'},
  {id:'streamer',label:'BIGO/TikTok Streamer',missionLane:'Live Stream Creator'},
  {id:'actor',label:'Actor',missionLane:'Acting / Holo Drama'},
  {id:'filmmaker',label:'Filmmaker',missionLane:'Film / Video'},
  {id:'fashion',label:'Fashion Designer',missionLane:'Fashion / Design'},
  {id:'beauty',label:'Beauty Creator',missionLane:'Beauty / Style'},
  {id:'entrepreneur',label:'Entrepreneur',missionLane:'Business / Marketplace'},
  {id:'host',label:'TV / Podcast Host',missionLane:'TV / Podcast'},
]

const RESIDENT_ROLES=[
  ['RAPPER','Chicago Rap / Open Mic'],['SINGER','Chicago Singer / Live Stage'],['ARTIST','Visual Artist / Mural'],['PRODUCER','Music Producer / Studio'],
  ['DJ','DJ / Holo LIVE'],['DANCER','Dance / Performance'],['CREATOR','Reels Creator'],['STREAMER','Live Stream Creator'],['ACTOR','Acting / Holo Drama'],['FILMMAKER','Film / Video'],
  ['ATHLETE','Sports / Training'],['COACH','Coach / Mentor'],['BUILDER','Builder / Restoration'],['ENTREPRENEUR','Business / Marketplace'],
  ['CHEF','Food / Delivery'],['DRIVER','Transit / Delivery'],['SECURITY','Event Safety'],['TECH','AI / Technology'],
  ['CYBER','Cyber Safety'],['REPORTER','Chicago News'],['HOST','TV / Podcast'],['DESIGNER','Fashion / Design'],['BEAUTY','Beauty / Style'],
  ['MERCHANT','Retail / Marketplace'],['SCOUT','Business Scout'],['MENTOR','Youth / Community'],['EXPLORER','Chicago Explorer']
] as const
const LANE_MISSIONS:Record<string,{id:string;title:string;rewardXP:number}>={
  'Founder':{id:'world-builder',title:'Build the Block',rewardXP:500},
  'Chicago Rap / Open Mic':{id:'chi-open-mic-qualifier',title:'Chicago Open Mic Qualifier',rewardXP:300},
  'Chicago Singer / Live Stage':{id:'chi-open-mic-qualifier',title:'Chicago Open Mic Qualifier',rewardXP:300},
  'Music Producer / Studio':{id:'chi-studio-session',title:'Studio to StreetVerse',rewardXP:500},
  'DJ / Holo LIVE':{id:'chi-city-cypher',title:'Chicago City Cypher',rewardXP:650},
  'Dance / Performance':{id:'chi-city-cypher',title:'Chicago City Cypher',rewardXP:650},
  'Reels Creator':{id:'city-soundtrack',title:'City Soundtrack',rewardXP:375},
  'Live Stream Creator':{id:'creator-live-street-session',title:'Go Live in StreetVerse',rewardXP:425},
  'Acting / Holo Drama':{id:'holo-drama-scene',title:'Shoot a Holo Drama Scene',rewardXP:450},
  'Film / Video':{id:'city-soundtrack',title:'City Soundtrack',rewardXP:375},
  'Fashion / Design':{id:'street-style-showcase',title:'Street Style Showcase',rewardXP:400},
  'Beauty / Style':{id:'beauty-creator-showcase',title:'Beauty Creator Showcase',rewardXP:400},
  'Business / Marketplace':{id:'world-builder',title:'Build the Block',rewardXP:500},
  'Event Safety':{id:'safe-event-command',title:'Safe Event Command',rewardXP:600},
  'AI / Technology':{id:'mib-space-tech-lab',title:'MIB: Space Age Technology Lab',rewardXP:900},
  'Cyber Safety':{id:'cyber-safety-relay',title:'Cyber Safety Relay',rewardXP:575},
  'Chicago News':{id:'community-story',title:'Tell Our Story',rewardXP:325},
  'TV / Podcast':{id:'community-story',title:'Tell Our Story',rewardXP:325},
  'Chicago Explorer':{id:'chi-history-sound-map',title:'Sounds Born in Chicago',rewardXP:350}
}
const NAMED_CAST:StreetVersePlayableCharacter[]=[
  {id:'james-stubbs',label:'JAMES',index:-2,role:'Youth Explorer / Family',missionLane:'Chicago Explorer',presentation:'male',assetId:'sv-james-body-base-v1',visualStatus:'body-base'},
  {id:'bj-stubbs',label:'BJ STUBBS',index:-1,role:'Founder / Explorer',missionLane:'Founder',presentation:'male',assetId:'sv-bj-stubbs-v6',visualStatus:'published-rig'},
  {id:'marcus',label:'MARCUS',index:0,role:'StreetVerse Friend',missionLane:'Chicago Explorer'},
  {id:'al-b',label:'AL B',index:1,role:'StreetVerse Family',missionLane:'Business / Marketplace'},
  {id:'tatti',label:'TATTI',index:2,role:'Creator • role pending',missionLane:'Reels Creator'},
  {id:'brielle',label:'BRIELLE',index:3,role:'Creator • role pending',missionLane:'Reels Creator'},
  {id:'mike',label:'MIKE',index:4,role:'StreetVerse Friend • role pending',missionLane:'Chicago Explorer'},
  {id:'alphonso',label:'ALPHONSO',index:5,role:'StreetVerse Friend • role pending',missionLane:'Chicago Explorer'},
  {id:'jasmine',label:'JASMINE',index:6,role:'Creator • role pending',missionLane:'Reels Creator'},
  {id:'tae-monroe',label:'TAE MONROE',index:7,role:'Creator • role pending',missionLane:'Reels Creator'},
]
const SOCIAL_CREATOR_CAST:StreetVersePlayableCharacter[]=Array.from({length:10},(_,i)=>({
  id:`social-creator-${String(i+1).padStart(2,'0')}`,
  label:`CREATOR SLOT ${String(i+1).padStart(2,'0')}`,
  index:100+i,
  role:'BIGO/TikTok creator • identity/role pending',
  missionLane:'Reels Creator',
  presentation:'pending',
}))

const NAMED_CAST_IDS=new Set(NAMED_CAST.map(character=>character.id))
const FAMILY_FRIEND_CAST:StreetVersePlayableCharacter[]=STREETVERSE_FAMILY_CHARACTER_PRODUCTION
  .filter(character=>!NAMED_CAST_IDS.has(character.characterId))
  .map((character,index)=>({
    id:character.characterId,
    label:character.displayName.toUpperCase(),
    index:300+index,
    role:[character.relationship,...character.roles].join(' • '),
    missionLane:character.roles.some(role=>/creator|studio|tv/i.test(role))?'Reels Creator':'Chicago Explorer',
    presentation:'pending',
    assetId:character.visualSlot,
    visualStatus:character.standInUntilAuthorizedReference?'fallback':'published-rig',
  }))
const ROSTER:StreetVersePlayableCharacter[]=[
  ...NAMED_CAST,
  ...FAMILY_FRIEND_CAST,
  ...SOCIAL_CREATOR_CAST,
  ...RESIDENT_ROLES.map(([role,missionLane],i)=>({id:`resident-${i+1}`,label:`RESIDENT ${String(i+1).padStart(2,'0')}`,index:200+i,role,missionLane}))
]

function emit(name:string,detail:any={}){window.dispatchEvent(new CustomEvent(name,{detail}))}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function readCreatorAssignments():Record<string,Partial<StreetVersePlayableCharacter>>{try{return JSON.parse(localStorage.getItem(CREATOR_ASSIGNMENTS_KEY)||'{}')}catch{return {}}}
function applyCreatorAssignments(){
 const assignments=readCreatorAssignments()
 for(const character of ROSTER){const patch=assignments[character.id];if(patch)Object.assign(character,patch)}
}
function assignCreator(detail:{characterId:string;displayName?:string;role?:string;missionLane?:string;presentation?:StreetVersePlayableCharacter['presentation']}){
 const character=ROSTER.find(item=>item.id===detail.characterId);if(!character)return
 const patch:Partial<StreetVersePlayableCharacter>={}
 if(detail.displayName)patch.label=detail.displayName.toUpperCase()
 if(detail.role)patch.role=detail.role
 if(detail.missionLane)patch.missionLane=detail.missionLane
 if(detail.presentation)patch.presentation=detail.presentation
 Object.assign(character,patch)
 const assignments=readCreatorAssignments();assignments[character.id]={...(assignments[character.id]||{}),...patch}
 try{localStorage.setItem(CREATOR_ASSIGNMENTS_KEY,JSON.stringify(assignments))}catch{}
 emit('tryamm:streetverse-creator-cast-assigned',{character,mission:missionFor(character)})
 return character
}
function save(character:StreetVersePlayableCharacter){try{localStorage.setItem(KEY,JSON.stringify({character,updatedAt:new Date().toISOString()}))}catch{}}
function missionFor(character:StreetVersePlayableCharacter){return LANE_MISSIONS[character.missionLane||'']||{id:'neighborhood-help',title:'Neighborhood Help',rewardXP:275}}

function mount(){
  applyCreatorAssignments()
  if(document.getElementById('tryamm-playable-character-switcher'))return
  const root=document.createElement('div');root.id='tryamm-playable-character-switcher';root.setAttribute('aria-label','StreetVerse playable character switcher')
  Object.assign(root.style,{position:'fixed',right:'12px',top:'86px',zIndex:'2147482400',display:'none',fontFamily:'Inter,system-ui,sans-serif'})
  const button=document.createElement('button');button.type='button';button.textContent='👥 CHARACTERS';Object.assign(button.style,{border:'1px solid #59e7ff88',borderRadius:'999px',padding:'10px 13px',background:'#07131dee',color:'#fff',fontWeight:'900',fontSize:'11px',cursor:'pointer',boxShadow:'0 8px 26px #0008'})
  const panel=document.createElement('div');Object.assign(panel.style,{display:'none',marginTop:'7px',width:'min(86vw,320px)',maxHeight:'62vh',overflowY:'auto',padding:'10px',border:'1px solid #31536a',borderRadius:'16px',background:'#050b13f4',boxShadow:'0 18px 55px #000b'})
  const title=document.createElement('div');title.textContent='PLAYABLE STREETVERSE ROSTER';Object.assign(title.style,{fontSize:'10px',color:'#59e7ff',fontWeight:'950',letterSpacing:'1.5px',padding:'4px 5px 9px'});panel.appendChild(title)
  const grid=document.createElement('div');Object.assign(grid.style,{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'6px'})
  ROSTER.forEach(character=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<strong>${character.label}</strong><br><span style="opacity:.7;font-size:9px">${character.role}</span>`;Object.assign(b.style,{textAlign:'left',padding:'10px',border:'1px solid #23394b',borderRadius:'11px',background:'#0b1520',color:'#fff',cursor:'pointer',minHeight:'55px'});b.addEventListener('click',()=>{save(character);const mission=missionFor(character);emit('tryamm:streetverse-character-select',{...character,source:'roster',mission});if(character.assetId)emit('tryamm:streetverse-player-asset-select',{characterId:character.id,label:character.label,assetId:character.assetId,visualStatus:character.visualStatus,source:'roster'});emit('tryamm:streetverse-mission-selected',{characterId:character.id,missionLane:character.missionLane,mission});emit('tryamm:accessibility-announce',{text:`Now playing as ${character.label}. Mission: ${mission.title}.`});panel.style.display='none';button.textContent=`👥 ${character.label}`});grid.appendChild(b)});panel.appendChild(grid)
  button.addEventListener('click',()=>panel.style.display=panel.style.display==='none'?'block':'none')
  root.append(button,panel);document.body.appendChild(root)

  const sync=()=>{const inStreetVerse=location.pathname.startsWith('/streetverse');root.style.display=inStreetVerse?'block':'none'};sync();setInterval(sync,1200)
  const current=read()?.character as StreetVersePlayableCharacter|undefined;if(current?.label)button.textContent=`👥 ${current.label}`
}

export function installStreetVersePlayableCharactersRuntime(){
  if(installed||typeof window==='undefined'||typeof document==='undefined')return;installed=true
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount()
  window.addEventListener('tryamm:streetverse-creator-cast-assign',(event:Event)=>assignCreator((event as CustomEvent<any>).detail||{}))
  queueMicrotask(()=>emit('tryamm:streetverse-playable-roster-ready',{count:ROSTER.length,characters:ROSTER,creatorRolePresets:CREATOR_ROLE_PRESETS}))
}
