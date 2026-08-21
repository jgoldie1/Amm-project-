export const GLOBAL_REGIONS = [
  {id:'usa',label:'United States',markets:['Chicago','Detroit','St. Louis','Florida','California','New York','Indiana','Illinois']},
  {id:'canada',label:'Canada',markets:['Toronto','Vancouver','Montreal','Calgary']},
  {id:'mexico',label:'Mexico',markets:['Mexico City','Guadalajara','Monterrey']},
  {id:'africa',label:'Africa + Diaspora',markets:['Nigeria','South Africa','Ghana','Kenya','Caribbean','Haiti']},
  {id:'india',label:'India',markets:['Delhi NCR','Mumbai','Bengaluru','Hyderabad','Chennai']},
  {id:'asia',label:'Asia-Pacific',markets:['Japan','South Korea','Singapore','Philippines','Indonesia','China where legally/operationally supported']},
  {id:'uk-europe',label:'UK + Europe',markets:['United Kingdom','France','Germany','Spain','Italy']},
  {id:'latam',label:'Latin America',markets:['Brazil','Colombia','Argentina','Chile','Peru']},
] as const

export const MONTHLY_GAME_RELEASES = [
  {month:1,game:'StreetVerse',theme:'Live a Life',cta:'ENTER STREETVERSE'},
  {month:2,game:'Volcano: Last Route',theme:'Adventure',cta:'SURVIVE THE VOLCANO'},
  {month:3,game:'Battle Deck: Holo Champions',theme:'Competition',cta:'BUILD YOUR DECK'},
  {month:4,game:'Photon Tag: Neon District',theme:'Social Sport',cta:'JOIN A TEAM'},
  {month:5,game:'Timewalk: Archive Detectives',theme:'Education + Creation',cta:'ENTER TIMEWALK'},
  {month:6,game:'Living Racing',theme:'Speed + Sponsored Events',cta:'ENTER THE RACE'},
  {month:7,game:'StarVerse',theme:'Music + Performance',cta:'TAKE THE STAGE'},
  {month:8,game:'SpaceVerse',theme:'Crew + Exploration',cta:'BOARD THE SHIP'},
  {month:9,game:'Living Sports',theme:'Season + Tournament',cta:'PLAY SPORTSVERSE'},
  {month:10,game:'Kingdom Builders',theme:'Build + Legacy',cta:'BUILD YOUR KINGDOM'},
  {month:11,game:'Reality Lab',theme:'Immersive Worlds',cta:'ENTER REALITY LAB'},
  {month:12,game:'Creator World',theme:'Movie + Music + Replay',cta:'CREATE SOMETHING'},
] as const

export const GLOBAL_APP_FLOW = 'HOME → REGION/LANGUAGE → MONTHLY FEATURED GAME → HOLOGPT OVERLAY → SIGN IN/CREATE CHARACTER → PLAY/CREATE/LEARN → WORLD MEMORY → LIVE/MOVIE/STORE → RETURN'

export const HOLOGPT_OVERLAY_CONTRACT = {
  placement:['homepage','GameVerse','StreetVerse','HoloArena','Movie Box','HoloMusic','All American University','Marketplace','Mobile'],
  jobs:['explain current screen','translate/localize','recommend next action','find a game/world','help create character','guide missions','help make movie/reel','help with music rights','route support without loops','surface accessibility controls'],
  behavior:['context-aware','never cover critical controls','one-tap minimize','voice/text capable where provider available','preserve accessibility settings','show provider/offline state truthfully'],
  global:['locale-aware copy','timezone-aware events','regional eligibility/pricing truth','do not assume every feature/provider is available in every country'],
} as const

export const HOMEPAGE_CTA_CONTRACT = [
  'PLAY THIS MONTH',
  'EXPLORE WORLDS',
  'CREATE A MOVIE',
  'GO LIVE',
  'MAKE MUSIC',
  'LEARN AT ALL AMERICAN UNIVERSITY',
  'SHOP ALL AMERICAN MARKETPLACE',
  'TRY HOLOARENA',
  'ASK HOLOGPT',
] as const
