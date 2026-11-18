/** AI Cafe Playground: local learning exercises, not autonomous job execution.
 * Never award official credentials, game currency, or real money here.
 */
export type PlaygroundLane='prompting'|'cafe-operations'|'streetverse-npc'|'character-rig'|'accessibility'
export type PlaygroundExercise={id:string;lane:PlaygroundLane;title:string;goal:string;starterPrompt:string;checklist:readonly string[];workstream:string}
export type PlaygroundAttempt={exerciseId:string;prompt:string;completedChecks:string[];submittedAt:string;status:'self-reported';evidenceNote:string}
export const AI_CAFE_PLAYGROUND_KEY='tryamm.ai-cafe.playground.v1'
export const AI_CAFE_EXERCISES:readonly PlaygroundExercise[]=[
 {id:'prompt-101',lane:'prompting',title:'Prompt Lab — ask JARVIS',goal:'Practice a clear AI request with a goal, context and a testable result.',starterPrompt:'JARVIS, help me design a one-handed StreetVerse mission. Give me the objective, three player steps, an accessibility check and a test plan.',checklist:['Explained the goal','Included helpful context','Asked for a testable result'],workstream:'quality'},
 {id:'cafe-shift',lane:'cafe-operations',title:'AI Café shift simulator',goal:'Plan a fictional café shift; review stock, guest service, and waste tracking.',starterPrompt:'JARVIS, run a fictional AI Café training shift. Give me a sample coffee order, inventory check, customer-service issue, and a shift report template. Do not charge real money.',checklist:['Reviewed simulated order','Checked inventory and waste','Prepared shift report'],workstream:'jobs'},
 {id:'npc-director',lane:'streetverse-npc',title:'StreetVerse NPC dialogue lab',goal:'Create safe, accessible fictional dialogue and an NPC interaction test.',starterPrompt:'JARVIS, write a friendly Chicago StreetVerse shopkeeper interaction with three selectable replies, a clear mission cue, and a realistic non-graphic recovery choice.',checklist:['Created NPC dialogue','Added player choices','Checked mission and accessibility'],workstream:'streetverse'},
 {id:'rig-review',lane:'character-rig',title:'3D character rig review',goal:'Understand bones, animation retargeting and what counts as verified GLB evidence.',starterPrompt:'JARVIS, explain how I can inspect a humanoid GLB for bones, normalized skin weights, walking animations, clothing deformation and an injury reaction. Do not claim a model passes without test evidence.',checklist:['Checked rig requirements','Identified skin-weight and motion risks','Listed proof needed for release'],workstream:'assets'},
 {id:'access-qa',lane:'accessibility',title:'One-handed UI testing',goal:'Test controls and write an accessible game bug report.',starterPrompt:'JARVIS, create a one-handed Chromebook and phone test checklist for StreetVerse: 44-pixel buttons, readable mission text, joystick, voice captions, and save/reload.',checklist:['Checked tap targets','Reviewed captions and readability','Recorded issues to fix'],workstream:'quality'}
] as const
export function findPlaygroundExercise(id:string){return AI_CAFE_EXERCISES.find(x=>x.id===id)||null}
export function validatePlaygroundAttempt(value:unknown):PlaygroundAttempt|null{
 if(!value||typeof value!=='object')return null
 const x=value as Partial<PlaygroundAttempt>
 const exercise=typeof x.exerciseId==='string'?findPlaygroundExercise(x.exerciseId):null
 if(!exercise||typeof x.prompt!=='string'||x.prompt.length>4000||typeof x.evidenceNote!=='string'||x.evidenceNote.length>1200||!Array.isArray(x.completedChecks))return null
 const checked=x.completedChecks.filter((label):label is string=>typeof label==='string'&&exercise.checklist.includes(label))
 return {exerciseId:exercise.id,prompt:x.prompt,completedChecks:[...new Set(checked)],submittedAt:typeof x.submittedAt==='string'?x.submittedAt:'',status:'self-reported',evidenceNote:x.evidenceNote}
}
export function playgroundAttemptComplete(attempt:PlaygroundAttempt){
 const e=findPlaygroundExercise(attempt.exerciseId)
 return Boolean(e&&e.checklist.every(check=>attempt.completedChecks.includes(check)))
}
export function loadPlaygroundAttempts(raw:string|null):PlaygroundAttempt[]{
 if(!raw)return []
 try{const x=JSON.parse(raw);if(!Array.isArray(x))return [];return x.slice(0,40).map(validatePlaygroundAttempt).filter((a):a is PlaygroundAttempt=>Boolean(a))}catch{return []}
}
export const AI_CAFE_PLAYGROUND_POLICY={
 realMoney:false,officialCredential:false,automaticWorkerExecution:false,
 ownerApprovalForPublication:true,canQueueCafePlanningTask:true,
 submissionsAreSelfReported:true,
 reusableAcrossStreetVerseAndCampusVerse:true
} as const
