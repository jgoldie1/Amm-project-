// Mycelium Dialogue Director v1. Deterministic fictional NPC conversations.
// No AI cloning, external dialogue service, payment, warehouse mutation, or XP grants.
import {MYCELIUM_SCENES,MYCELIUM_BRANCH_KEY} from './warehouse-mycelium-scenes.mjs';
export const MYCELIUM_DIALOGUE_KEY='tryamm.streetverse.mycelium-dialogue.v1';
export const DIALOGUES=Object.freeze({
 'storefront-community':{
  opening:'greet',
  nodes:{
   greet:{speaker:'Chicago shopkeeper',line:'BJ! You got our records and shirts here safely. The block is watching what happens next. How should we support the neighbors?',choices:[
    {id:'listen',label:'Ask neighbors what they need',next:'listen'},
    {id:'plan',label:'Plan the next delivery route',next:'plan'}]},
   listen:{speaker:'Chicago shopkeeper',line:'That is how you build trust. The community center needs a reliable pickup window, and folks want to know who handles complaints.',choices:[{id:'confirm',label:'Write down the request and follow up',next:'close'}]},
   plan:{speaker:'Chicago shopkeeper',line:'Start with the community center. Keep a record of each handoff and make sure the driver can take an accessible route.',choices:[{id:'confirm',label:'Create a fictional route plan',next:'close'}]},
   close:{speaker:'Chicago shopkeeper',line:'Then we have a plan. I’ll introduce you to the neighborhood coordinator in the next chapter.',objective:'Meet the community coordinator (future mission preview)',end:true}
  }
 },
 'musicverse-showcase':{
  opening:'greet',
  nodes:{
   greet:{speaker:'All American Records promoter',line:'BJ, the showcase shirts arrived! We could bring Christian rap, gospel, house and independent artists onto one stage. But rights come first. What should we do?',choices:[
    {id:'rights',label:'Confirm music and likeness permissions',next:'rights'},
    {id:'artists',label:'Invite independent artists',next:'artists'}]},
   rights:{speaker:'All American Records promoter',line:'Exactly. We need each artist’s agreement, song permissions and venue clearance before an actual show or stream.',choices:[{id:'plan',label:'Draft the showcase checklist',next:'close'}]},
   artists:{speaker:'All American Records promoter',line:'We can welcome artists across genres with equal terms. First ask what they want, and give them approval over their performances and promotion.',choices:[{id:'plan',label:'Prepare the voluntary artist invitations',next:'close'}]},
   close:{speaker:'All American Records promoter',line:'That is our next chapter: a fictional showcase planning session. No artist is booked, paid or licensed by this dialogue.',objective:'Prepare artist and music-rights checklist (future mission preview)',end:true}
  }
 },
 'warehouse-training':{
  opening:'greet',
  nodes:{
   greet:{speaker:'Virtual warehouse supervisor',line:'Nice handoff, BJ. Now the warehouse needs someone who can catch stock mistakes before a customer gets the wrong parcel.',choices:[
    {id:'scan',label:'Learn the barcode receiving check',next:'scan'},
    {id:'safety',label:'Check food storage and safety',next:'safety'}]},
   scan:{speaker:'Virtual warehouse supervisor',line:'Match the item, merchant and lot to the warehouse receipt. A virtual stock count cannot override the real warehouse system.',choices:[{id:'finish',label:'Record a practice inventory hold',next:'close'}]},
   safety:{speaker:'Virtual warehouse supervisor',line:'Yahavah Grocery needs separate temperature and expiry checks. If the cold-chain evidence is missing, place the fictional stock on HOLD.',choices:[{id:'finish',label:'Record a practice safety hold',next:'close'}]},
   close:{speaker:'Virtual warehouse supervisor',line:'Good decision. We will practice a return inspection next. Real inventory stays untouched.',objective:'Practice returns and stock quarantine (future mission preview)',end:true}
  }
 }
});
export function initialDialogue(branch){
 if(!Object.hasOwn(DIALOGUES,branch))return null;
 return {schema:1,branch,node:DIALOGUES[branch].opening,history:[],completed:false,objective:null};
}
export function validateDialogue(s){
 if(!s||s.schema!==1||!Object.hasOwn(DIALOGUES,s.branch)||!Array.isArray(s.history)||s.history.length>6)return false;
 const graph=DIALOGUES[s.branch];let node=graph.opening;
 for(const h of s.history){
  const chosen=graph.nodes[node]?.choices?.find(c=>c.id===h);
  if(!chosen)return false;
  node=chosen.next;
 }
 const current=graph.nodes[node];
 return s.node===node&&s.completed===Boolean(current.end)&&s.objective===(current.objective||null);
}
export function advanceDialogue(s,choiceId){
 if(!validateDialogue(s))throw Error('Invalid dialogue progress');
 if(s.completed) return s;
 const choice=DIALOGUES[s.branch].nodes[s.node].choices.find(c=>c.id===choiceId);
 if(!choice)throw Error('Choose an available dialogue response');
 const next=DIALOGUES[s.branch].nodes[choice.next];
 return {schema:1,branch:s.branch,node:choice.next,history:[...s.history,choiceId],completed:Boolean(next.end),objective:next.objective||null};
}
export function getDialogueNode(s){
 return validateDialogue(s)?DIALOGUES[s.branch].nodes[s.node]:null;
}
export function loadDialogue(storage,branch,missionComplete){
 if(!missionComplete||!Object.hasOwn(DIALOGUES,branch))return null;
 try{
  const saved=JSON.parse(storage.getItem(MYCELIUM_DIALOGUE_KEY)||'null');
  if(saved?.branch===branch&&validateDialogue(saved))return saved;
 }catch{}
 return initialDialogue(branch);
}
export function storeDialogue(storage,s){
 if(!validateDialogue(s))throw Error('Invalid dialogue state');
 storage.setItem(MYCELIUM_DIALOGUE_KEY,JSON.stringify(s));return s;
}
export function resetDialogue(storage){storage.removeItem(MYCELIUM_DIALOGUE_KEY);}
export function selectDialogueFromScene(storage,completed){
 if(!completed)return null;
 const branch=storage.getItem(MYCELIUM_BRANCH_KEY);
 return Object.hasOwn(MYCELIUM_SCENES,branch)?loadDialogue(storage,branch,completed):null;
}
