export const SOCIAL_TABLE_GAMES = {
  policy: 'Social/skill play only. No real-money wagering, no cash buy-ins, no Holo Credit betting, no Beans betting, and no gambling payout logic.',
  games: [
    {id:'social-poker',name:'TRYAMM Social Poker',modes:['Texas Holdem-style social table','tournament points','private friends table'],rewards:['XP','Beans','cosmetics','trophies','membership perks']},
    {id:'spades',name:'Spades',modes:['2v2','family table','agency table'],rewards:['XP','Beans','team reputation']},
    {id:'hearts',name:'Hearts',modes:['classic','quick match'],rewards:['XP','Beans','cosmetics']},
    {id:'bid-whist',name:'Bid Whist',modes:['2v2','club ladder'],rewards:['XP','Beans','club reputation']},
    {id:'blackjack-trainer',name:'21 Strategy Trainer',modes:['practice-only','probability lessons'],rewards:['XP','education badges'],note:'No wagering or cash-out.'},
    {id:'solitaire',name:'Holo Solitaire',modes:['classic','timed'],rewards:['XP','daily challenge badges']},
    {id:'pool-8',name:'Holo Pool 8-Ball',modes:['1v1','doubles','venue table'],rewards:['XP','Beans','trophies']},
    {id:'pool-9',name:'Holo Pool 9-Ball',modes:['1v1','league'],rewards:['XP','Beans','season ranking']}
  ],
  integration: ['GameVerse','HoloArena','family/agency rooms','spectator mode','Movie Box highlights','World Memory','accessibility controls'],
  antiAbuse: ['server-authoritative match result','anti-cheat','no paid competitive advantage','no client-minted rewards']
} as const
