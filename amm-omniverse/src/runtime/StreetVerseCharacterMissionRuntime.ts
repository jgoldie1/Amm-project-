export type CharacterGroup='founder'|'security'|'legacy-kids'|'friends'|'artists'|'community'
export type MissionType='peacekeeping'|'mentorship'|'rescue'|'creative'|'education'|'community'|'exploration'

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
}

export const STREETVERSE_CHARACTERS:StreetVerseCharacter[]=[
  {id:'stubbs',name:"Stubbs",title:'Founder / Living World Guide',group:'founder',missionIds:['peace-network','mentor-next','world-builder']},
  {id:'al-b',name:'Al B',title:'Security Guardian',group:'security',missionIds:['guardian-watch','safe-passage','conflict-cooldown']},
  {id:'legacy-kids',name:'Legacy Kids',title:'Next Generation Crew',group:'legacy-kids',missionIds:['safe-route','future-builders','community-story']},
  {id:'friends',name:'Friends Crew',title:'Community Allies',group:'friends',missionIds:['neighborhood-help','event-support','welcome-team']},
  {id:'artists',name:'Artist Collective',title:'Creators / Performers',group:'artists',missionIds:['create-not-destroy','open-mic-peace','city-soundtrack']},
]

export const STREETVERSE_MISSIONS:StreetVerseMission[]=[
  {id:'peace-network',title:'Peace Network',description:'Build trust between neighborhoods, connect mentors with youth, and reduce conflict through dialogue and community events.',type:'peacekeeping',assignedTo:['stubbs'],rewardXP:450,repeatable:true},
  {id:'mentor-next',title:'Mentor the Next Generation',description:'Guide younger players through school, business, arts, technology, faith, sports, and life-skills challenges.',type:'mentorship',assignedTo:['stubbs','legacy-kids'],rewardXP:350,repeatable:true},
  {id:'world-builder',title:'Build the Block',description:'Restore a neighborhood space by coordinating local businesses, creators, residents, and services.',type:'community',assignedTo:['stubbs','friends','artists'],rewardXP:500,repeatable:true},
  {id:'guardian-watch',title:'Guardian Watch',description:'Al B leads a nonviolent safety patrol focused on prevention, de-escalation, safe escorts, incident reporting, and protecting community events.',type:'peacekeeping',assignedTo:['al-b'],rewardXP:500,repeatable:true},
  {id:'safe-passage',title:'Safe Passage',description:'Create safe routes for kids and families moving between school, parks, transit, events, and home.',type:'rescue',assignedTo:['al-b','legacy-kids'],rewardXP:400,repeatable:true},
  {id:'conflict-cooldown',title:'Conflict Cooldown',description:'Interrupt escalating disputes with dialogue, trusted adults, mediation, and emergency help when needed.',type:'peacekeeping',assignedTo:['al-b','stubbs','friends'],rewardXP:550,repeatable:true},
  {id:'safe-route',title:'Legacy Safe Route',description:'Map safe places, trusted businesses, libraries, schools, clinics, and community centers for younger players.',type:'education',assignedTo:['legacy-kids'],rewardXP:300,repeatable:true},
  {id:'future-builders',title:'Future Builders',description:'Complete learning missions in coding, cybersecurity, media, music, real estate, entrepreneurship, and public service.',type:'education',assignedTo:['legacy-kids'],rewardXP:425,repeatable:true},
  {id:'community-story',title:'Tell Our Story',description:'Interview elders, families, creators, and neighborhood builders and turn their stories into positive StreetVerse content.',type:'creative',assignedTo:['legacy-kids','artists'],rewardXP:325,repeatable:true},
  {id:'neighborhood-help',title:'Neighborhood Help',description:'Respond to community requests such as deliveries, accessibility support, cleanup, event setup, and resource navigation.',type:'community',assignedTo:['friends'],rewardXP:275,repeatable:true},
  {id:'event-support',title:'Community Event Support',description:'Help secure, staff, promote, and clean up peaceful community events.',type:'community',assignedTo:['friends','al-b'],rewardXP:300,repeatable:true},
  {id:'welcome-team',title:'Welcome Team',description:'Meet new players, teach the city systems, and connect them to safe activities, missions, and creator opportunities.',type:'mentorship',assignedTo:['friends'],rewardXP:250,repeatable:true},
  {id:'create-not-destroy',title:'Create, Don’t Destroy',description:'Turn neighborhood conflict into music, film, murals, dance, games, podcasts, and live performances instead of violence.',type:'creative',assignedTo:['artists'],rewardXP:450,repeatable:true},
  {id:'open-mic-peace',title:'Open Mic for Peace',description:'Host a performance event where rival groups compete through art, music, dance, debate, gaming, and storytelling instead of fighting.',type:'creative',assignedTo:['artists','stubbs','al-b'],rewardXP:600,repeatable:true},
  {id:'city-soundtrack',title:'City Soundtrack',description:'Create a location-specific soundtrack and visual reel that reflects the culture of the city you are visiting.',type:'creative',assignedTo:['artists'],rewardXP:375,repeatable:true},
]

let installed=false
export function installStreetVerseCharacterMissionRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-registry',{detail:{characters:STREETVERSE_CHARACTERS,missions:STREETVERSE_MISSIONS}})))
  window.addEventListener('tryamm:streetverse-character-request',()=>{
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-registry',{detail:{characters:STREETVERSE_CHARACTERS,missions:STREETVERSE_MISSIONS}}))
  })
}
