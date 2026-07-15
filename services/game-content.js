const EQUIPMENT=[
  {id:'solar-gauntlet',name:'Solar Gauntlet',slot:'primary',category:'energy',rarity:'rare',power:18,range:12,cooldownMs:550,energyCost:8,effects:['solar-burst','stagger'],games:['street-verse','battlefront-zero'],nonLethal:false},
  {id:'prism-shield',name:'Prism Shield',slot:'defense',category:'shield',rarity:'uncommon',power:0,block:42,cooldownMs:4200,energyCost:20,effects:['damage-reduction','projectile-deflect'],games:['street-verse','battlefront-zero','yogihoo-arena'],nonLethal:true},
  {id:'gravity-hammer',name:'Gravity Hammer',slot:'primary',category:'melee',rarity:'epic',power:34,range:4,cooldownMs:1400,energyCost:18,effects:['knockback','ground-wave'],games:['street-verse','battlefront-zero'],nonLethal:false},
  {id:'holo-bow',name:'Holographic Bow',slot:'primary',category:'precision',rarity:'rare',power:24,range:55,cooldownMs:900,energyCost:10,effects:['mark-target','piercing-light'],games:['street-verse','battlefront-zero'],nonLethal:false},
  {id:'arc-projector',name:'Arc Projector',slot:'primary',category:'energy',rarity:'epic',power:16,range:20,cooldownMs:700,energyCost:12,effects:['chain-arc','slow'],games:['battlefront-zero'],nonLethal:false},
  {id:'pulse-net',name:'Pulse Net Launcher',slot:'utility',category:'control',rarity:'uncommon',power:4,range:18,cooldownMs:6000,energyCost:14,effects:['immobilize','capture'],games:['street-verse','battlefront-zero'],nonLethal:true},
  {id:'healing-beacon',name:'Ruach Healing Beacon',slot:'utility',category:'support',rarity:'rare',heal:30,radius:8,cooldownMs:12000,energyCost:24,effects:['heal-over-time','cleanse'],games:['street-verse','battlefront-zero','yogihoo-arena'],nonLethal:true},
  {id:'guardian-drone',name:'Guardian Drone',slot:'companion',category:'drone',rarity:'epic',power:10,shield:20,cooldownMs:18000,energyCost:30,effects:['scan','cover-fire','revive-assist'],games:['street-verse','battlefront-zero'],nonLethal:true},
  {id:'sonic-pulse',name:'Quantum Beat Sonic Pulse',slot:'utility',category:'audio',rarity:'rare',power:8,radius:10,cooldownMs:8500,energyCost:16,effects:['disorient','reveal'],games:['street-verse','battlefront-zero'],nonLethal:true},
  {id:'creator-toolkit',name:'Creator Toolkit',slot:'utility',category:'builder',rarity:'starter',power:0,cooldownMs:1500,energyCost:4,effects:['repair','build-cover','deploy-light'],games:['street-verse','kingdom-builders'],nonLethal:true}
];

const CLASSES=[
  {id:'guardian',name:'Guardian',role:'tank',base:{health:140,shield:80,stamina:85},passive:'steadfast',abilities:['prism-wall','team-guard','ground-anchor']},
  {id:'ranger',name:'Ranger',role:'damage',base:{health:100,shield:35,stamina:125},passive:'target-focus',abilities:['holo-mark','rapid-step','precision-burst']},
  {id:'engineer',name:'Engineer',role:'builder',base:{health:105,shield:55,stamina:95},passive:'field-repair',abilities:['deploy-turret','repair-drone','energy-bridge']},
  {id:'medic',name:'Medic',role:'healer',base:{health:110,shield:45,stamina:100},passive:'restoring-presence',abilities:['healing-beacon','cleanse-wave','revive-link']},
  {id:'scout',name:'Scout',role:'mobility',base:{health:90,shield:25,stamina:145},passive:'light-step',abilities:['phase-dash','recon-pulse','smoke-hologram']},
  {id:'creator',name:'Creator',role:'support',base:{health:100,shield:50,stamina:110},passive:'inspire',abilities:['build-stage','crowd-boost','holo-decoy']},
  {id:'mystic',name:'Mystic',role:'control',base:{health:95,shield:70,stamina:100},passive:'ruach-focus',abilities:['faith-barrier','restoration','wisdom-guard']}
];

const NPC_ARCHETYPES=[
  {id:'mentor',name:'Mentor',behaviors:['teach','quest-giver','remember-reputation'],memory:['last-lesson','player-progress','promises']},
  {id:'merchant',name:'Merchant',behaviors:['trade','restock','price-response'],memory:['purchases','returns','reputation']},
  {id:'citizen',name:'Citizen',behaviors:['patrol','socialize','react-to-events'],memory:['district-events','player-kindness','danger']},
  {id:'security',name:'District Guardian',behaviors:['patrol','deescalate','escort','report'],memory:['incidents','warnings','bans']},
  {id:'artist',name:'Creator NPC',behaviors:['perform','collaborate','teach'],memory:['collaborations','fan-level','projects']},
  {id:'mechanic',name:'Mechanic',behaviors:['repair','upgrade','tow'],memory:['vehicles','service-history','debts']}
];

const STREETVERSE_DISTRICTS=[
  {id:'creator-city',name:'Creator City',status:'playable-alpha',landmarks:['stubbs-ai-tower','creator-square','quantum-beat-club','creator-studio'],missions:['welcome-to-creator-city','restore-the-stage','first-stream','holo-delivery'],systems:['walk','drive','missions','shops','npc-dialogue','creator-events']},
  {id:'faith-quarter',name:'Faith Quarter',status:'vertical-slice',landmarks:['garden-of-restoration','wisdom-hall','lamb-plaza'],missions:['light-the-lamps','voices-of-the-community','restore-the-garden'],systems:['walk','quests','community-events','faith-deck']},
  {id:'market-district',name:'Market District',status:'vertical-slice',landmarks:['aniyah-market','holo-mall','vendor-row'],missions:['merchant-onboarding','missing-package','market-festival'],systems:['walk','drive','shops','delivery','ar-shopping']},
  {id:'arena-district',name:'Arena District',status:'planned',landmarks:['volcano-arena','laser-grid','tournament-hall'],missions:['qualifier','team-trials'],systems:['pvp','spectator','tournaments']}
];

const YOGIHOO_ELEMENTS={light:{strong:['shadow'],weak:['prism']},prism:{strong:['light'],weak:['storm']},storm:{strong:['prism'],weak:['earth']},earth:{strong:['storm'],weak:['aether']},aether:{strong:['earth'],weak:['shadow']},shadow:{strong:['aether'],weak:['light']}};
const YOGIHOO_CREATURES=[
  {id:'lumelion',name:'Lumelion',element:'light',rarity:'starter',health:110,power:18,defense:12,speed:10,abilities:['radiant-claw','courage-roar','guardian-light'],evolvesTo:'crown-lumelion',level:16},
  {id:'prism-lamb',name:'Prism Lamb',element:'prism',rarity:'starter',health:120,power:12,defense:18,speed:8,abilities:['mercy-wave','prism-wall','restoration'],evolvesTo:'royal-prism-lamb',level:16},
  {id:'storm-kite',name:'Storm Kite',element:'storm',rarity:'uncommon',health:88,power:22,defense:8,speed:18,abilities:['thunder-wing','gust-step','chain-spark'],evolvesTo:'tempest-kite',level:20},
  {id:'terra-tortoise',name:'Terra Tortoise',element:'earth',rarity:'uncommon',health:145,power:13,defense:24,speed:5,abilities:['stone-guard','root-bind','earth-pulse'],evolvesTo:'mountain-tortoise',level:20},
  {id:'aether-fox',name:'Aether Fox',element:'aether',rarity:'rare',health:92,power:21,defense:10,speed:20,abilities:['phase-tail','memory-mirror','aether-dash'],evolvesTo:'oracle-fox',level:24},
  {id:'shade-panther',name:'Shade Panther',element:'shadow',rarity:'rare',health:98,power:24,defense:9,speed:19,abilities:['shadow-step','night-pounce','silence-field'],evolvesTo:'eclipse-panther',level:24}
];

const QUESTS=[
  {id:'welcome-to-creator-city',gameId:'street-verse',district:'creator-city',title:'Welcome to Creator City',steps:['meet-mentor','visit-stubbs-ai-tower','choose-class','equip-starter-item'],rewards:{xp:250,currency:100,items:['creator-toolkit']}},
  {id:'restore-the-stage',gameId:'street-verse',district:'creator-city',title:'Restore the Stage',steps:['collect-parts','repair-lights','protect-crew','start-show'],rewards:{xp:500,currency:250,items:['sonic-pulse']}},
  {id:'first-stream',gameId:'street-verse',district:'creator-city',title:'Your First Stream',steps:['enter-studio','configure-overlay','invite-npc-guests','broadcast'],rewards:{xp:400,currency:200,badge:'creator-live'}},
  {id:'yogihoo-first-bond',gameId:'yogihoo-arena',title:'The First Bond',steps:['choose-creature','complete-tutorial','win-practice-battle'],rewards:{xp:300,currency:150,cardPack:'starter-light-prism'}},
  {id:'yogihoo-arena-trials',gameId:'yogihoo-arena',title:'Arena Trials',steps:['win-three-elements','build-six-card-deck','complete-ranked-placement'],rewards:{xp:1000,currency:500,badge:'arena-initiate'}}
];

function getEquipment(gameId){return gameId?EQUIPMENT.filter(item=>item.games.includes(gameId)):EQUIPMENT;}
function getClass(classId){return CLASSES.find(item=>item.id===classId)||null;}
function getCreature(creatureId){return YOGIHOO_CREATURES.find(item=>item.id===creatureId)||null;}
function elementMultiplier(attacker,defender){const rules=YOGIHOO_ELEMENTS[attacker];if(!rules)return 1;if(rules.strong.includes(defender))return 1.25;if(rules.weak.includes(defender))return .8;return 1;}
function calculateEquipmentScore(item){return Math.round((item.power||0)*2+(item.block||0)+(item.heal||0)+(item.range||0)/4-((item.cooldownMs||0)/1000));}
function validateLoadout({gameId,classId,equipmentIds=[]}){const klass=getClass(classId);if(!klass)return{valid:false,errors:['Unknown class.']};const items=equipmentIds.map(id=>EQUIPMENT.find(x=>x.id===id)).filter(Boolean);const errors=[];if(items.length!==equipmentIds.length)errors.push('Unknown equipment item.');if(items.some(item=>!item.games.includes(gameId)))errors.push('Equipment is not allowed in this game.');const slots=new Set();for(const item of items){if(slots.has(item.slot)&&item.slot!=='utility')errors.push(`Duplicate ${item.slot} slot.`);slots.add(item.slot);}return{valid:errors.length===0,errors,class:klass,items,totalScore:items.reduce((sum,item)=>sum+calculateEquipmentScore(item),0)};}

module.exports={EQUIPMENT,CLASSES,NPC_ARCHETYPES,STREETVERSE_DISTRICTS,YOGIHOO_ELEMENTS,YOGIHOO_CREATURES,QUESTS,getEquipment,getClass,getCreature,elementMultiplier,calculateEquipmentScore,validateLoadout};