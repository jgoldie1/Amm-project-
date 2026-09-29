import { MEET_THE_STUBBS_FAMILY_FRIENDS } from '../game/characters/meetTheStubbsFamilyFriends'

const KEY='tryamm.streetverse.playable-character.v1'
let installed=false

export type StreetVersePlayableCharacter={id:string;label:string;index:number;role:string;missionLane?:string}

const RESIDENT_ROLES=[
  ['RAPPER','Chicago Rap / Open Mic'],['SINGER','Chicago Singer / Live Stage'],['ARTIST','Visual Artist / Mural'],['PRODUCER','Music Producer / Studio'],
  ['DJ','DJ / Holo LIVE'],['DANCER','Dance / Performance'],['CREATOR','Reels Creator'],['FILMMAKER','Film / Video'],
  ['ATHLETE','Sports / Training'],['COACH','Coach / Mentor'],['BUILDER','Builder / Restoration'],['ENTREPRENEUR','Business / Marketplace'],
  ['CHEF','Food / Delivery'],['DRIVER','Transit / Delivery'],['SECURITY','Event Safety'],['TECH','AI / Technology'],
  ['CYBER','Cyber Safety'],['REPORTER','Chicago News'],['HOST','TV / Podcast'],['DESIGNER','Fashion / Design'],
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
  'Film / Video':{id:'city-soundtrack',title:'City Soundtrack',rewardXP:375},
  'Business / Marketplace':{id:'world-builder',title:'Build the Block',rewardXP:500},
  'Event Safety':{id:'safe-event-command',title:'Safe Event Command',rewardXP:600},
  'AI / Technology':{id:'mib-space-tech-lab',title:'MIB: Space Age Technology Lab',rewardXP:900},
  'Cyber Safety':{id:'cyber-safety-relay',title:'Cyber Safety Relay',rewardXP:575},
  'Chicago News':{id:'community-story',title:'Tell Our Story',rewardXP:325},
  'TV / Podcast':{id:'community-story',title:'Tell Our Story',rewardXP:325},
  'Chicago Explorer':{id:'chi-history-sound-map',title:'Sounds Born in Chicago',rewardXP:350}
}
const FEATURED_PLAYABLE:StreetVersePlayableCharacter[]=[
  {id:'you',label:'YOU',index:-1,role:'Founder / Explorer',missionLane:'Founder'},
  {id:'marcus',label:'MARCUS',index:-2,role:'StreetVerse Protagonist',missionLane:'Chicago Explorer'},
  {id:'nikki-frances',label:'NIKKI FRANCES',index:-3,role:'Creator / Family Friend',missionLane:'Reels Creator'},
  {id:'tae-monroe',label:'TAE MONROE',index:-4,role:'Creator / Family Friend',missionLane:'Reels Creator'},
]
const FAMILY_PLAYABLE:StreetVersePlayableCharacter[]=MEET_THE_STUBBS_FAMILY_FRIENDS.map((person,i)=>({
  id:person.id,label:person.displayName.toUpperCase(),index:-10-i,
  role:person.roles.filter(r=>r!=='StreetVerse').join(' / ')||'Meet the Stubbs',
  missionLane:person.id==='bj-stubbs'?'Founder':'Chicago Explorer'
}))
const ROSTER:StreetVersePlayableCharacter[]=[
  ...FEATURED_PLAYABLE,
  ...FAMILY_PLAYABLE,
  ...RESIDENT_ROLES.map(([role,missionLane],i)=>({id:`resident-${i+1}`,label:`RESIDENT ${String(i+1).padStart(2,'0')}`,index:i,role,missionLane}))
]

function emit(name:string,detail:any={}){window.dispatchEvent(new CustomEvent(name,{detail}))}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
function save(character:StreetVersePlayableCharacter){try{localStorage.setItem(KEY,JSON.stringify({character,updatedAt:new Date().toISOString()}))}catch{}}
function missionFor(character:StreetVersePlayableCharacter){return LANE_MISSIONS[character.missionLane||'']||{id:'neighborhood-help',title:'Neighborhood Help',rewardXP:275}}

function mount(){
  if(document.getElementById('tryamm-playable-character-switcher'))return
  const root=document.createElement('div');root.id='tryamm-playable-character-switcher';root.setAttribute('aria-label','StreetVerse playable character switcher')
  Object.assign(root.style,{position:'fixed',right:'12px',top:'86px',zIndex:'2147482400',display:'none',fontFamily:'Inter,system-ui,sans-serif'})
  const button=document.createElement('button');button.type='button';button.textContent='👥 CHARACTERS';Object.assign(button.style,{border:'1px solid #59e7ff88',borderRadius:'999px',padding:'10px 13px',background:'#07131dee',color:'#fff',fontWeight:'900',fontSize:'11px',cursor:'pointer',boxShadow:'0 8px 26px #0008'})
  const panel=document.createElement('div');Object.assign(panel.style,{display:'none',marginTop:'7px',width:'min(86vw,320px)',maxHeight:'62vh',overflowY:'auto',padding:'10px',border:'1px solid #31536a',borderRadius:'16px',background:'#050b13f4',boxShadow:'0 18px 55px #000b'})
  const title=document.createElement('div');title.textContent='PLAYABLE STREETVERSE ROSTER';Object.assign(title.style,{fontSize:'10px',color:'#59e7ff',fontWeight:'950',letterSpacing:'1.5px',padding:'4px 5px 9px'});panel.appendChild(title)
  const grid=document.createElement('div');Object.assign(grid.style,{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:'6px'})
  ROSTER.forEach(character=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<strong>${character.label}</strong><br><span style="opacity:.7;font-size:9px">${character.role}</span>`;Object.assign(b.style,{textAlign:'left',padding:'10px',border:'1px solid #23394b',borderRadius:'11px',background:'#0b1520',color:'#fff',cursor:'pointer',minHeight:'55px'});b.addEventListener('click',()=>{save(character);const mission=missionFor(character);emit('tryamm:streetverse-character-select',{...character,source:'roster',mission});emit('tryamm:streetverse-mission-selected',{characterId:character.id,missionLane:character.missionLane,mission});emit('tryamm:accessibility-announce',{text:`Now playing as ${character.label}. Mission: ${mission.title}.`});panel.style.display='none';button.textContent=`👥 ${character.label}`});grid.appendChild(b)});panel.appendChild(grid)
  button.addEventListener('click',()=>panel.style.display=panel.style.display==='none'?'block':'none')
  root.append(button,panel);document.body.appendChild(root)

  const sync=()=>{const inStreetVerse=location.pathname.startsWith('/streetverse');root.style.display=inStreetVerse?'block':'none'};sync();setInterval(sync,1200)
  const current=read()?.character as StreetVersePlayableCharacter|undefined;if(current?.label)button.textContent=`👥 ${current.label}`
}

export function installStreetVersePlayableCharactersRuntime(){
  if(installed||typeof window==='undefined'||typeof document==='undefined')return;installed=true
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount()
  queueMicrotask(()=>emit('tryamm:streetverse-playable-roster-ready',{count:ROSTER.length,characters:ROSTER}))
}
