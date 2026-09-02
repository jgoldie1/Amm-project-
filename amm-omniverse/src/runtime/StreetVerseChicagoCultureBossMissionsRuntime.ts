export type ChicagoCultureMission={id:string;title:string;artist:string;zone:string;objective:string;boss:boolean;fictionalized:boolean;reward:string}

export const CHICAGO_CULTURE_MISSIONS:ChicagoCultureMission[]=[
 {id:'rapid-fire',title:'Rapid Fire Cipher',artist:'Twista',zone:'West Side Culture Trail',objective:'Complete a rhythm-and-delivery timing challenge, then record an original StreetVerse verse.',boss:true,fictionalized:true,reward:'Rapid Fire Flow badge'},
 {id:'common-ground',title:'Common Ground',artist:'Common',zone:'South Side Culture Trail',objective:'Resolve a neighborhood story through dialogue, poetry, and community choices.',boss:true,fictionalized:true,reward:'Common Ground badge'},
 {id:'food-thought',title:'Food & Thought',artist:'Lupe Fiasco',zone:'Chicago Culture Trail',objective:'Solve lyric, history, and creative-thinking puzzles without reproducing copyrighted lyrics.',boss:true,fictionalized:true,reward:'Thought Runner badge'},
 {id:'herbo-survival',title:'Chicago Survival Stories',artist:'G Herbo',zone:'East Side Culture Trail',objective:'Navigate a fictional community story focused on choices, resilience, and mentorship.',boss:true,fictionalized:true,reward:'Resilience badge'},
 {id:'juice-legacy',title:'Creative Legacy',artist:'Juice WRLD tribute',zone:'Chicago Culture Trail',objective:'Create an original song about emotion, creativity, and legacy; no artist likeness or music is required.',boss:true,fictionalized:true,reward:'Creative Legacy badge'},
 {id:'brat-stage',title:'Chicago Stage Command',artist:'Da Brat',zone:'Creator District',objective:'Win a fictional performance-and-stage-presence challenge.',boss:true,fictionalized:true,reward:'Stage Command badge'},
 {id:'crucial-cipher',title:'Crucial Chicago Cipher',artist:'Crucial Conflict',zone:'West Side Culture Trail',objective:'Complete an original group cipher and teamwork challenge.',boss:true,fictionalized:true,reward:'Cipher Crew badge'},
 {id:'durk-story',title:'Chicago Storyline',artist:'Lil Durk-inspired fictional encounter',zone:'South Side Culture Trail',objective:'Complete a fictional music-business and neighborhood-story mission.',boss:true,fictionalized:true,reward:'Storyline badge'},
 {id:'von-mural',title:'Community Mural Memory',artist:'King Von memorial/fan culture reference',zone:'O Block-inspired fictional culture zone',objective:'Visit a fictionalized community mural, collect memory tokens, and complete a nonviolent neighborhood-history challenge.',boss:true,fictionalized:true,reward:'Memory Wall badge'},
 {id:'ye-creator',title:'Chicago Creator Lab',artist:'Ye-inspired fictional encounter',zone:'Creator District',objective:'Build an original beat, visual concept, and stage presentation.',boss:true,fictionalized:true,reward:'Creator Lab badge'},
 {id:'aniyah-64',title:'Aniyah 64-Track Studio: Chicago Reel',artist:'Aniyah / 64-Track Studio',zone:'64-Track Studio',objective:'Record original vocals, arrange a simulated 64-track session, edit a Reel, and publish it to the in-game StreetVerse feed.',boss:true,fictionalized:false,reward:'64-Track Producer Key'}
]

const SAVE='tryamm.streetverse.chicago-culture.v1'
type State={completed:string[];reels:string[]}
const load=():State=>{try{return JSON.parse(localStorage.getItem(SAVE)||'')||{completed:[],reels:[]}}catch{return {completed:[],reels:[]}}}
const save=(s:State)=>localStorage.setItem(SAVE,JSON.stringify(s))

export function installStreetVerseChicagoCultureBossMissions(){
 const state=load()
 const offer=(id:string)=>{const mission=CHICAGO_CULTURE_MISSIONS.find(m=>m.id===id);if(!mission)return;window.dispatchEvent(new CustomEvent('tryamm:mission-offered',{detail:{...mission,source:'chicago-culture-trail'}}));window.dispatchEvent(new CustomEvent('tryamm:chicago-culture-dialogue',{detail:{missionId:id,speaker:mission.artist,line:`Welcome to ${mission.title}. This is a fictionalized StreetVerse culture mission celebrating Chicago creativity.`}}))}
 const complete=(id:string)=>{const mission=CHICAGO_CULTURE_MISSIONS.find(m=>m.id===id);if(!mission||state.completed.includes(id))return;if(id==='aniyah-64'){const reel=`chicago-reel-${Date.now()}`;state.reels.push(reel);window.dispatchEvent(new CustomEvent('tryamm:reel-published',{detail:{id:reel,studio:'Aniyah 64-Track Studio',destination:'streetverse-in-game-feed',simulation:true}}))}state.completed.push(id);save(state);window.dispatchEvent(new CustomEvent('tryamm:mission-completed',{detail:{id,title:mission.title,reward:mission.reward,source:'chicago-culture-trail'}}));if(state.completed.length===CHICAGO_CULTURE_MISSIONS.length)window.dispatchEvent(new CustomEvent('tryamm:chicago-culture-boss-unlocked',{detail:{title:'Chicago Legends: Final Culture Boss',completed:state.completed.length}}))}
 const onOffer=(e:Event)=>offer((e as CustomEvent).detail?.id)
 const onComplete=(e:Event)=>complete((e as CustomEvent).detail?.id)
 window.addEventListener('tryamm:chicago-culture-offer',onOffer)
 window.addEventListener('tryamm:chicago-culture-complete',onComplete)
 window.dispatchEvent(new CustomEvent('tryamm:chicago-culture-ready',{detail:{missions:CHICAGO_CULTURE_MISSIONS.length,artists:CHICAGO_CULTURE_MISSIONS.map(m=>m.artist),inGamePublishingOnly:true}}))
 return()=>{window.removeEventListener('tryamm:chicago-culture-offer',onOffer);window.removeEventListener('tryamm:chicago-culture-complete',onComplete)}
}
