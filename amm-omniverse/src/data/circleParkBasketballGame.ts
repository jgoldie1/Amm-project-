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
