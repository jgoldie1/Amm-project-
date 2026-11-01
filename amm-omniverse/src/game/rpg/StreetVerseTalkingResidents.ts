export type ResidentMood='cheerful'|'worried'|'annoyed'|'grateful';
export type ResidentMemory={residentId:string;playerId:string;flags:string[];relationship:number;lastConversationAt:string|null};
export type DialogueTurn={speaker:'resident';text:string;emotion:'laugh'|'angry'|'sad'|'celebrate'|'surprised'|'nod';voiceKey:string};
export type ResidentContext={scene:'lobby'|'kitchen'|'hallway';plumbingFixed:boolean;playerName:string};
const safeName=(s:string)=>s.replace(/[<>]/g,'').trim().slice(0,30)||'friend';
export function createResidentMemory(residentId:string,playerId:string):ResidentMemory{return {residentId,playerId,flags:[],relationship:0,lastConversationAt:null}}
export function getResidentReply(memory:ResidentMemory,context:ResidentContext,intent:'greet'|'ask-plumbing'|'ask-elevator'|'joke'|'goodbye'):DialogueTurn{
 const name=safeName(context.playerName);
 const repaired=context.plumbingFixed||memory.flags.includes('plumbing-fixed');
 if(intent==='greet')return repaired
 ?{speaker:'resident',text:`Well, look who it is! ${name}, my favorite plumber. The sink is quiet, but that elevator still has an attitude!`,emotion:'celebrate',voiceKey:'pearl-greet-after-repair'}
 :{speaker:'resident',text:`Hey ${name}! Come on in. My sink is making music again, and I did not buy concert tickets.`,emotion:'surprised',voiceKey:'pearl-greet-before-repair'};
 if(intent==='ask-plumbing')return repaired
 ?{speaker:'resident',text:'That pipe is behaving now. I almost miss its little jazz concert. Almost.',emotion:'laugh',voiceKey:'pearl-plumbing-fixed'}
 :{speaker:'resident',text:'The pipes are knocking like they owe somebody money. Can you check the valve?',emotion:'angry',voiceKey:'pearl-plumbing-broken'};
 if(intent==='ask-elevator')return {speaker:'resident',text:'That elevator keeps promising me a penthouse. This building only has four floors!',emotion:'surprised',voiceKey:'pearl-elevator'};
 if(intent==='joke')return {speaker:'resident',text:'If the ghost in these pipes pays rent, it can stay. Otherwise, it has to go!',emotion:'laugh',voiceKey:'pearl-joke'};
 return {speaker:'resident',text:'Come back soon. And tell that elevator to mind its business!',emotion:'nod',voiceKey:'pearl-goodbye'};
}
export function rememberResidentEvent(memory:ResidentMemory,event:'plumbing-fixed'|'elevator-investigated'|'friendly-visit',timestamp:string):ResidentMemory{
 if(memory.flags.includes(event))return memory;
 return {...memory,flags:[...memory.flags,event],relationship:Math.min(100,memory.relationship+(event==='plumbing-fixed'?15:5)),lastConversationAt:timestamp};
}
export interface DialogueVoicePort{speak:(text:string,voiceKey:string)=>Promise<void>;stop:()=>void}
export interface ResidentMemoryPort{load:(residentId:string,playerId:string)=>Promise<ResidentMemory|null>;save:(memory:ResidentMemory)=>Promise<void>}
// VoicePort is optional: captions and choices must work even without speech or microphone permission.
// MemoryPort requires authenticated persistence and server-side ownership checks.
