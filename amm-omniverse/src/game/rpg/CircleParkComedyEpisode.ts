export type DialogueChoice={id:string;label:string;reply:string;reaction?:string;relationshipDelta?:number;clue?:string};
export type DialogueScene={id:string;location:string;speaker:string;line:string;choices:DialogueChoice[]};
export type EasterEgg={id:string;location:string;hint:string;reveal:string;rewardXp:number};
export const circleParkComedyScenes:DialogueScene[]=[
{id:'lobby',location:'Circle Park Apartments lobby',speaker:'Ms. Pearl',line:"BJ, thank goodness! My sink is making a sound like it's auditioning for a jazz band.",choices:[
{id:'jazz',label:'Ask if the sink takes requests',reply:"Only if you can get it to play something besides drip, drip, drip!",reaction:'😂',relationshipDelta:5},
{id:'professional',label:'Promise a professional inspection',reply:"Good. Last handyman fixed my doorbell and now it announces the weather.",reaction:'👍',relationshipDelta:8},
{id:'investigate',label:'Ask when the trouble started',reply:"Right after the elevator started stopping on a floor we don't have.",clue:'ghost-floor'}]},
{id:'elevator',location:'Elevator to floor 2',speaker:'Elevator Voice',line:"Welcome aboard. This elevator is running on confidence and a very old inspection sticker.",choices:[
{id:'stairs',label:'Ask whether the stairs are safer',reply:"The stairs have requested a vacation.",reaction:'😮'},
{id:'button',label:'Press floor two',reply:"Second floor. Please keep all dramatic entrances inside the elevator.",reaction:'👍'}]},
{id:'resident',location:'Second-floor apartment',speaker:'Ms. Pearl',line:"The pipes are knocking, the faucet is singing, and my neighbor says it's a ghost. I say it's overdue maintenance.",choices:[
{id:'ghost',label:'Ask the ghost to pay rent',reply:"If it pays rent, tell it the third is due next week!",reaction:'😂',relationshipDelta:4},
{id:'pipes',label:'Inspect the plumbing',reply:"That's what I hired you for, baby. Don't let the pipes negotiate.",clue:'loose-valve',relationshipDelta:6}]},
{id:'repair',location:'Kitchen utility access',speaker:'BJ',line:"Well, there's the problem. Somebody installed this valve backwards.",choices:[
{id:'repair-carefully',label:'Shut off water and repair the valve',reply:"The singing stops. Ms. Pearl applauds: 'Now THAT'S my kind of remix!'",reaction:'🎉',clue:'repair-complete'},
{id:'inspect-first',label:'Check the maintenance blueprint first',reply:"A handwritten note says: 'Never trust the third pipe from the left.'",clue:'blueprint'}]},
{id:'ending',location:'Second-floor hallway',speaker:'Ms. Pearl',line:"BJ, you saved my kitchen. Now, about that elevator that keeps saying 'penthouse'...",choices:[
{id:'next-episode',label:'Promise to investigate next time',reply:"Bring your tools. And maybe a camera crew.",reaction:'😂',clue:'next-episode'},
{id:'celebrate',label:'Take a victory bow',reply:"Don't get too famous to fix my sink!",reaction:'🎉'}]}
];
export const circleParkEasterEggs:EasterEgg[]=[
{id:'sun-ra-radio',location:'Lobby radio',hint:'Tune the old radio while waiting for the elevator.',reveal:'A cosmic jazz station broadcasts: "Space is the place... but the plumber is late."',rewardXp:5},
{id:'phantom-floor',location:'Elevator panel',hint:'Look for the worn button above floor four.',reveal:'A flickering star icon hints at a future secret rooftop mission.',rewardXp:10},
{id:'rubber-duck',location:'Apartment bathroom',hint:'Inspect the tiny rubber duck beside the sink.',reveal:'The duck squeaks a suspiciously perfect musical note.',rewardXp:5},
{id:'blueprint-signature',location:'Kitchen blueprint',hint:'Read the handwritten note behind the pipe diagram.',reveal:'A maintenance signature points toward the next building mystery.',rewardXp:5}
];
export function getComedyScene(id:string):DialogueScene|undefined{return circleParkComedyScenes.find(s=>s.id===id)}
export function getEasterEgg(id:string):EasterEgg|undefined{return circleParkEasterEggs.find(e=>e.id===id)}
export function chooseDialogue(sceneId:string,choiceId:string){const scene=getComedyScene(sceneId);const choice=scene?.choices.find(c=>c.id===choiceId);return choice?{scene,choice}:null}
