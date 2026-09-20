export type MartialStyleTier='core'|'extended'|'mythic'
export type MartialStyleLane='green-dragon'|'black-dragon'|'neutral'

export type MartialStyle={
  id:string
  name:string
  animal:string
  lane:MartialStyleLane
  tier:MartialStyleTier
  evidence:'user-canon'|'documented-inspiration'|'game-reconstruction'
  focus:string[]
  gameplay:{
    speed:number
    balance:number
    reach:number
    evasion:number
    control:number
    power:number
  }
  oneHandPattern:string
  special:string
}

export const GREEN_DRAGON_ANIMAL_STYLES:MartialStyle[]=[
  {id:'gd-panther',name:'Panther Style',animal:'panther',lane:'green-dragon',tier:'core',evidence:'user-canon',focus:['burst movement','angle changes','pressure'],gameplay:{speed:9,balance:6,reach:6,evasion:8,control:6,power:7},oneHandPattern:'TAP → SWIPE → HOLD',special:'Shadow Burst'},
  {id:'gd-leopard',name:'Leopard Style',animal:'leopard',lane:'green-dragon',tier:'core',evidence:'user-canon',focus:['fast combinations','precision','mobility'],gameplay:{speed:9,balance:7,reach:6,evasion:8,control:7,power:6},oneHandPattern:'TAP → TAP → SWIPE',special:'Leopard Rush'},
  {id:'gd-boar',name:'Boar Style',animal:'boar',lane:'green-dragon',tier:'core',evidence:'user-canon',focus:['forward pressure','stability','guard'],gameplay:{speed:5,balance:9,reach:5,evasion:4,control:7,power:9},oneHandPattern:'HOLD → RELEASE',special:'Iron Charge'},
  {id:'gd-snake',name:'Snake Style',animal:'snake',lane:'green-dragon',tier:'core',evidence:'user-canon',focus:['timing','feints','precision'],gameplay:{speed:8,balance:6,reach:7,evasion:8,control:9,power:5},oneHandPattern:'SWIPE → TAP',special:'Coil Feint'},
  {id:'gd-mantis',name:'Mantis Style',animal:'mantis',lane:'green-dragon',tier:'core',evidence:'user-canon',focus:['counter windows','control','rhythm'],gameplay:{speed:8,balance:7,reach:6,evasion:7,control:10,power:5},oneHandPattern:'PARRY BUTTON → TAP',special:'Mantis Counter'},
  {id:'gd-crane',name:'Crane Style',animal:'crane',lane:'green-dragon',tier:'core',evidence:'user-canon',focus:['balance','distance','evasion'],gameplay:{speed:7,balance:10,reach:8,evasion:9,control:7,power:4},oneHandPattern:'HOLD GUARD → SWIPE',special:'Crane Step'},
  {id:'gd-eagle',name:'Eagle Style',animal:'eagle',lane:'green-dragon',tier:'core',evidence:'user-canon',focus:['range awareness','positioning','target focus'],gameplay:{speed:8,balance:7,reach:9,evasion:7,control:8,power:6},oneHandPattern:'FOCUS → TAP',special:'Eagle Focus'},
  {id:'gd-tiger',name:'Tiger Style',animal:'tiger',lane:'green-dragon',tier:'core',evidence:'user-canon',focus:['power','pressure','confidence'],gameplay:{speed:7,balance:8,reach:6,evasion:5,control:6,power:10},oneHandPattern:'HOLD POWER → RELEASE',special:'Tiger Roar'},
  {id:'gd-dragon',name:'Dragon Style',animal:'dragon',lane:'green-dragon',tier:'mythic',evidence:'user-canon',focus:['adaptation','stance switching','all-round mastery'],gameplay:{speed:8,balance:9,reach:8,evasion:8,control:9,power:9},oneHandPattern:'STYLE WHEEL → CONTEXT ACTION',special:'Dragon Shift'},

  // Extensible game reconstructions inspired by wider animal-martial-arts traditions.
  {id:'gd-monkey',name:'Monkey Style',animal:'monkey',lane:'green-dragon',tier:'extended',evidence:'game-reconstruction',focus:['unpredictability','mobility','rhythm'],gameplay:{speed:9,balance:8,reach:5,evasion:10,control:6,power:4},oneHandPattern:'SWIPE → SWIPE',special:'Monkey Trick'},
  {id:'gd-bear',name:'Bear Style',animal:'bear',lane:'green-dragon',tier:'extended',evidence:'game-reconstruction',focus:['stability','guard','power'],gameplay:{speed:4,balance:10,reach:6,evasion:3,control:7,power:10},oneHandPattern:'HOLD GUARD → HOLD POWER',special:'Bear Wall'},
  {id:'gd-wolf',name:'Wolf Style',animal:'wolf',lane:'green-dragon',tier:'extended',evidence:'game-reconstruction',focus:['tracking','team bonuses','pressure'],gameplay:{speed:8,balance:7,reach:6,evasion:7,control:8,power:7},oneHandPattern:'FOCUS → SWIPE',special:'Pack Instinct'},
  {id:'gd-hawk',name:'Hawk Style',animal:'hawk',lane:'green-dragon',tier:'extended',evidence:'game-reconstruction',focus:['spacing','reaction','movement'],gameplay:{speed:9,balance:8,reach:9,evasion:8,control:7,power:5},oneHandPattern:'FOCUS → SWIPE',special:'Hawk Line'},
  {id:'gd-ape',name:'Ape Style',animal:'ape',lane:'green-dragon',tier:'extended',evidence:'game-reconstruction',focus:['strength','balance','guard breaks'],gameplay:{speed:5,balance:9,reach:7,evasion:4,control:6,power:10},oneHandPattern:'HOLD → TAP',special:'Ape Force'},
  {id:'gd-fox',name:'Fox Style',animal:'fox',lane:'green-dragon',tier:'extended',evidence:'game-reconstruction',focus:['feints','evasion','mind games'],gameplay:{speed:9,balance:7,reach:5,evasion:10,control:8,power:4},oneHandPattern:'FEINT → SWIPE',special:'Fox Switch'},
]

export const BLACK_DRAGON_GAME_STYLES:MartialStyle[]=[
  {id:'bd-dante-eclectic',name:'Black Dragon Eclectic',animal:'dragon',lane:'black-dragon',tier:'core',evidence:'documented-inspiration',focus:['eclectic training','pressure','adaptation'],gameplay:{speed:7,balance:8,reach:7,evasion:6,control:8,power:8},oneHandPattern:'STYLE WHEEL → CONTEXT ACTION',special:'Black Dragon Flow'},
  {id:'bd-tiger-mirror',name:'Tiger Mirror',animal:'tiger',lane:'black-dragon',tier:'core',evidence:'documented-inspiration',focus:['intensity meter','timing','counter pressure'],gameplay:{speed:8,balance:7,reach:6,evasion:6,control:7,power:9},oneHandPattern:'HOLD FOCUS → COUNTER',special:'Mirror State'},
]

export const MARTIAL_STYLE_SYSTEM={
  all:[...GREEN_DRAGON_ANIMAL_STYLES,...BLACK_DRAGON_GAME_STYLES],
  rules:{
    nonlethalByDefault:true,
    historicalClaimsRequireEvidenceLabel:true,
    userCanonAllowedWhenMarkedAsReconstruction:true,
    oneHandCompatible:true,
    noRealWorldInjuryInstruction:true,
    styleMasteryPersists:true,
  },
  progression:{
    novice:0,
    student:250,
    fighter:750,
    instructor:1800,
    master:4000,
    grandmaster:8000,
  },
} as const
