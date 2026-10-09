import {SCULPTIFY_SAN_DIEGO_MISSIONS} from './sculptifySanDiegoStreetVerse'

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
  | 'open-after-dark-alpha'
  | 'open-sculptify-san-diego'

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
  | 'after-dark-approach'
  | 'after-dark-complete'
  | 'sculptify-booking-intent'
  | 'sculptify-academy-intent'
  | 'sculptify-store-interaction'
  | 'sculptify-business-collaboration'
  | 'sculptify-training-complete'
  | 'sculptify-staffing-intent'
  | 'sculptify-template-intent'
  | 'sculptify-referral-shared'
  | 'sculptify-referral-verified'
  | 'sculptify-referred-user-active'
  | 'sculptify-positive-outcome'

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
  requiresAnyTags?:string[]
  adultOnly?:boolean
  night?:boolean
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
  ...SCULPTIFY_SAN_DIEGO_MISSIONS,
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
    id:'streetverse-chicago-after-dark',
    world:'streetverse',
    title:'Chicago After Dark: White Night File',
    summary:'A 21+ Chicago-night mission that combines nightlife, investigation, witness protection, creator media, safe mobility and persistent reputation.',
    rewardXp:780,
    route:'/streetverse',
    dynamic:true,
    coOp:true,
    adultOnly:true,
    night:true,
    consequenceTags:['chicago-after-dark-cleared','evidence-before-accusation'],
    unlocks:['Agent Seven night operation','Omniverse After Dark'],
    steps:[
      {id:'night-brief',label:'Enter Chicago After Dark',detail:'Open the existing age-gated After Dark mission layer. Mature nightlife themes remain fictional and evidence-first.',action:'open-after-dark-alpha',event:'manual'},
      {id:'choose-approach',label:'Choose the night approach',detail:'Pick spy, detective, social or rescue inside the After Dark mission. Your choice must be recorded by the real After Dark runtime.',action:'open-after-dark-alpha',event:'after-dark-approach'},
      {id:'resolve-file',label:'Resolve the White Night File',detail:'Collect the required fictional evidence, protect the fictional witness and complete the existing After Dark mission.',action:'open-after-dark-alpha',event:'after-dark-complete',match:{missionId:'after-dark-white-night-file'}},
      {id:'night-reel',label:'Create the Chicago night recap',detail:'Create an original Reel or media recap of the completed fictional mission.',action:'open-media-studio',event:'media-output'},
      {id:'safe-return',label:'Close the night safely',detail:'Finish the Chicago After Dark arc and save its reputation consequences.',event:'manual'},
    ],
  },
  {
    id:'agent-seven-night-signal',
    world:'streetverse',
    title:'Agent Seven: Night Signal',
    summary:'An original TRYAMM espionage-style mission inspired by cinematic spy adventures, without using third-party characters or story IP.',
    rewardXp:900,
    route:'/streetverse',
    dynamic:true,
    coOp:true,
    adultOnly:true,
    night:true,
    requiresAnyTags:['chicago-after-dark-cleared'],
    consequenceTags:['agent-seven-field-qualified'],
    unlocks:['global night intelligence route','Omniverse Agent Seven arc'],
    steps:[
      {id:'agent-brief',label:'Receive the Night Signal',detail:'Return to the 21+ After Dark layer for a fictional covert-operation briefing.',action:'open-after-dark-alpha',event:'manual'},
      {id:'spy-route',label:'Choose SPY approach',detail:'Select the SPY approach in the existing After Dark mission. This is original TRYAMM Agent Seven fiction, not a James Bond/007 character.',action:'open-after-dark-alpha',event:'after-dark-approach',match:{approach:'spy'}},
      {id:'field-proof',label:'Complete the covert field file',detail:'Finish the evidence-first investigation and extraction without unsupported accusations.',action:'open-after-dark-alpha',event:'after-dark-complete',match:{missionId:'after-dark-white-night-file'}},
      {id:'mobility-exit',label:'Make the clean exit',detail:'Enter a StreetVerse vehicle after the operation to prove the mobility/exfiltration beat.',action:'open-streetverse',event:'vehicle-enter'},
      {id:'debrief',label:'Publish the debrief',detail:'Create an original mission recap and close the Agent Seven operation.',action:'open-media-studio',event:'media-output'},
    ],
  },
  {
    id:'streetverse-ripple-aftermath',
    world:'streetverse',
    title:'StreetVerse: Ripple Aftermath',
    summary:'A follow-up mission that stays locked until Neighborhood Ripple leaves a reputation consequence in the world.',
    rewardXp:650,
    route:'/streetverse',
    dynamic:true,
    coOp:true,
    requiresAnyTags:['creator-trust','business-trust','community-trust','mobility-reputation'],
    consequenceTags:['streetverse-aftermath-resolved'],
    unlocks:['reputation-specific future story seed'],
    steps:[
      {id:'return-block',label:'Return to the block',detail:'The world remembers your earlier role. Return to StreetVerse and review the aftermath.',action:'open-streetverse',event:'manual'},
      {id:'choose-response',label:'Choose how you answer your reputation',detail:'Double down, repair relationships, or switch lanes. This creates a second-generation consequence.',choices:[
        {id:'double-down',label:'DOUBLE DOWN',detail:'Use creator/media proof to reinforce your existing reputation.',impactTags:['reputation-reinforced']},
        {id:'repair',label:'REPAIR RELATIONSHIPS',detail:'Talk to people and rebuild trust before the next story beat.',impactTags:['relationships-repaired']},
        {id:'switch-lane',label:'SWITCH LANES',detail:'Join a different community event and change how the city reads you.',impactTags:['reputation-evolved']},
      ]},
      {id:'prove-response',label:'Prove the response in gameplay',detail:'The next objective advances only when the selected action actually occurs.',choiceSourceStepId:'choose-response',actionByChoice:{'double-down':'open-media-studio',repair:'open-meet-the-stubbs','switch-lane':'open-streetverse'},eventByChoice:{'double-down':'media-output',repair:'family-interaction','switch-lane':'world-event-join'}},
      {id:'close-aftermath',label:'Close the aftermath',detail:'Finish the follow-up and save the new reputation consequence for later arcs.',event:'manual'},
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
    id:'streetverse-global-after-dark',
    world:'streetverse-global',
    title:'StreetVerse Global After Dark: Night Passport',
    summary:'A city-to-city night mission that mixes localized culture, safe mobility, creator stories, late-night businesses and an evidence-first mystery lane.',
    rewardXp:920,
    route:'/streetverse?global=1&city=chicago',
    dynamic:true,
    coOp:true,
    adultOnly:true,
    night:true,
    consequenceTags:['global-after-dark-passport'],
    unlocks:['localized night-city follow-ups','global creator/business reputation'],
    steps:[
      {id:'night-city',label:'Enter a night city',detail:'Open StreetVerse Global and choose an available city. Chicago is the first certified night-story anchor.',action:'open-streetverse-global',event:'manual'},
      {id:'choose-night-role',label:'Choose the night role',detail:'Pick how you will contribute to the city after dark.',choices:[
        {id:'creator',label:'NIGHT CREATOR',detail:'Document culture, music, food or a safe nightlife story.',impactTags:['night-creator','culture-after-dark']},
        {id:'business',label:'NIGHT BUSINESS',detail:'Support a late-night local business or service interaction.',impactTags:['night-business','local-night-economy']},
        {id:'community',label:'SAFE RETURN / COMMUNITY',detail:'Join a community event or mobility/safety route.',impactTags:['night-community','safe-return']},
      ]},
      {id:'night-action',label:'Complete the city role',detail:'The objective is verified by real gameplay based on the role you selected.',choiceSourceStepId:'choose-night-role',actionByChoice:{creator:'open-media-studio',business:'open-meet-the-stubbs',community:'open-streetverse-global'},eventByChoice:{creator:'media-output',business:'store-interaction',community:'world-event-join'}},
      {id:'night-file',label:'Resolve a fictional night file',detail:'Open the evidence-first After Dark investigation and complete its fictional case.',action:'open-after-dark-alpha',event:'after-dark-complete',match:{missionId:'after-dark-white-night-file'}},
      {id:'passport-night-stamp',label:'Close the Night Passport',detail:'Finish and save the city-night consequences for future localized global missions.',event:'manual'},
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
    id:'omniverse-after-dark',
    world:'omniverse',
    title:'Omniverse After Dark: Midnight Convergence',
    summary:'A 21+ cross-world night arc connecting StreetVerse, Global, CreatorVerse and original Hero Realms through persistent consequences.',
    rewardXp:1200,
    route:'/my-world',
    dynamic:true,
    coOp:true,
    adultOnly:true,
    night:true,
    requiresAnyTags:['chicago-after-dark-cleared','global-after-dark-passport','agent-seven-field-qualified'],
    consequenceTags:['omniverse-after-dark-converged'],
    unlocks:['future cross-world night chapters'],
    steps:[
      {id:'choose-night-world',label:'Choose the first night world',detail:'Pick which lane carries the midnight story forward.',choices:[
        {id:'street',label:'STREETVERSE AFTER DARK',detail:'Return to the Chicago evidence-first night layer.',impactTags:['midnight-street']},
        {id:'global',label:'GLOBAL NIGHT PASSPORT',detail:'Continue through StreetVerse Global and its localized night-city route.',impactTags:['midnight-global']},
        {id:'creator',label:'CREATOR NIGHT SHOW',detail:'Carry the night story through an original creator/media production.',impactTags:['midnight-creator']},
      ]},
      {id:'first-night-action',label:'Complete the first night action',detail:'The mission waits for the gameplay signal tied to the world you chose.',choiceSourceStepId:'choose-night-world',actionByChoice:{street:'open-after-dark-alpha',global:'open-streetverse-global',creator:'open-media-studio'},eventByChoice:{street:'after-dark-complete',global:'world-event-join',creator:'media-output'}},
      {id:'second-world',label:'Cross into a second world',detail:'Finish a second qualifying action so the story actually crosses worlds.',action:'open-gameverse',event:'hero-encounter-complete'},
      {id:'midnight-proof',label:'Create the Midnight proof',detail:'Create an original Reel/media artifact from the cross-world story.',action:'open-media-studio',event:'media-output'},
      {id:'converge-night',label:'Close Midnight Convergence',detail:'Finish and preserve the cross-world night consequence for later chapters.',event:'manual'},
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
