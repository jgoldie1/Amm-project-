export type OnboardingGoal='learn'|'work'|'care'|'create'|'sell'|'play'|'broadcast'|'faith'|'property'|'security';
export type OnboardingModule={id:string;label:string;goals:OnboardingGoal[];status:'source-created'|'wire'|'provider-gated'|'regulated-gated';requirements:string[]};

export const OMNI_ID_FIELDS=[
  'identity','age-band','guardian-status-if-minor','preferred-language','accessibility-passport','communication-preference',
  'avatar','learning-profile','work-profile','creator-profile','media-library','wallet-status','network-tv-profile','game-state','privacy-consents'
] as const;

export const ONBOARDING_GOALS:Record<OnboardingGoal,{label:string;description:string}>={
  learn:{label:'Learn',description:'Pre-K, K–12, GED/adult learning, trades, certificates, college, graduate and doctoral pathways.'},
  work:{label:'Work From Home / Career',description:'AI-assisted remote-work readiness, call-center training, apprenticeships, internships, creator work and marketplace opportunities.'},
  care:{label:'OmniCare 360',description:'Accessible care navigation, scheduling, benefits/insurance support, wellness resources and provider handoff; diagnosis/treatment stays with qualified professionals.'},
  create:{label:'Create',description:'Poyo AI Studio MAX, HoloGPT, music, video, 3D, Holo Clip, Reels, TV and creator publishing.'},
  sell:{label:'Sell / Business',description:'Marketplace, BusinessVerse, commerce, advertising, inventory, delivery and creator monetization.'},
  play:{label:'Play',description:'StreetVerse and GameVerse with shared avatar, accessibility, language, XP, inventory and clip capture.'},
  broadcast:{label:'Broadcast',description:'TRYAMM LIVE, PK, Isaiah AI TV, All American Network TV, Servants of Christ TV and Omni Box.'},
  faith:{label:'Faith + Community',description:'Servants of Christ Network, study, worship, teaching, community rooms and faith media.'},
  property:{label:'Property',description:'Real-estate analysis, house-flip modeling, listings, due diligence and PropertyVerse workflows.'},
  security:{label:'Cybersecurity',description:'Jacobie Vision defensive security, labs, training, privacy and compliance-readiness workflows.'},
};

export const ONBOARDING_MODULES:OnboardingModule[]=[
  {id:'all-american-university',label:'All American University',goals:['learn','work','security','property','create'],status:'source-created',requirements:['Omni ID','learning profile','age/guardian controls where applicable','human instructor/lab gates where required','authorized partner for accredited degree claims']},
  {id:'ai-work-home-call-center',label:'AI Work-From-Home Call Center',goals:['work'],status:'provider-gated',requirements:['training profile','approved scripts/workflows','telephony provider + numbers','STT/TTS provider as needed','webhooks','DNC/TCPA/compliance controls','QA/supervisor escalation','real test call']},
  {id:'omnicare-360',label:'OmniCare 360',goals:['care'],status:'regulated-gated',requirements:['privacy consent','care-navigation scope','qualified provider handoff','insurance/benefits adapters when used','no unverified diagnosis/treatment claims']},
  {id:'jarvis',label:'JARVIS Orchestrator',goals:['learn','work','care','create','sell','play','broadcast','faith','property','security'],status:'source-created',requirements:['Omni ID','permission-aware routing','audit events']},
  {id:'universal-access',label:'Universal Access + HoloLingo',goals:['learn','work','care','create','sell','play','broadcast','faith','property','security'],status:'source-created',requirements:['preferred language','accessibility passport','device capability fallback']},
  {id:'creator-stack',label:'Creator + Holo Clip + Share Everywhere',goals:['create','broadcast','sell'],status:'source-created',requirements:['media consent','rights/likeness authorization','platform authorization for direct posting']},
  {id:'money-engine',label:'Wallet + Money Engine',goals:['work','sell','create','play'],status:'provider-gated',requirements:['identity/tax/KYC as applicable','payment provider','fraud controls','ledger reconciliation','payout eligibility']},
];

export const OMNI_ONBOARDING_FLOW=[
  'WELCOME','CREATE_OR_SIGN_IN_OMNI_ID','AGE_AND_GUARDIAN_RULES','LANGUAGE','ACCESSIBILITY_PASSPORT','PRIVACY_AND_CONSENT',
  'CHOOSE_GOALS','CREATE_AVATAR','CONFIGURE_LEARNING_WORK_CREATOR_PROFILES','CONNECT_OPTIONAL_WALLET','SELECT_NETWORKS_AND_TV',
  'JARVIS_PERSONALIZES_HOME','FIRST_SUCCESS_ACTION','SAVE_PROGRESS','RETURN_ANY_DEVICE'
] as const;
