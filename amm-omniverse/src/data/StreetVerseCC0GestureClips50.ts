/** 50 licensed Quaternius GLB animation CANDIDATES; not yet retargeted to BJ. 
 *  Original upstream: https://quaternius.itch.io/universal-animation-library and
 *  https://quaternius.itch.io/universal-animation-library-2 (CC0 1.0).
 *  File mirrors pinned to elderforge commit bb2ce469f0ab2ccfc487faef55550ba07fae2483.
 *  Each pack is ONE multi-clip GLB (~8MB); do not preload on mobile.
 *  These are identified source clip names; loader verifies exact embedded names.
 *  Shadow Box/boxing and combat/weapon entitlement integration excluded.
 */
export type StreetVerseCC0ClipCategory='social'|'travel'|'work'|'sport'|'reaction'|'fantasy'
export type StreetVerseCC0Pack='UAL1'|'UAL2'
export type StreetVerseCC0Clip={id:string;pack:StreetVerseCC0Pack;clip:string;label:string;category:StreetVerseCC0ClipCategory}
export const STREETVERSE_CC0_GESTURE_PACKS:Record<StreetVerseCC0Pack,{name:string;url:string;bytes:number;license:'CC0-1.0';origin:string}>={
 UAL1:{name:'Quaternius Universal Animation Library 1',url:'https://raw.githubusercontent.com/Barbatos6669/elderforge/bb2ce469f0ab2ccfc487faef55550ba07fae2483/assets/animations/universal_animation_library_1/UAL1_Standard.glb',bytes:7618436,license:'CC0-1.0',origin:'https://quaternius.itch.io/universal-animation-library'},
 UAL2:{name:'Quaternius Universal Animation Library 2',url:'https://raw.githubusercontent.com/Barbatos6669/elderforge/bb2ce469f0ab2ccfc487faef55550ba07fae2483/assets/animations/universal_animation_library_2/UAL2_Standard.glb',bytes:8091444,license:'CC0-1.0',origin:'https://quaternius.itch.io/universal-animation-library-2'},
}
export const STREETVERSE_CC0_GESTURES_50:readonly StreetVerseCC0Clip[]=[
 {id:'cc0-idle-loop',pack:'UAL1',clip:'Idle_Loop',label:'Idle & breathe',category:'social'},
 {id:'cc0-walk-loop',pack:'UAL1',clip:'Walk_Loop',label:'Everyday walk',category:'travel'},
 {id:'cc0-walk-formal-loop',pack:'UAL1',clip:'Walk_Formal_Loop',label:'Formal walk',category:'travel'},
 {id:'cc0-jog-fwd-loop',pack:'UAL1',clip:'Jog_Fwd_Loop',label:'Jog forward',category:'travel'},
 {id:'cc0-sprint-loop',pack:'UAL1',clip:'Sprint_Loop',label:'Sprint',category:'travel'},
 {id:'cc0-crouch-idle-loop',pack:'UAL1',clip:'Crouch_Idle_Loop',label:'Crouch and wait',category:'travel'},
 {id:'cc0-crouch-fwd-loop',pack:'UAL1',clip:'Crouch_Fwd_Loop',label:'Crouch walk',category:'travel'},
 {id:'cc0-jump-start',pack:'UAL1',clip:'Jump_Start',label:'Jump takeoff',category:'travel'},
 {id:'cc0-jump-loop',pack:'UAL1',clip:'Jump_Loop',label:'Airborne jump',category:'travel'},
 {id:'cc0-jump-land',pack:'UAL1',clip:'Jump_Land',label:'Land from jump',category:'travel'},
 {id:'cc0-roll',pack:'UAL1',clip:'Roll',label:'Ground roll',category:'travel'},
 {id:'cc0-hit-chest',pack:'UAL1',clip:'Hit_Chest',label:'Chest hit reaction',category:'reaction'},
 {id:'cc0-hit-head',pack:'UAL1',clip:'Hit_Head',label:'Head hit reaction',category:'reaction'},
 {id:'cc0-death01',pack:'UAL1',clip:'Death01',label:'Fall reaction',category:'reaction'},
 {id:'cc0-swim-idle-loop',pack:'UAL1',clip:'Swim_Idle_Loop',label:'Tread water',category:'sport'},
 {id:'cc0-swim-fwd-loop',pack:'UAL1',clip:'Swim_Fwd_Loop',label:'Swim forward',category:'sport'},
 {id:'cc0-interact',pack:'UAL1',clip:'Interact',label:'Interact with prop',category:'work'},
 {id:'cc0-pickup-table',pack:'UAL1',clip:'PickUp_Table',label:'Pick up from table',category:'work'},
 {id:'cc0-fixing-kneeling',pack:'UAL1',clip:'Fixing_Kneeling',label:'Kneel and repair',category:'work'},
 {id:'cc0-sitting-enter',pack:'UAL1',clip:'Sitting_Enter',label:'Sit down',category:'social'},
 {id:'cc0-sitting-exit',pack:'UAL1',clip:'Sitting_Exit',label:'Stand up from seat',category:'social'},
 {id:'cc0-sitting-idle',pack:'UAL1',clip:'Sitting_Idle',label:'Seated idle',category:'social'},
 {id:'cc0-sitting-talking',pack:'UAL1',clip:'Sitting_Talking',label:'Seated conversation',category:'social'},
 {id:'cc0-idle-talking-loop',pack:'UAL1',clip:'Idle_Talking_Loop',label:'Standing conversation',category:'social'},
 {id:'cc0-dance-loop',pack:'UAL1',clip:'Dance_Loop',label:'Freestyle dance',category:'social'},
 {id:'cc0-idle-torch-loop',pack:'UAL1',clip:'Idle_Torch_Loop',label:'Hold torch',category:'work'},
 {id:'cc0-driving-loop',pack:'UAL1',clip:'Driving_Loop',label:'Drive seated',category:'travel'},
 {id:'cc0-push',pack:'UAL1',clip:'Push',label:'Push object',category:'work'},
 {id:'cc0-spell-simple-enter',pack:'UAL1',clip:'Spell_Simple_Enter',label:'Begin fantasy gesture',category:'fantasy'},
 {id:'cc0-spell-simple-exit',pack:'UAL1',clip:'Spell_Simple_Exit',label:'End fantasy gesture',category:'fantasy'},
 {id:'cc0-farm-harvest',pack:'UAL2',clip:'Farm_Harvest',label:'Harvest crops',category:'work'},
 {id:'cc0-farm-plantseed',pack:'UAL2',clip:'Farm_PlantSeed',label:'Plant seeds',category:'work'},
 {id:'cc0-farm-watering',pack:'UAL2',clip:'Farm_Watering',label:'Water plants',category:'work'},
 {id:'cc0-treechopping-loop',pack:'UAL2',clip:'TreeChopping_Loop',label:'Chop wood',category:'work'},
 {id:'cc0-climbup-1m',pack:'UAL2',clip:'ClimbUp_1m',label:'Climb ledge',category:'travel'},
 {id:'cc0-slide-start',pack:'UAL2',clip:'Slide_Start',label:'Begin slide',category:'travel'},
 {id:'cc0-slide-loop',pack:'UAL2',clip:'Slide_Loop',label:'Slide movement',category:'travel'},
 {id:'cc0-slide-exit',pack:'UAL2',clip:'Slide_Exit',label:'Finish slide',category:'travel'},
 {id:'cc0-ninjajump-start',pack:'UAL2',clip:'NinjaJump_Start',label:'Parkour leap takeoff',category:'travel'},
 {id:'cc0-ninjajump-idle-loop',pack:'UAL2',clip:'NinjaJump_Idle_Loop',label:'Parkour airborne pose',category:'travel'},
 {id:'cc0-ninjajump-land',pack:'UAL2',clip:'NinjaJump_Land',label:'Parkour landing',category:'travel'},
 {id:'cc0-walk-carry-loop',pack:'UAL2',clip:'Walk_Carry_Loop',label:'Walk carrying item',category:'work'},
 {id:'cc0-consume',pack:'UAL2',clip:'Consume',label:'Eat or drink',category:'social'},
 {id:'cc0-yes',pack:'UAL2',clip:'Yes',label:'Say yes with gesture',category:'social'},
 {id:'cc0-idle-no-loop',pack:'UAL2',clip:'Idle_No_Loop',label:'Disagree gesture',category:'social'},
 {id:'cc0-chest-open',pack:'UAL2',clip:'Chest_Open',label:'Open chest',category:'work'},
 {id:'cc0-laytoidle',pack:'UAL2',clip:'LayToIdle',label:'Get up from lying down',category:'social'},
 {id:'cc0-idle-lantern-loop',pack:'UAL2',clip:'Idle_Lantern_Loop',label:'Hold lantern',category:'work'},
 {id:'cc0-idle-foldarms-loop',pack:'UAL2',clip:'Idle_FoldArms_Loop',label:'Fold arms',category:'social'},
 {id:'cc0-idle-talkingphone-loop',pack:'UAL2',clip:'Idle_TalkingPhone_Loop',label:'Talk on phone',category:'social'},
]
export const STREETVERSE_CC0_GESTURE_STATUS='external-glb-retarget-required' as const
export function findStreetVerseCC0Gesture(id:string){return STREETVERSE_CC0_GESTURES_50.find(clip=>clip.id===id)}
