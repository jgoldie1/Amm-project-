export type RealitySegment='cold-open'|'house-life'|'mission'|'business'|'confessional'|'performance'|'conflict-resolution'|'community'|'live-aftershow'|'reunion'
export type RealityFormat={
 id:string;title:string;tagline:string;episodeMinutes:number;seasonEpisodes:number;castSize:{min:number;max:number}
 segments:RealitySegment[];audienceTools:string[];creatorTools:string[];safety:string[];distribution:string[];revenue:string[]
}
export const STREETVERSE_REALITY_FORMAT:RealityFormat={
 id:'streetverse-reality-v1',
 title:'StreetVerse: Real Life / Real World',
 tagline:'Live the city. Build the story. Own your moments.',
 episodeMinutes:44,
 seasonEpisodes:10,
 castSize:{min:8,max:14},
 segments:['cold-open','house-life','mission','business','confessional','performance','conflict-resolution','community','live-aftershow','reunion'],
 audienceTools:[
  'episode polls that do not override participant consent or safety',
  'choose-next-mission voting',
  'LIVE aftershow questions with moderation',
  'multilingual captions and certified sign-language output when available',
  'StreetVerse QR/mission handoffs after episodes',
  'Reel clip sharing and watch-party rooms',
 ],
 creatorTools:[
  'mobile confession booth',
  'multi-camera producer rundown',
  'remote guest contribution',
  'rights/provenance tagging',
  'episode clipper for Reels',
  'StreetVerse scene reconstruction for explainers/replays',
  'human approval before AI-assisted publish',
 ],
 safety:[
  'adult and youth lanes separated',
  'clear consent and privacy zones',
  'no forced private-room filming',
  'participant stop/leave/report controls',
  'de-escalation and conflict-moderation plan',
  'no payment or prize self-awarded by clients',
  'release/likeness/music/location rights required',
 ],
 distribution:['All American Network','Free TV/FAST when feed rights are verified','Holo Drama','TRYAMM LIVE','OmniReel','CTV/OTT apps when certified'],
 revenue:['subscription','ad-supported viewing','sponsorship','verified gifts','commerce/product placement','ticketed LIVE/reunion','creator licensing','StreetVerse mission sponsorship'],
}
export const REALITY_EPISODE_TEMPLATE=[
 {order:1,label:'COLD OPEN',minutes:2,purpose:'Immediate hook from the strongest safe story moment.'},
 {order:2,label:'LIFE / HOUSE',minutes:8,purpose:'Relationships, work, home, fashion, food and real daily stakes.'},
 {order:3,label:'CITY MISSION',minutes:8,purpose:'Cast enters a StreetVerse/IRL business, community or creator challenge.'},
 {order:4,label:'CONFESSIONALS',minutes:5,purpose:'Individual perspective with captions/translation and clear chronology.'},
 {order:5,label:'BUILD / BUSINESS',minutes:7,purpose:'Creators build a product, performance, event, business or community outcome.'},
 {order:6,label:'CONFLICT / RESOLUTION',minutes:6,purpose:'Moderated story conflict focused on choices and consequences, not manufactured harm.'},
 {order:7,label:'PAYOFF',minutes:5,purpose:'Mission result, performance, reveal, celebration or consequence.'},
 {order:8,label:'NEXT / LIVE',minutes:3,purpose:'Next-episode setup plus LIVE aftershow/StreetVerse handoff.'},
] as const
