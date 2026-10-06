export type LaunchLaneState='LAUNCH'|'DEGRADED'|'PROVIDER_GATED'|'REGULATED'|'DEVICE_GATED'

export type OctoberLaunchLane={
  id:string
  label:string
  state:LaunchLaneState
  route?:string
  launchBlocker:boolean
  description:string
  activation?:string[]
}

export const OCTOBER_PUBLIC_ALPHA_LOCK={
  schema:'tryamm.october-launch-lock.v1',
  mode:'PUBLIC_ALPHA',
  freezeNewScope:true,
  noFakeGreen:true,
  launchRule:'Provider-gated and regulated lanes must degrade honestly and may not block the public web/PWA alpha.',
  core:[
    {
      id:'tryamm-shell',
      label:'TRYAMM Super App Shell / PWA',
      state:'LAUNCH',
      route:'/',
      launchBlocker:false,
      description:'Production web/PWA shell, launchers, accessibility and account-aware surfaces.'
    },
    {
      id:'streetverse-play',
      label:'StreetVerse Mobile Play Mode',
      state:'LAUNCH',
      route:'/streetverse',
      launchBlocker:false,
      description:'Game-first mobile world with collapsible tools, missions, repair, creator and social hooks.'
    },
    {
      id:'circle-park-west-side',
      label:'Circle Park → Roosevelt → Taylor → UIC / West Side Alpha',
      state:'DEGRADED',
      route:'/streetverse',
      launchBlocker:false,
      description:'Playable alpha scaffold and mission corridor. Geographic/architectural fidelity continues after launch.'
    },
    {
      id:'reels',
      label:'Reels / Creator Capture',
      state:'LAUNCH',
      route:'/reels',
      launchBlocker:false,
      description:'Capture, creator handoff and public Reel pipeline; real-device save proof remains a certification item.'
    },
    {
      id:'who-online',
      label:'Who’s Online + Creator Workweek',
      state:'LAUNCH',
      route:'/streetverse',
      launchBlocker:false,
      description:'Presence rail, LIVE discovery hooks, sustainable creator workweek and repurpose prompts.'
    },
    {
      id:'all-american-network',
      label:'All American Network Prime',
      state:'DEGRADED',
      route:'/all-american-network',
      launchBlocker:false,
      description:'Newsroom, studio, crypto education and programming shell are live. External broadcast distribution/news providers activate separately.'
    },
    {
      id:'omnicare',
      label:'OmniCare 360 Navigation',
      state:'DEGRADED',
      route:'/omnicare-360',
      launchBlocker:false,
      description:'Care-navigation, accessibility and intake surfaces may launch; clinical actions remain provider/regulatory gated.'
    },
    {
      id:'propertyverse',
      label:'PropertyVerse / House Flip Planning',
      state:'DEGRADED',
      route:'/propertyverse',
      launchBlocker:false,
      description:'Property scouting, rehab planning and lead-generation surfaces may launch; licensed brokerage/lending/appraisal actions remain gated.'
    }
  ] satisfies OctoberLaunchLane[],
  gated:[
    {
      id:'livekit',
      label:'Production LIVE / PK / Multi-guest',
      state:'PROVIDER_GATED',
      launchBlocker:false,
      description:'Code is present. Public realtime video requires verified LiveKit production credentials and two-device verification.',
      activation:['LIVEKIT_URL','LIVEKIT_API_KEY','LIVEKIT_API_SECRET','two-device host/viewer test']
    },
    {
      id:'payments',
      label:'Real Payments / Creator Payouts',
      state:'PROVIDER_GATED',
      launchBlocker:false,
      description:'Real charging and payouts stay off until Stripe/webhook/reconciliation/seller-transfer authority is verified.',
      activation:['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','TRYAMM_LIVE_CHARGING_ENABLED','TRYAMM_RECONCILIATION_VERIFIED']
    },
    {
      id:'broadcast-distribution',
      label:'External TV / FAST / CTV Distribution',
      state:'PROVIDER_GATED',
      launchBlocker:false,
      description:'Studio and programming may launch on TRYAMM; external distribution requires ingest/distribution provider evidence.'
    },
    {
      id:'regulated-services',
      label:'Clinical / Legal / Realty / Insurance / Notary Actions',
      state:'REGULATED',
      launchBlocker:false,
      description:'Discovery, education and lead intake may launch. Regulated professional actions require licensed providers and jurisdiction-specific compliance.'
    },
    {
      id:'native-stores',
      label:'iOS / Android Store Release',
      state:'DEVICE_GATED',
      launchBlocker:false,
      description:'Web/PWA launch does not wait for store approval. Native packages require signed builds, device QA and store review.'
    }
  ] satisfies OctoberLaunchLane[]
} as const

export const octoberLaunchCounts=()=>{
  const all=[...OCTOBER_PUBLIC_ALPHA_LOCK.core,...OCTOBER_PUBLIC_ALPHA_LOCK.gated]
  return{
    launchable:OCTOBER_PUBLIC_ALPHA_LOCK.core.length,
    hardBlockers:all.filter(x=>x.launchBlocker).length,
    providerGated:all.filter(x=>x.state==='PROVIDER_GATED').length,
    regulated:all.filter(x=>x.state==='REGULATED').length,
  }
}
