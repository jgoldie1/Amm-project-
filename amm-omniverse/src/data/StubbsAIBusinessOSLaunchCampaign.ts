export type BusinessOSLaunchSlot={
  slot:number
  segment:string
  offer:string
  demoHook:string
  closeGoal:string
}

export const BUSINESS_OS_FIRST_10_DEMO_SLOTS:readonly BusinessOSLaunchSlot[]=[
  {slot:1,segment:'local service business',offer:'Business-in-a-Box Pro',demoHook:'lead → AI follow-up → booking/work queue → owner brief',closeGoal:'paid setup + monthly Pro'},
  {slot:2,segment:'local service business',offer:'AI Business OS',demoHook:'missed calls/tasks → Founder Command → approval queue → daily brief',closeGoal:'AI Business OS setup + monthly'},
  {slot:3,segment:'restaurant / caterer',offer:'Business-in-a-Box Pro',demoHook:'catering inquiry → follow-up → booking → promotion → owner summary',closeGoal:'paid setup + monthly Pro'},
  {slot:4,segment:'restaurant / caterer',offer:'Managed Business',demoHook:'offers + customer questions + workflow support → managed command center',closeGoal:'managed setup + monthly managed plan'},
  {slot:5,segment:'retail / ecommerce',offer:'Commerce + Growth',demoHook:'product → Holo showroom → checkout intent → delivery/ledger visibility',closeGoal:'commerce setup + monthly'},
  {slot:6,segment:'retail / ecommerce',offer:'Holo Services',demoHook:'3D product showcase → Reel/LIVE → sales CTA',closeGoal:'Holo Services setup + monthly add-on'},
  {slot:7,segment:'creator / host',offer:'Starter + Holo Services',demoHook:'content plan → Reel/LIVE → offer → creator earnings view',closeGoal:'starter setup + recurring add-on'},
  {slot:8,segment:'creator / host',offer:'AI Business OS',demoHook:'sponsor leads + content queue + customer support + founder approvals',closeGoal:'AI Business OS setup + monthly'},
  {slot:9,segment:'small fleet / logistics',offer:'Managed Business',demoHook:'job intake → ops queue → exception alert → proof/ledger',closeGoal:'managed setup + monthly'},
  {slot:10,segment:'small fleet / logistics',offer:'AI Business OS',demoHook:'dispatch/admin tasks → AI workforce → owner command brief',closeGoal:'AI Business OS setup + monthly'},
] as const

export const BUSINESS_OS_LAUNCH_CONTENT={
  heroReel:{
    hook:'Your business should not need ten dashboards just to tell you what needs attention.',
    body:'Stubbs AI Business OS turns sales, support, operations, money and AI workers into one holographic Founder Command room.',
    cta:'Book a 15-minute Business OS demo at TRYAMM.',
  },
  beforeAfterReel:{
    hook:'BEFORE: tabs, missed leads, messages and spreadsheets. AFTER: one Founder Command room.',
    body:'See the customer, work queue, money status and approvals from one operating view.',
    cta:'Request your business audit and demo.',
  },
  holographicReel:{
    hook:'What if you could walk through your company like a city?',
    body:'Each holographic tower is a department: Sales, Money, Support, Operations, DevOps, Holo and controlled AI.',
    cta:'See your company mapped into Stubbs AI Business OS.',
  },
} as const

export const BUSINESS_OS_OUTREACH={
  directMessage:'I built an AI Business OS that puts leads, customer support, operations and owner approvals into one command center. I am opening 10 founder demos. I can map one of your real workflows in about 15 minutes. Want a demo?',
  referralMessage:'I am opening 10 founder demos for the Stubbs AI Business OS. If you know a business owner losing time to follow-up, customer questions or scattered tools, send them my demo page.',
  followUp1:'Following up on the Business OS demo. If you give me one repetitive task in your business, I will show how it fits into the command room.',
  followUp2:'Last follow-up for this demo round: I still have founder-demo slots open. The goal is simple—show whether one AI command center can remove repetitive work from your day.',
} as const

export const BUSINESS_OS_DEMO_SCRIPT=[
  'Ask: What repetitive business task steals the most time every week?',
  'Open the holographic Founder Command room.',
  'Select the department that owns that problem.',
  'Show the proposed workflow and where human approval stays required.',
  'Show the plan that matches the workflow; do not upsell unrelated features.',
  'Submit the private demo lead form.',
  'Only use a live checkout link after live Stripe is verified.',
] as const

export const BUSINESS_OS_FIRST_10_SCOREBOARD={
  targetDemoInvitations:40,
  targetBookedDemos:10,
  targetQualifiedProposals:5,
  targetPaidSetupStarts:2,
  note:'Targets are operating goals, not guaranteed results.',
} as const

export const BUSINESS_OS_LAUNCH_RULES={
  noGuaranteedRevenue:true,
  noFakeTestimonials:true,
  noFakeScarcity:true,
  founderDemoSlotsAreCapacityPlanning:true,
  useExistingPriceBook:true,
  liveCheckoutRequiresVerifiedLiveStripe:true,
  highImpactAutomationRequiresHumanApproval:true,
} as const
