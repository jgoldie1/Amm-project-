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

export type UniversalMissionEvent =
  | 'manual'
  | 'family-interaction'
  | 'store-interaction'
  | 'media-open'
  | 'media-project'
  | 'media-output'
  | 'vehicle-enter'
  | 'vehicle-exit'
  | 'world-event-join'
  | 'street-checkpoint'
  | 'mission-complete'
  | 'hero-encounter-complete'

export interface UniversalMissionChoice {
  id:string
  label:string
  detail:string
  impactTags:string[]
}

export interface UniversalMissionStep {
  id:string
  label:string
  detail:string
  action?:UniversalMissionAction
  actionByChoice?:Record<string,UniversalMissionAction>
  event?:UniversalMissionEvent
  choices?:UniversalMissionChoice[]
  eventByChoice?:Record<string,UniversalMissionEvent>
  choiceSourceStepId?:string
  match?:Record<string,string|number|boolean>
}

export interface UniversalMission {
  id:string
  world:UniversalMissionWorld
  title:string
  summary:string
  rewardXp:number
  route?:string
  dynamic?:boolean
  coOp?:boolean
  consequenceTags?:string[]
  unlocks?:string[]
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
    id:'streetverse-neighborhood-ripple',
    world:'streetverse',
    title:'StreetVerse: Neighborhood Ripple',
    summary:'A living mission where your chosen role changes the objective, the world-state tags that persist, and the follow-on story.',
    rewardXp:520,
    route:'/streetverse',
    dynamic:true,
    coOp:true,
    consequenceTags:['streetverse-story-advanced'],
    unlocks:['follow-on neighborhood arc','role reputation','world-state consequence'],
    steps:[
      {id:'briefing',label:'Get the block briefing',detail:'Open StreetVerse and review the live situation. The same incident can be approached as a creator, business helper, responder, or driver.',action:'open-streetverse',event:'manual'},
      {id:'choose-role',label:'Choose how you respond',detail:'Your route changes what the next objective listens for and which consequence tags are saved.',choices:[
        {id:'creator',label:'CREATOR / WITNESS',detail:'Document the story responsibly and create a verified media moment.',impactTags:['creator-trust','story-documented']},
        {id:'business',label:'BUSINESS / SUPPORT',detail:'Visit a local business or service point and help the neighborhood response.',impactTags:['business-trust','local-commerce-helped']},
        {id:'responder',label:'COMMUNITY / RESPONDER',detail:'Join a live StreetVerse world event and help resolve the situation.',impactTags:['community-trust','response-helped']},
        {id:'driver',label:'DRIVER / MOBILITY',detail:'Take the mobility route and get a vehicle into the active story.',impactTags:['mobility-reputation','route-supported']},
      ]},
      {id:'field-action',label:'Complete your role objective',detail:'Do the real in-world action for the route you selected. This step advances from gameplay events instead of a fake checklist.',choiceSourceStepId:'choose-role',actionByChoice:{creator:'open-media-studio',business:'open-meet-the-stubbs',responder:'open-streetverse',driver:'open-streetverse'},eventByChoice:{creator:'media-output',business:'store-interaction',responder:'world-event-join',driver:'vehicle-enter'}},
      {id:'second-beat',label:'See the world react',detail:'Reach another StreetVerse checkpoint or complete a connected mission so the story has a second beat instead of ending after one interaction.',event:'street-checkpoint'},
      {id:'aftermath',label:'Close the story',detail:'Review the outcome. Your selected route is written to persistent world-state tags for follow-on missions.',event:'manual'},
    ],
  },
  {
    id:'brielle-64-track-welcome',
    world:'streetverse',
    title:'Brielle: 64-Track Creator Check-In',
    summary:'Meet Brielle, enter 64-Track, make something, and return to close the loop.',
    rewardXp:180,
    route:'/streetverse/meet-the-stubbs',
    steps:[
      {id:'meet-brielle',label:'Meet Brielle',detail:'Find Brielle in Meet the Stubbs and interact with her.',action:'open-meet-the-stubbs',event:'family-interaction',match:{name:'Brielle'}},
      {id:'open-64-track',label:'Open 64-Track Studio',detail:'Enter the 64-Track creator lane and choose a creator activity.',action:'open-media-studio',event:'media-open'},
      {id:'make-moment',label:'Create a moment',detail:'Create or record one original Reel, LIVE or music-studio moment.',action:'open-media-studio',event:'media-output'},
      {id:'return-brielle',label:'Return to Brielle',detail:'Return to Brielle and finish the creator check-in.',action:'open-meet-the-stubbs',event:'family-interaction',match:{name:'Brielle'}},
    ],
  },
  {
    id:'aniyah-64-track-first-session',
    world:'creatorverse',
    title:'Aniyah: First 64-Track Session',
    summary:'A complete creator loop with a project start, finished output and mission close.',
    rewardXp:220,
    route:'/creatorverse',
    steps:[
      {id:'enter-studio',label:'Enter 64-Track Studio',detail:'Open the creator studio from the family district or CreatorVerse.',action:'open-media-studio',event:'media-open'},
      {id:'choose-project',label:'Choose a project',detail:'Start an original music, Reel or creator-media project.',action:'open-media-studio',event:'media-project'},
      {id:'capture',label:'Capture the session',detail:'Render or publish one original output from the session.',action:'open-media-studio',event:'media-output'},
      {id:'publish-ready',label:'Finish the session',detail:'Return to the mission director and complete the first-session check-in.',event:'manual'},
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
      {id:'repair',label:'Repair the mission car',detail:'Follow the gold marker to the orange Repair Mission Car.',action:'open-streetverse',event:'manual'},
      {id:'drive',label:'Drive the repaired car',detail:'Enter the car and drive far enough to prove vehicle control.',event:'vehicle-enter'},
      {id:'exit',label:'Park and exit',detail:'Stop, exit the vehicle and continue on foot.',event:'vehicle-exit'},
      {id:'guide',label:'Talk to the guide',detail:'Find the First Journey Guide and complete the check-in.',event:'manual'},
    ],
  },
  {
    id:'streetverse-global-living-city',
    world:'streetverse-global',
    title:'StreetVerse Global: Living City Story',
    summary:'Choose a city role, complete a local action, create a city memory and carry the consequence through the global passport.',
    rewardXp:560,
    route:'/streetverse?global=1&city=chicago',
    dynamic:true,
    coOp:true,
    consequenceTags:['global-city-story-complete'],
    unlocks:['city passport story stamp','global role reputation'],
    steps:[
      {id:'enter-city',label:'Choose a city',detail:'Open StreetVerse Global and enter an available city.',action:'open-streetverse-global',event:'manual'},
      {id:'choose-lane',label:'Choose your city lane',detail:'Pick the kind of local story you want to create.',choices:[
        {id:'creator',label:'CREATOR EXCHANGE',detail:'Create a local media moment with a city story.',impactTags:['global-creator','culture-documented']},
        {id:'business',label:'BUSINESS CONNECTION',detail:'Visit a business/store interaction and connect the local economy.',impactTags:['global-business','commerce-connected']},
        {id:'community',label:'COMMUNITY EVENT',detail:'Join a live world event or service activity.',impactTags:['global-community','community-connected']},
      ]},
      {id:'local-action',label:'Complete the local action',detail:'The next objective is verified by the kind of action you chose.',choiceSourceStepId:'choose-lane',actionByChoice:{creator:'open-media-studio',business:'open-meet-the-stubbs',community:'open-streetverse-global'},eventByChoice:{creator:'media-output',business:'store-interaction',community:'world-event-join'}},
      {id:'city-memory',label:'Create the city memory',detail:'Create a finished Reel/media output that records the city story.',action:'open-media-studio',event:'media-output'},
      {id:'passport-stamp',label:'Close the city story',detail:'Finish the mission to persist the city-story consequence in your universal mission state.',event:'manual'},
    ],
  },
  {
    id:'waw-community-bridge',
    world:'we-are-the-world',
    title:'We Are the World: Community Bridge',
    summary:'A cross-community mission where culture, commerce or service creates a different lasting connection.',
    rewardXp:600,
    route:'/we-are-the-world',
    dynamic:true,
    coOp:true,
    consequenceTags:['world-bridge-created'],
    steps:[
      {id:'open-world',label:'Enter We Are the World',detail:'Open the global community world.',action:'open-we-are-the-world',event:'manual'},
      {id:'choose-bridge',label:'Choose the bridge',detail:'Choose what will connect the communities.',choices:[
        {id:'culture',label:'CULTURE / CREATOR',detail:'Use original media to share a community story.',impactTags:['culture-bridge','creator-diplomacy']},
        {id:'commerce',label:'BUSINESS / TRADE',detail:'Connect through a business/store interaction.',impactTags:['commerce-bridge','business-diplomacy']},
        {id:'service',label:'SERVICE / COMMUNITY',detail:'Connect through a live community event.',impactTags:['service-bridge','community-diplomacy']},
      ]},
      {id:'bridge-action',label:'Make the connection',detail:'Complete the selected cross-community action.',choiceSourceStepId:'choose-bridge',actionByChoice:{culture:'open-media-studio',commerce:'open-meet-the-stubbs',service:'open-we-are-the-world'},eventByChoice:{culture:'media-output',commerce:'store-interaction',service:'world-event-join'}},
      {id:'proof',label:'Create proof of the connection',detail:'Create one original media output documenting what happened.',action:'open-media-studio',event:'media-output'},
      {id:'aftermath',label:'Carry the connection forward',detail:'Complete the mission and save the bridge tags for future global missions.',event:'manual'},
    ],
  },
  {
    id:'starverse-live-showcase-v2',
    world:'starverse',
    title:'StarVerse: Build the Showcase',
    summary:'Choose a role in an original showcase, complete the work, publish the moment and save the creator consequence.',
    rewardXp:500,
    route:'/starverse',
    dynamic:true,
    consequenceTags:['starverse-showcase-complete'],
    steps:[
      {id:'enter-starverse',label:'Enter StarVerse',detail:'Open StarVerse and prepare an original showcase.',action:'open-starverse',event:'manual'},
      {id:'choose-role',label:'Choose your role',detail:'The showcase can be built from different creator roles.',choices:[
        {id:'performer',label:'PERFORMER',detail:'Create the performance moment.',impactTags:['performer-reputation']},
        {id:'producer',label:'PRODUCER',detail:'Create the media/project output behind the showcase.',impactTags:['producer-reputation']},
        {id:'host',label:'HOST / INTERVIEWER',detail:'Create an original host/interview segment.',impactTags:['host-reputation']},
      ]},
      {id:'create-show',label:'Create the showcase',detail:'Render or publish the original showcase media.',action:'open-media-studio',event:'media-output'},
      {id:'close-show',label:'Close the show',detail:'Finish the showcase mission and save the selected role reputation.',event:'manual'},
    ],
  },
  {
    id:'hero-realms-rift-response',
    world:'hero-realms',
    title:'Hero Realms: Rift Response',
    summary:'An original hero mission with role choice, a quest/combat lane and persistent consequence tags.',
    rewardXp:560,
    route:'/?open=gameverse',
    dynamic:true,
    coOp:true,
    consequenceTags:['hero-realms-rift-contained'],
    steps:[
      {id:'open-gameverse',label:'Enter Hero Realms',detail:'Open GameVerse and enter the original quest/adventure lane.',action:'open-gameverse',event:'manual'},
      {id:'choose-method',label:'Choose your hero method',detail:'Decide how your original hero responds to the rift.',choices:[
        {id:'guardian',label:'GUARDIAN',detail:'Protect people and stabilize the area.',impactTags:['guardian-reputation']},
        {id:'scout',label:'SCOUT',detail:'Investigate first and map the danger.',impactTags:['scout-reputation']},
        {id:'builder',label:'BUILDER',detail:'Solve the crisis through construction/support systems.',impactTags:['builder-reputation']},
      ]},
      {id:'quest-beat',label:'Win a Hero Realms encounter',detail:'Complete a real combat encounter in Hero Realms. The mission advances only after the victory event fires.',event:'hero-encounter-complete'},
      {id:'aftermath',label:'Seal the rift story',detail:'Finish and persist the hero-method consequence for later missions.',event:'manual'},
    ],
  },
  {
    id:'omniverse-ripple-convergence',
    world:'omniverse',
    title:'Omniverse: Ripple Convergence',
    summary:'Finish meaningful actions in two different TRYAMM worlds, then create a persistent cross-world consequence.',
    rewardXp:700,
    route:'/my-world',
    dynamic:true,
    coOp:true,
    consequenceTags:['omniverse-ripple-complete'],
    unlocks:['cross-world consequence chain'],
    steps:[
      {id:'first-world',label:'Finish one world mission',detail:'Complete a StreetVerse, Global, Creator, Star, We Are the World or Hero Realms mission.',action:'open-streetverse',event:'mission-complete'},
      {id:'choose-second',label:'Choose the second world',detail:'Pick where the story continues.',choices:[
        {id:'creator',label:'CREATORVERSE',detail:'Continue through creator/media.',impactTags:['crossworld-creator']},
        {id:'global',label:'WE ARE THE WORLD',detail:'Continue through a global community connection.',impactTags:['crossworld-global']},
        {id:'hero',label:'HERO REALMS',detail:'Continue through the original hero/quest lane.',impactTags:['crossworld-hero']},
      ]},
      {id:'second-world',label:'Finish the second-world action',detail:'Complete a qualifying mission or output in the world you selected.',choiceSourceStepId:'choose-second',actionByChoice:{creator:'open-media-studio',global:'open-we-are-the-world',hero:'open-gameverse'},eventByChoice:{creator:'media-output',global:'mission-complete',hero:'hero-encounter-complete'}},
      {id:'converge',label:'Create the convergence',detail:'Finish the Omniverse mission and persist the cross-world consequence.',event:'manual'},
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
