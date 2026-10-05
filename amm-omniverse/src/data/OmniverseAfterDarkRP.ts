export type AfterDarkRPIntent='flirt'|'romance'|'nightlife'|'attraction'|'date'|'couple-dance'|'kiss'|'embrace'|'private-conversation'|'relationship-drama'|'reconcile'|'adult-comedy'|'creator-scene'
export type AfterDarkEmojiToken={emoji:string;label:string;intents:AfterDarkRPIntent[];meaning:string}

export const AFTER_DARK_EMOJI_TOKENS:readonly AfterDarkEmojiToken[]=[
 {emoji:'😈',label:'mischief',intents:['flirt','adult-comedy'],meaning:'playful adult-only flirt/mischief'},
 {emoji:'🔥',label:'chemistry',intents:['attraction','flirt'],meaning:'strong attraction/chemistry'},
 {emoji:'❤️‍🔥',label:'passion',intents:['romance','attraction'],meaning:'passionate romantic tone'},
 {emoji:'😘',label:'kiss',intents:['flirt','kiss'],meaning:'consensual kiss/flirt'},
 {emoji:'👄',label:'kiss cue',intents:['kiss','flirt'],meaning:'non-explicit romantic kiss cue'},
 {emoji:'🥂',label:'date night',intents:['date','nightlife'],meaning:'adult date/nightlife tone'},
 {emoji:'🌙',label:'after dark',intents:['nightlife','creator-scene'],meaning:'after-dark setting'},
 {emoji:'💃',label:'dance',intents:['couple-dance','nightlife'],meaning:'adult nightlife dance'},
 {emoji:'🕺',label:'dance',intents:['couple-dance','nightlife'],meaning:'adult nightlife dance'},
 {emoji:'🤗',label:'embrace',intents:['embrace','reconcile'],meaning:'consensual embrace/comfort'},
 {emoji:'🍆',label:'mature slang',intents:['flirt','adult-comedy'],meaning:'adult-coded suggestive slang token; never an explicit anatomy/action command'},
 {emoji:'🍑',label:'mature slang',intents:['flirt','adult-comedy'],meaning:'adult-coded suggestive slang token; never an explicit anatomy/action command'},
 {emoji:'💦',label:'mature slang',intents:['flirt','adult-comedy'],meaning:'adult-coded suggestive slang token; never an explicit sex-act command'},
] as const

export const AFTER_DARK_SCENE_TEMPLATES=[
 {id:'date-night',label:'Date Night',intents:['date','romance'],beats:['arrival','conversation','shared activity','romantic beat','choice','closing']},
 {id:'nightclub',label:'Nightclub Story',intents:['nightlife','couple-dance','flirt'],beats:['entry','music','dance','social beat','conflict-or-choice','exit']},
 {id:'relationship-drama',label:'Relationship Drama',intents:['relationship-drama','reconcile'],beats:['setup','disagreement','reveal','choice','reconcile-or-separate','aftermath']},
 {id:'romantic-scene',label:'Romantic Scene',intents:['romance','kiss','embrace'],beats:['chemistry','conversation','consensual affection','fade-to-black-if-more-intimate','next-morning-or-later-scene']},
 {id:'adult-comedy',label:'Adult Comedy',intents:['adult-comedy','flirt'],beats:['setup','double-meaning-joke','reaction','escalation','punchline','tag']},
 {id:'creator-show',label:'After Dark Creator Show',intents:['creator-scene','nightlife'],beats:['cold-open','host-intro','scene','confessional-or-cutaway','cliffhanger','credits']},
] as const

export const AFTER_DARK_RP_POLICY={
 lane:'omniverse-after-dark',
 ageGate:'18+ with jurisdictional 21+ gates where required',
 explicitAdultLaneSelection:true,
 ageAssuranceRequired:true,
 activeConsentRequiredForInteractiveRomance:true,
 noMinors:true,
 noExplicitSexActAnimation:true,
 noPornographicGifGeneration:true,
 noSexualServicesMarketplace:true,
 suggestiveEmojiAllowedAsIntentTokens:true,
 fadeToBlackForSexualIntimacy:true,
 matureNonExplicitReelsAllowed:true,
 matureNonExplicitTvEpisodesAllowed:true,
 ratingMetadataRequired:true,
} as const

export function classifyAfterDarkIntent(input:string){
 const q=input.toLowerCase()
 const intents=new Set<AfterDarkRPIntent>()
 for(const token of AFTER_DARK_EMOJI_TOKENS)if(input.includes(token.emoji))token.intents.forEach(x=>intents.add(x))
 if(/date|dinner|romantic/i.test(q))intents.add('date')
 if(/flirt|chemistry|attract/i.test(q))intents.add('flirt')
 if(/dance|club|party|lounge/i.test(q))intents.add('nightlife')
 if(/kiss/i.test(q))intents.add('kiss')
 if(/hug|embrace|hold/i.test(q))intents.add('embrace')
 if(/argue|relationship|break up|reconcile/i.test(q))intents.add('relationship-drama')
 if(/show|episode|series|reel|camera/i.test(q))intents.add('creator-scene')
 if(!intents.size)intents.add('creator-scene')
 return[...intents]
}