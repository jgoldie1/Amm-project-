/**
 * Original fictional StreetVerse story scenes. The A/B/C/D choices change
 * the following scene and tracked community outcomes. No actual legal advice,
 * automatic punishment, jail booking, or live financial rewards.
 */
export type FilmSceneId='park'|'call911'|'community'|'arrest'|'county-jail'|'public-defender'|'court'|'reentry'|'finale'
export type FilmChoice={key:'A'|'B'|'C'|'D';label:string;next:FilmSceneId;effect:'care'|'evidence'|'rights'|'service';summary:string}
export type FilmScene={id:FilmSceneId;title:string;location:string;camera:string;voice:string;roles:readonly string[];choices:readonly FilmChoice[]}
export type FilmState={scene:FilmSceneId;history:{from:FilmSceneId;choice:FilmChoice['key'];to:FilmSceneId}[];community:number;caseEvidence:number;rightsAwareness:number;services:number;finished:boolean}
const options=(items:readonly [string,FilmSceneId,FilmChoice['effect'],string][]):FilmChoice[]=>items.map(([label,next,effect,summary],i)=>({key:(['A','B','C','D'] as const)[i],label,next,effect,summary}))
export const FILM_SCENES:Record<FilmSceneId,FilmScene>={
 park:{id:'park',title:'Episode 1 · Circle Park',location:'Chicago / Circle Park',camera:'third-person establishing shot',voice:'An event unfolds across the neighborhood. Your next move determines the story.',roles:['BJ','Jacobie','residents'],choices:options([
 ['Help a neighbor carrying supplies','community','care','A neighbor receives assistance.'],
 ['Call for help about a disturbance','call911','evidence','An emergency call is requested in the fictional world.'],
 ['Visit the county court information desk','court','rights','You begin by learning how a hearing works.'],
 ['Explore the family service center','reentry','service','You learn about housing, employment and recovery resources.']
 ])},
 call911:{id:'call911',title:'Episode 2 · Emergency Call',location:'Chicago dispatch center',camera:'split-screen dispatcher and caller',voice:'The fictional dispatcher asks for a clear description of what happened.',roles:['BJ','dispatcher','officer'],choices:options([
 ['Provide accurate location and safety details','community','evidence','Dispatch records the available scene description.'],
 ['Request medical assistance','community','care','Medical assistance is prioritized in this simulation.'],
 ['Ask for a supervisor and a case number','court','rights','The player records the incident reference.'],
 ['Decline to speculate about what you did not see','park','rights','The report avoids unsupported accusations.']
 ])},
 community:{id:'community',title:'Episode 3 · Neighborhood Response',location:'Chicago streets',camera:'tracking camera following neighbors',voice:'Neighbors and responders choose how to support one another.',roles:['neighbor','officer','paramedic','reporter'],choices:options([
 ['Help everyone move to a safe area','reentry','care','People move toward safety.'],
 ['Record only verified observations','court','evidence','A factual record is prepared.'],
 ['Ask how to contact legal assistance','public-defender','rights','A legal support scene opens.'],
 ['Volunteer for a neighborhood project','finale','service','Community support increases in this fictional mission.']
 ])},
 arrest:{id:'arrest',title:'Episode 4 · Arrest and Rights',location:'StreetVerse county intake route',camera:'restrained eye-level dialogue',voice:'This scenario explains procedure without portraying an arrest as proof of guilt.',roles:['civilian','officer','attorney'],choices:options([
 ['Request to speak with a lawyer','public-defender','rights','The fictional legal-support desk is notified.'],
 ['Ask for medical care if needed','county-jail','care','A health screening is requested.'],
 ['Ask for a case number and written records','court','evidence','The player keeps track of the process.'],
 ['Remain calm and request procedural information','county-jail','rights','The simulation advances to intake.']
 ])},
 'county-jail':{id:'county-jail',title:'Episode 5 · County Jail Intake',location:'Fictional county jail and health desk',camera:'non-graphic wide intake shot',voice:'Booking, identity checks, healthcare, and attorney access are simulated respectfully.',roles:['intake staff','detainee','nurse','lawyer'],choices:options([
 ['Ask to contact legal counsel','public-defender','rights','The counsel-access scene opens.'],
 ['Request a medical screening','public-defender','care','A care request is entered in the simulation.'],
 ['Ask for information about the next hearing','court','evidence','Hearing information becomes the next objective.'],
 ['Ask about family communication and reentry support','reentry','service','Support planning begins.']
 ])},
 'public-defender':{id:'public-defender',title:'Episode 6 · Meet the Attorney',location:'Attorney consultation room',camera:'two-shot consultation dialogue',voice:'A fictional public defender discusses case preparation. This is not real legal representation.',roles:['attorney','client','legal aide'],choices:options([
 ['Review the accusation and documents','court','evidence','The fictional evidence list is reviewed.'],
 ['Discuss procedural rights','court','rights','The next scene highlights due process.'],
 ['Ask about support and rehabilitation services','reentry','service','Community supports are identified.'],
 ['Request interpreter or disability accommodations','court','care','An accessibility request is recorded in the story.']
 ])},
 court:{id:'court',title:'Episode 7 · Court Hearing',location:'Fictional county courthouse',camera:'cinematic wide shot with speaker close-ups',voice:'Judge, defense and prosecution speak in turn; only a court decides the fictional case outcome.',roles:['judge','prosecutor','defense lawyer','witness','clerk'],choices:options([
 ['Hear both sides and examine available evidence','finale','evidence','A fictional due-process hearing is completed.'],
 ['Ask to clarify procedural rights','public-defender','rights','The story returns to legal consultation.'],
 ['Request a reasonable accommodation','court','care','The request is noted in the fictional scene.'],
 ['Explore supervised community services','reentry','service','A reentry-support branch opens, without imposing punishment.']
 ])},
 reentry:{id:'reentry',title:'Episode 8 · Community and Reentry',location:'StreetVerse family resources center',camera:'hopeful neighborhood panorama',voice:'Education, housing, work opportunities and social services can improve a community.',roles:['family member','case manager','employer','mentor'],choices:options([
 ['Apply for fictional career training','finale','service','Training opportunities are unlocked in the story.'],
 ['Arrange a fictional family visit','finale','care','Family contact is part of the narrative.'],
 ['Get information on legal aid','public-defender','rights','The story returns to counsel.'],
 ['Volunteer for neighborhood repairs','community','service','The player returns to a community mission.']
 ])},
 finale:{id:'finale',title:'Episode Finale · Your Chicago Story',location:'Mycelium connected Chicago world',camera:'end-of-episode montage',voice:'Your choices changed the route, support, information, and evidence examined in this fictional story.',roles:['BJ','community cast'],choices:options([
 ['Replay from the park','park','care','You begin a new branching story.'],
 ['Explore legal professions','court','rights','You explore another courtroom perspective.'],
 ['Explore social-service careers','reentry','service','You explore care and employment professions.'],
 ['Explore the neighborhood','community','evidence','You return to the living city.']
 ])}
}
export const newFilmState=():FilmState=>({scene:'park',history:[],community:0,caseEvidence:0,rightsAwareness:0,services:0,finished:false})
export function chooseFilm(state:FilmState,key:'A'|'B'|'C'|'D'):FilmState{
 const choice=FILM_SCENES[state.scene].choices.find(x=>x.key===key)
 if(!choice)return state
 const effect=choice.effect
 const next={...state,scene:choice.next,history:[...state.history.slice(-39),{from:state.scene,choice:key,to:choice.next}],
 community:state.community+(effect==='care'?1:0),caseEvidence:state.caseEvidence+(effect==='evidence'?1:0),
 rightsAwareness:state.rightsAwareness+(effect==='rights'?1:0),services:state.services+(effect==='service'?1:0),
 finished:choice.next==='finale'}
 return next
}
export function validFilmState(value:unknown):value is FilmState{
 if(!value||typeof value!=='object')return false
 const s=value as Partial<FilmState>
 return typeof s.scene==='string'&&Object.hasOwn(FILM_SCENES,s.scene)&&Array.isArray(s.history)&&s.history.length<=40
 &&['community','caseEvidence','rightsAwareness','services'].every(k=>Number.isFinite((s as unknown as Record<string,unknown>)[k])&&Number((s as unknown as Record<string,unknown>)[k])>=0)
}
