export type UniversalMissionWorld =
  | 'streetverse'
  | 'streetverse-global'
  | 'we-are-the-world'
  | 'creatorverse'
  | 'starverse'
  | 'hero-realms'
  | 'omniverse'

export type UniversalMissionAction =
  | 'open-media-studio'
  | 'open-streetverse'
  | 'open-streetverse-global'
  | 'open-we-are-the-world'
  | 'open-starverse'
  | 'open-gameverse'
  | 'open-meet-the-stubbs'

export interface UniversalMissionStep {
  id:string
  label:string
  detail:string
  action?:UniversalMissionAction
}

export interface UniversalMission {
  id:string
  world:UniversalMissionWorld
  title:string
  summary:string
  rewardXp:number
  route?:string
  steps:UniversalMissionStep[]
}

export const UNIVERSAL_MISSION_WORLD_LABELS:Record<UniversalMissionWorld,string>={
  'streetverse':'StreetVerse',
  'streetverse-global':'StreetVerse Global',
  'we-are-the-world':'We Are the World',
  'creatorverse':'CreatorVerse / 64-Track',
  'starverse':'StarVerse',
  'hero-realms':'Hero Realms',
  'omniverse':'Omniverse',
}

export const UNIVERSAL_MISSIONS:UniversalMission[]=[
  {
    id:'brielle-64-track-welcome',
    world:'streetverse',
    title:'Brielle: 64-Track Creator Check-In',
    summary:'Turn Brielle\'s check-in into a real creator mission instead of a dead-end interaction.',
    rewardXp:180,
    route:'/streetverse/meet-the-stubbs',
    steps:[
      {id:'meet-brielle',label:'Meet Brielle',detail:'Find Brielle in Meet the Stubbs and interact with her.',action:'open-meet-the-stubbs'},
      {id:'open-64-track',label:'Open 64-Track Studio',detail:'Enter the 64-Track creator lane and choose a creator activity.',action:'open-media-studio'},
      {id:'make-moment',label:'Create a moment',detail:'Create or record one original Reel, LIVE or music-studio moment.',action:'open-media-studio'},
      {id:'return-brielle',label:'Return to Brielle',detail:'Return to Brielle and finish the creator check-in.',action:'open-meet-the-stubbs'},
    ],
  },
  {
    id:'aniyah-64-track-first-session',
    world:'creatorverse',
    title:'Aniyah: First 64-Track Session',
    summary:'A starter mission that explains what the 64-Track Studio is for and gives the player a clear finish line.',
    rewardXp:220,
    route:'/creatorverse',
    steps:[
      {id:'enter-studio',label:'Enter 64-Track Studio',detail:'Open the creator studio from the family district or CreatorVerse.',action:'open-media-studio'},
      {id:'choose-project',label:'Choose a project',detail:'Start an original music, Reel or creator-media project.',action:'open-media-studio'},
      {id:'capture',label:'Capture the session',detail:'Save a Reel or LIVE moment from the session.',action:'open-media-studio'},
      {id:'publish-ready',label:'Finish the session',detail:'Return to the mission director and complete the first-session check-in.'},
    ],
  },
  {
    id:'streetverse-first-ride',
    world:'streetverse',
    title:'StreetVerse: First Ride',
    summary:'Repair the mission car, drive it, exit, talk to the guide and finish the first complete gameplay loop.',
    rewardXp:250,
    route:'/streetverse',
    steps:[
      {id:'repair',label:'Repair the mission car',detail:'Follow the gold marker to the orange Repair Mission Car.',action:'open-streetverse'},
      {id:'drive',label:'Drive the repaired car',detail:'Enter the car and drive far enough to prove vehicle control.'},
      {id:'exit',label:'Park and exit',detail:'Stop, exit the vehicle and continue on foot.'},
      {id:'guide',label:'Talk to the guide',detail:'Find the First Journey Guide and complete the check-in.'},
    ],
  },
  {
    id:'streetverse-global-passport-run',
    world:'streetverse-global',
    title:'Global Passport Run',
    summary:'Use one TRYAMM Passport to enter a global city, complete a local activity and return with the city stamped.',
    rewardXp:300,
    route:'/streetverse?global=1&city=chicago',
    steps:[
      {id:'choose-city',label:'Choose a city',detail:'Open StreetVerse Global and choose an available city.',action:'open-streetverse-global'},
      {id:'local-checkin',label:'Complete a local check-in',detail:'Visit one creator, business, culture or community mission point in that city.'},
      {id:'capture-city',label:'Capture the city',detail:'Create one city Reel or LIVE moment.'},
      {id:'passport-return',label:'Return with the stamp',detail:'Return to the Global Mission Director to finish the city run.'},
    ],
  },
  {
    id:'waw-global-connection',
    world:'we-are-the-world',
    title:'We Are the World: Global Connection',
    summary:'Connect two communities through a creator, culture, business or service mission.',
    rewardXp:340,
    route:'/we-are-the-world',
    steps:[
      {id:'enter-waw',label:'Enter We Are the World',detail:'Open the global world and choose a community lane.',action:'open-we-are-the-world'},
      {id:'choose-connection',label:'Choose a connection',detail:'Pick creator exchange, business connection, culture, service or community support.'},
      {id:'complete-exchange',label:'Complete the exchange',detail:'Finish the chosen cross-community activity.'},
      {id:'global-reel',label:'Share the result',detail:'Capture a Reel or LIVE recap of the completed connection.'},
    ],
  },
  {
    id:'starverse-first-showcase',
    world:'starverse',
    title:'StarVerse: First Showcase',
    summary:'Create an original performance identity, prepare a showcase and publish the moment.',
    rewardXp:320,
    route:'/starverse',
    steps:[
      {id:'enter-starverse',label:'Enter StarVerse',detail:'Open StarVerse and choose your creator lane.',action:'open-starverse'},
      {id:'prepare',label:'Prepare an original showcase',detail:'Choose an original song, performance, interview or creator segment.'},
      {id:'perform',label:'Perform the showcase',detail:'Complete the performance checkpoint.'},
      {id:'reel',label:'Create the highlight',detail:'Capture the best moment as a Reel or LIVE replay.'},
    ],
  },
  {
    id:'hero-realms-first-light',
    world:'hero-realms',
    title:'Hero Realms: First Light',
    summary:'Use TRYAMM\'s original Hero Realms quest system for a superhero/fantasy-style mission lane without relying on third-party characters.',
    rewardXp:300,
    route:'/?open=gameverse',
    steps:[
      {id:'open-gameverse',label:'Open GameVerse',detail:'Enter the GameVerse Nexus and open the adventure/quest lane.',action:'open-gameverse'},
      {id:'create-hero',label:'Create your hero',detail:'Choose an original class and hero identity.'},
      {id:'accept-quest',label:'Accept First Light',detail:'Take the First Light quest from the Hero Realms quest log.'},
      {id:'finish-quest',label:'Finish the quest',detail:'Complete the required encounter and return for the reward.'},
    ],
  },
  {
    id:'omniverse-world-link',
    world:'omniverse',
    title:'Omniverse: Connect the Worlds',
    summary:'Complete one mission in two different TRYAMM worlds and return with shared progression.',
    rewardXp:400,
    route:'/my-world',
    steps:[
      {id:'world-one',label:'Complete a StreetVerse mission',detail:'Finish one StreetVerse or StreetVerse Global mission.',action:'open-streetverse'},
      {id:'world-two',label:'Complete a second-world mission',detail:'Finish a mission in CreatorVerse, StarVerse, We Are the World or Hero Realms.'},
      {id:'return',label:'Return to Omniverse',detail:'Return to My World / Omniverse and verify both mission stamps.'},
    ],
  },
]

export const FAMILY_TO_UNIVERSAL_MISSION:Record<string,string>={
  'stubbs-brielle-creator-intro':'brielle-64-track-welcome',
  'stubbs-aniyah-64-track-first-session':'aniyah-64-track-first-session',
}

export function getUniversalMission(id:string|undefined|null){
  return UNIVERSAL_MISSIONS.find(m=>m.id===id)
}

export function getUniversalMissionsForWorld(world:UniversalMissionWorld){
  return UNIVERSAL_MISSIONS.filter(m=>m.world===world)
}
