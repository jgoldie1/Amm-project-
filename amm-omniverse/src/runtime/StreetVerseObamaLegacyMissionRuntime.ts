type MissionRole='jacobie'|'isaiah'|'alton-kevon'|'team'
type LegacyMission={id:string;title:string;role:MissionRole;zone:string;objective:string;reward:string}
type DialogueChoice={id:string;label:string;response:string;missionId?:string}

const SAVE='tryamm.streetverse.obama-legacy.v1'
const MISSIONS:LegacyMission[]=[
 {id:'jacobie-global-pathways',title:'Global Pathways: Chicago to the World',role:'jacobie',zone:'library-forum',objective:'Complete a civic diplomacy and defensive cyber puzzle.',reward:'Jacobie Vision Legacy Key'},
 {id:'isaiah-home-court',title:'Home Court: Next Generation',role:'isaiah',zone:'home-court',objective:'Complete basketball, teamwork and sports-media challenges.',reward:'Isaiah AI TV Legacy Key'},
 {id:'alton-vision-production',title:'Vision to Production',role:'alton-kevon',zone:'forum-media',objective:'Produce a Chicago creator story and complete an educational market-analysis simulation.',reward:'Alton Kevon Production Legacy Key'},
 {id:'presidential-detail-community',title:'Presidential Detail: Chicago Legacy',role:'team',zone:'public-campus',objective:'Help a fictionalized public event through community liaison, visitor assistance and defensive cyber objectives.',reward:'Chicago Legacy Seal'},
 {id:'stubbs-next-generation',title:'Stubbs Next Generation: Build Chicago',role:'team',zone:'jackson-park',objective:'Combine diplomacy, athletics, media and production skills to complete the team finale.',reward:'Future Chicago Chronokey'}
]

const OBAMA_DIALOGUE:DialogueChoice[]=[
 {id:'community',label:'I want to help my neighborhood.',response:'Leadership starts close to home. Listen first, bring people together, then build something that lasts.',missionId:'presidential-detail-community'},
 {id:'basketball',label:"Let's talk basketball.",response:'The court can teach preparation, teamwork and how to respond when the next play does not go your way.',missionId:'isaiah-home-court'},
 {id:'leadership',label:'How do I become a leader?',response:'Learn, serve, organize and make room for other people to lead too.',missionId:'stubbs-next-generation'},
 {id:'chicago',label:'What does Chicago mean to this story?',response:'In this StreetVerse story, Chicago is where community, creativity and the next generation meet.'}
]

const read=()=>{try{return JSON.parse(localStorage.getItem(SAVE)||'{}')}catch{return {}}}
const write=(v:any)=>localStorage.setItem(SAVE,JSON.stringify(v))
const emit=(name:string,detail:any)=>window.dispatchEvent(new CustomEvent(name,{detail}))

export function installStreetVerseObamaLegacyMissionRuntime(){
 let state={completed:[] as string[],keys:[] as string[],...read()}
 const offer=(id:string)=>{const mission=MISSIONS.find(m=>m.id===id);if(mission)emit('tryamm:mission-offered',{...mission,source:'obama-legacy-story'})}
 const onDialogue=(ev:Event)=>{const choice=(ev as CustomEvent).detail?.choiceId;const item=OBAMA_DIALOGUE.find(x=>x.id===choice);if(!item)return;emit('tryamm:dialogue-response',{speaker:'Barack Obama — fictional StreetVerse portrayal',fictionalDialogue:true,text:item.response,choiceId:item.id});if(item.missionId)offer(item.missionId)}
 const onComplete=(ev:Event)=>{const id=(ev as CustomEvent).detail?.id;const m=MISSIONS.find(x=>x.id===id);if(!m||state.completed.includes(id))return;state.completed.push(id);if(!state.keys.includes(m.reward))state.keys.push(m.reward);write(state);emit('tryamm:obama-legacy-reward',{missionId:id,reward:m.reward,completed:state.completed,keys:state.keys});const firstThree=['jacobie-global-pathways','isaiah-home-court','alton-vision-production'];if(firstThree.every(x=>state.completed.includes(x)))offer('stubbs-next-generation')}
 const onZone=(ev:Event)=>{const id=(ev as CustomEvent).detail?.id;if(id==='opc-library'||id==='opc-forum')offer('jacobie-global-pathways');if(id==='opc-home-court')offer('isaiah-home-court');if(id==='opc-forum')offer('alton-vision-production')}
 const onBasketball=()=>emit('tryamm:basketball-mode-select',{venue:'Obama Center-inspired Home Court',modes:['shootaround','horse','one-on-one','three-on-three','leadership-challenge'],missionId:'isaiah-home-court'})
 const onPresidentialEvent=()=>offer('presidential-detail-community')
 window.addEventListener('tryamm:obama-dialogue-choice',onDialogue)
 window.addEventListener('tryamm:mission-completed',onComplete)
 window.addEventListener('tryamm:obama-center-mission-enter',onZone)
 window.addEventListener('tryamm:obama-home-court-play',onBasketball)
 window.addEventListener('tryamm:obama-presidential-event-start',onPresidentialEvent)
 emit('tryamm:obama-legacy-runtime-ready',{missions:MISSIONS,dialogue:OBAMA_DIALOGUE,notice:'Obama dialogue is fictional StreetVerse writing. Secret Service gameplay is fictionalized and excludes real protective procedures, routes, vulnerabilities and restricted layouts.'})
 return()=>{window.removeEventListener('tryamm:obama-dialogue-choice',onDialogue);window.removeEventListener('tryamm:mission-completed',onComplete);window.removeEventListener('tryamm:obama-center-mission-enter',onZone);window.removeEventListener('tryamm:obama-home-court-play',onBasketball);window.removeEventListener('tryamm:obama-presidential-event-start',onPresidentialEvent)}
}

export const STREETVERSE_OBAMA_LEGACY_MISSIONS=MISSIONS
export const STREETVERSE_OBAMA_DIALOGUE=OBAMA_DIALOGUE
