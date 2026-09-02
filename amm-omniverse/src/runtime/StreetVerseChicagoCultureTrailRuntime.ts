type CultureMission={id:string;artist:string;title:string;objective:string;reward:string;boss?:boolean}

// StreetVerse Chicago Culture Trail. Public artists are represented as clearly fictionalized
// game portrayals unless licensed likeness/voice/music assets are supplied. No copyrighted songs
// or lyrics are bundled here; rhythm challenges use original game beats.
export const CHICAGO_CULTURE_MISSIONS:CultureMission[]=[
 {id:'shawnna-block-command',artist:'Shawnna',title:'Block Command',objective:'Win an original call-and-response flow challenge, then mentor a new creator.',reward:'Shawnna Flow Key'},
 {id:'twista-rapid-fire',artist:'Twista',title:'Rapid Fire',objective:'Complete escalating rhythm lanes built around speed, timing and clear articulation.',reward:'Rapid Fire Key',boss:true},
 {id:'common-storyteller',artist:'Common',title:'South Side Storyteller',objective:'Build a positive Chicago story from community interview prompts and perform it.',reward:'Storyteller Key'},
 {id:'lupe-word-lab',artist:'Lupe Fiasco',title:'Word Lab',objective:'Solve layered wordplay and storytelling puzzles over an original beat.',reward:'Word Lab Key'},
 {id:'crucial-conflict-midwest',artist:'Crucial Conflict',title:'Midwest Crew Challenge',objective:'Coordinate a four-part crew performance without missing the team timing windows.',reward:'Crew Key'},
 {id:'g-herbo-city-report',artist:'G Herbo',title:'City Report',objective:'Turn fictional StreetVerse neighborhood events into a creator report and community response mission.',reward:'City Voice Key'},
 {id:'juice-world-melody-memory',artist:'Juice WRLD',title:'Melody & Memory Tribute',objective:'Create an original melody-and-emotion performance in a respectful memorial challenge.',reward:'Melody Memory Key'},
 {id:'durk-chicago-path',artist:'Lil Durk',title:'Chicago Path',objective:'Choose between creator, business and community branches in a fictionalized career mission.',reward:'Path Key'},
 {id:'kanye-production-lab',artist:'Kanye West',title:'Chicago Production Lab',objective:'Arrange an original sample-free beat and stage concept without using copyrighted recordings.',reward:'Production Key'},
 {id:'brat-mic-control',artist:'Da Brat',title:'Mic Control',objective:'Complete performance, crowd-control and confidence challenges on the Culture Trail stage.',reward:'Mic Control Key'},
 {id:'shawnna-aniya-64track',artist:'Shawnna + Aniyah',title:'64-Track Studio: Chicago Women on the Mic',objective:'Record original vocal layers in Aniyah’s 64-Track Studio, mix a StreetVerse Reel, add captions and publish through the in-game Reel pipeline.',reward:'64-Track Master Key'},
 {id:'chicago-legends-finale',artist:'Chicago Culture Trail',title:'Chicago Legends Boss Finale',objective:'Use the earned Culture Keys in a multi-stage rhythm, storytelling, production and creator finale.',reward:'Chicago Culture Crown',boss:true}
]

const completed=new Set<string>()
export function installStreetVerseChicagoCultureTrail(){
 const offer=(id:string)=>{const m=CHICAGO_CULTURE_MISSIONS.find(x=>x.id===id);if(!m)return;window.dispatchEvent(new CustomEvent('tryamm:mission-offered',{detail:{id:m.id,title:m.title,artist:m.artist,objective:m.objective,reward:m.reward,boss:!!m.boss,source:'chicago-culture-trail',fictionalizedPortrayal:true,originalMusicOnly:true}}))}
 const complete=(ev:Event)=>{const d=(ev as CustomEvent).detail||{};const m=CHICAGO_CULTURE_MISSIONS.find(x=>x.id===d.id);if(!m||completed.has(m.id))return;completed.add(m.id);window.dispatchEvent(new CustomEvent('tryamm:culture-key-earned',{detail:{missionId:m.id,key:m.reward,artist:m.artist,total:completed.size}}));if(m.id==='shawnna-aniya-64track')window.dispatchEvent(new CustomEvent('tryamm:reel-publish-requested',{detail:{source:'aniya-64-track-studio',missionId:m.id,caption:'Chicago Culture Trail • 64-Track Studio',originalContent:true}}));if(completed.size>=CHICAGO_CULTURE_MISSIONS.length-1)offer('chicago-legends-finale')}
 window.addEventListener('tryamm:culture-mission-complete',complete)
 window.dispatchEvent(new CustomEvent('tryamm:chicago-culture-trail-ready',{detail:{missions:CHICAGO_CULTURE_MISSIONS.length,artists:[...new Set(CHICAGO_CULTURE_MISSIONS.map(x=>x.artist))],shawnnaIncluded:true,rapidFire:true,aniya64Track:true,finalBoss:true}}))
 return {missions:CHICAGO_CULTURE_MISSIONS,offer,dispose:()=>window.removeEventListener('tryamm:culture-mission-complete',complete)}
}
