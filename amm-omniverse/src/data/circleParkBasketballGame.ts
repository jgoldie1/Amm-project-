export const CIRCLE_PARK_BASKETBALL={
 courtId:'circle-park-basketball',
 formats:['shootaround','1v1','2v2','3v3'] as const,
 winScore:21,
 winBy:2,
 moves:{
  jumper:{points:2,baseMake:.46,staminaCost:4},
  layup:{points:2,baseMake:.64,staminaCost:5},
  dunk:{points:2,baseMake:.78,staminaCost:8},
  three:{points:3,baseMake:.35,staminaCost:5},
  freeThrow:{points:1,baseMake:.72,staminaCost:1},
 },
 andOne:{enabled:true,contactChance:.24,requiresMadeFieldGoal:true,bonusFreeThrows:1},
 safety:{noRealMoneyWagering:true,serverValidatedRewards:true},
} as const
export type CircleParkBasketballMove=keyof typeof CIRCLE_PARK_BASKETBALL.moves
export const requestBasketballReward=(detail:Record<string,unknown>)=>window.dispatchEvent(new CustomEvent('tryamm:circle-park-basketball-reward-request',{detail:{...detail,serverValidate:true}}))


export const CIRCLE_PARK_DUNK_STYLES=[
 {id:'power-two-hand',label:'Two-Hand Power',makeModifier:.06,staminaCost:1,highlight:1},
 {id:'tomahawk-one-hand',label:'One-Hand Tomahawk',makeModifier:.02,staminaCost:2,highlight:2},
 {id:'windmill',label:'Windmill',makeModifier:-.04,staminaCost:3,highlight:3},
 {id:'reverse',label:'Reverse',makeModifier:-.02,staminaCost:2,highlight:2},
 {id:'360',label:'360',makeModifier:-.07,staminaCost:4,highlight:4},
 {id:'double-clutch',label:'Double-Clutch',makeModifier:-.05,staminaCost:3,highlight:3},
 {id:'self-alley-oop',label:'Self Alley-Oop',makeModifier:-.08,staminaCost:4,highlight:4},
 {id:'teammate-alley-oop',label:'Teammate Alley-Oop',makeModifier:-.06,staminaCost:3,highlight:4},
 {id:'off-backboard-alley-oop',label:'Off-Backboard Alley-Oop',makeModifier:-.10,staminaCost:5,highlight:5},
 {id:'reverse-windmill',label:'Reverse Windmill',makeModifier:-.11,staminaCost:5,highlight:5},
 {id:'ft-one-hand-1985',label:'1985 One-Hand Free-Throw Glide',makeModifier:-.13,staminaCost:6,highlight:5},
 {id:'ft-double-clutch-1988',label:"Chicago '88 Double-Clutch Free-Throw Glide",makeModifier:-.15,staminaCost:7,highlight:5},
] as const
export type CircleParkDunkStyleId=typeof CIRCLE_PARK_DUNK_STYLES[number]['id']


export const CIRCLE_PARK_DUNK_HERITAGE_NOTE={
 source:'NBA historical record',
 homageOnly:true,
 noEndorsement:true,
 note:"Free-throw-line styles are historical basketball homages. They do not imply Michael Jordan, NBA, Bulls, or Nike endorsement."
} as const
