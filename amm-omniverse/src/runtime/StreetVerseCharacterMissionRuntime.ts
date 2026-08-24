export type CharacterGroup='founder'|'security'|'global-security'|'legacy-kids'|'friends'|'artists'|'community'
export type MissionType='peacekeeping'|'mentorship'|'rescue'|'creative'|'education'|'community'|'exploration'|'disaster-response'|'cyber-safety'|'event-safety'

export type StreetVerseCharacter={
  id:string
  name:string
  title:string
  group:CharacterGroup
  missionIds:string[]
}

export type StreetVerseMission={
  id:string
  title:string
  description:string
  type:MissionType
  assignedTo:string[]
  rewardXP:number
  repeatable?:boolean
  global?:boolean
  localizesToCity?:boolean
}

export const STREETVERSE_CHARACTERS:StreetVerseCharacter[]=[
  {id:'stubbs',name:'Stubbs',title:'Founder / Living World Guide',group:'founder',missionIds:['peace-network','mentor-next','world-builder']},
  {id:'al-b',name:'Al B',title:'Security Guardian / Global Commander',group:'security',missionIds:['guardian-watch','safe-passage','conflict-cooldown','global-guardian-network','peace-corridor','missing-person-support','disaster-relief','safe-event-command','anti-trafficking-awareness','cyber-safety-relay']},
  {id:'global-security-force',name:'Global Security Force',title:'Al B Guardian Network',group:'global-security',missionIds:['global-guardian-network','peace-corridor','missing-person-support','disaster-relief','safe-event-command','anti-trafficking-awareness','cyber-safety-relay']},
  {id:'legacy-kids',name:'Legacy Kids',title:'Next Generation Crew',group:'legacy-kids',missionIds:['safe-route','future-builders','community-story']},
  {id:'friends',name:'Friends Crew',title:'Community Allies',group:'friends',missionIds:['neighborhood-help','event-support','welcome-team']},
  {id:'artists',name:'Artist Collective',title:'Creators / Performers',group:'artists',missionIds:['create-not-destroy','open-mic-peace','city-soundtrack']},
]

export const STREETVERSE_MISSIONS:StreetVerseMission[]=[
  {id:'peace-network',title:'Peace Network',description:'Build trust between neighborhoods, connect mentors with youth, and reduce conflict through dialogue and community events.',type:'peacekeeping',assignedTo:['stubbs'],rewardXP:450,repeatable:true},
  {id:'mentor-next',title:'Mentor the Next Generation',description:'Guide younger players through school, business, arts, technology, faith, sports, and life-skills challenges.',type:'mentorship',assignedTo:['stubbs','legacy-kids'],rewardXP:350,repeatable:true},
  {id:'world-builder',title:'Build the Block',description:'Restore a neighborhood space by coordinating local businesses, creators, residents, and services.',type:'community',assignedTo:['stubbs','friends','artists'],rewardXP:500,repeatable:true},
  {id:'guardian-watch',title:'Guardian Watch',description:'Al B leads a nonviolent safety patrol focused on prevention, de-escalation, safe escorts, incident reporting, and protecting community events.',type:'peacekeeping',assignedTo:['al-b','global-security-force'],rewardXP:500,repeatable:true,localizesToCity:true},
  {id:'safe-passage',title:'Safe Passage',description:'Create safe routes for kids and families moving between school, parks, transit, events, and home.',type:'rescue',assignedTo:['al-b','global-security-force','legacy-kids'],rewardXP:400,repeatable:true,localizesToCity:true},
  {id:'conflict-cooldown',title:'Conflict Cooldown',description:'Interrupt escalating disputes with dialogue, trusted adults, mediation, and emergency help when needed.',type:'peacekeeping',assignedTo:['al-b','global-security-force','stubbs','friends'],rewardXP:550,repeatable:true,localizesToCity:true},
  {id:'global-guardian-network',title:'Global Guardian Network',description:'Coordinate vetted local Guardian teams, community partners, accessibility resources, emergency contacts, and safe locations in the current city without vigilantism.',type:'peacekeeping',assignedTo:['al-b','global-security-force'],rewardXP:650,repeatable:true,global:true,localizesToCity:true},
  {id:'peace-corridor',title:'Peace Corridor',description:'Establish a temporary safe movement route during large events or neighborhood tension using de-escalation, trusted partners, medical access, reunification points, and official emergency services.',type:'rescue',assignedTo:['al-b','global-security-force','friends'],rewardXP:625,repeatable:true,global:true,localizesToCity:true},
  {id:'missing-person-support',title:'Missing Person Support',description:'Help organize verified information, community notices, safe search logistics, accessibility needs, and proper reporting to guardians or authorities. Players do not confront suspects or conduct vigilante investigations.',type:'rescue',assignedTo:['al-b','global-security-force','friends'],rewardXP:700,repeatable:true,global:true,localizesToCity:true},
  {id:'disaster-relief',title:'Guardian Disaster Relief',description:'Coordinate shelters, supplies, transportation, accessibility support, welfare checks, communications, and verified emergency resources during storms, fires, floods, outages, earthquakes, or other local emergencies.',type:'disaster-response',assignedTo:['al-b','global-security-force','friends','legacy-kids'],rewardXP:800,repeatable:true,global:true,localizesToCity:true},
  {id:'safe-event-command',title:'Safe Event Command',description:'Plan crowd safety, entrances, reunification points, accessibility routes, medical escalation, lost-child procedures, creator security, and peaceful closing procedures for StreetVerse and network events.',type:'event-safety',assignedTo:['al-b','global-security-force','friends','artists'],rewardXP:600,repeatable:true,global:true,localizesToCity:true},
  {id:'anti-trafficking-awareness',title:'Protect & Report',description:'Teach players to recognize possible exploitation indicators, protect privacy, preserve only lawful evidence, and route concerns to qualified local organizations or authorities. Players never pursue, entrap, or confront suspected traffickers.',type:'education',assignedTo:['al-b','global-security-force'],rewardXP:675,repeatable:true,global:true,localizesToCity:true},
  {id:'cyber-safety-relay',title:'Cyber Safety Relay',description:'Respond to account compromise, impersonation, doxxing, threats, fraud, or unsafe communications by preserving evidence, securing accounts, protecting victims, and escalating to Jacobie Vision, moderators, platforms, or authorities when appropriate.',type:'cyber-safety',assignedTo:['al-b','global-security-force'],rewardXP:575,repeatable:true,global:true,localizesToCity:true},
  {id:'safe-route',title:'Legacy Safe Route',description:'Map safe places, trusted businesses, libraries, schools, clinics, and community centers for younger players.',type:'education',assignedTo:['legacy-kids'],rewardXP:300,repeatable:true},
  {id:'future-builders',title:'Future Builders',description:'Complete learning missions in coding, cybersecurity, media, music, real estate, entrepreneurship, and public service.',type:'education',assignedTo:['legacy-kids'],rewardXP:425,repeatable:true},
  {id:'community-story',title:'Tell Our Story',description:'Interview elders, families, creators, and neighborhood builders and turn their stories into positive StreetVerse content.',type:'creative',assignedTo:['legacy-kids','artists'],rewardXP:325,repeatable:true},
  {id:'neighborhood-help',title:'Neighborhood Help',description:'Respond to community requests such as deliveries, accessibility support, cleanup, event setup, and resource navigation.',type:'community',assignedTo:['friends'],rewardXP:275,repeatable:true},
  {id:'event-support',title:'Community Event Support',description:'Help secure, staff, promote, and clean up peaceful community events.',type:'community',assignedTo:['friends','al-b','global-security-force'],rewardXP:300,repeatable:true},
  {id:'welcome-team',title:'Welcome Team',description:'Meet new players, teach the city systems, and connect them to safe activities, missions, and creator opportunities.',type:'mentorship',assignedTo:['friends'],rewardXP:250,repeatable:true},
  {id:'create-not-destroy',title:'Create, Don’t Destroy',description:'Turn neighborhood conflict into music, film, murals, dance, games, podcasts, and live performances instead of violence.',type:'creative',assignedTo:['artists'],rewardXP:450,repeatable:true},
  {id:'open-mic-peace',title:'Open Mic for Peace',description:'Host a performance event where rival groups compete through art, music, dance, debate, gaming, and storytelling instead of fighting.',type:'creative',assignedTo:['artists','stubbs','al-b','global-security-force'],rewardXP:600,repeatable:true},
  {id:'city-soundtrack',title:'City Soundtrack',description:'Create a location-specific soundtrack and visual reel that reflects the culture of the city you are visiting.',type:'creative',assignedTo:['artists'],rewardXP:375,repeatable:true},
]

let installed=false
export function installStreetVerseCharacterMissionRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  let city='Chicago'
  let country='United States'
  const publish=()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-registry',{detail:{
    schema:'tryamm.streetverse.characters.v2',
    characters:STREETVERSE_CHARACTERS,
    missions:STREETVERSE_MISSIONS.map(m=>m.localizesToCity?{...m,city,country}:m),
    guardianForce:{commander:'al-b',teamId:'global-security-force',city,country,doctrine:['prevention','de-escalation','rescue','safe-passage','protect-and-report','disaster-response','cyber-safety','event-safety','no-vigilantism'],allLanguages:true},
  }}))
  queueMicrotask(publish)
  window.addEventListener('tryamm:streetverse-character-request',publish)
  window.addEventListener('tryamm:world-location-changed',(e:Event)=>{
    const d=(e as CustomEvent<any>).detail||{}
    city=String(d.city||city)
    country=String(d.country||country)
    publish()
    window.dispatchEvent(new CustomEvent('tryamm:global-guardian-city-team',{detail:{commander:'al-b',teamId:'global-security-force',city,country,allLanguages:true}}))
  })
}
