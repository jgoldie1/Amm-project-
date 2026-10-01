export type CircleParkEntranceMethod='guard-sign-in'|'resident-key'|'gate-vault'
export type CircleParkPatrolShift='day'|'evening'|'overnight'
export type CircleParkIncidentKind='disturbance'|'fight'|'noise'|'trespass'|'medical'|'property-damage'|'lost-person'|'assist-request'

export const CIRCLE_PARK_RESIDENT_ENTRANCE={
  schema:'tryamm.circle-park.resident-entrance.v1',
  coordinatePolicy:'fictionalized-gameplay-local-not-a-security-map',
  anchors:{
    publicApproach:{id:'circle-park-public-approach',position:[-30,0,46] as const,label:'Public approach'},
    guardGate:{id:'circle-park-guard-gate',position:[-25,0,48] as const,label:'Guard gate / visitor check-in'},
    residentSideGate:{id:'circle-park-resident-side-gate',position:[-19,0,51] as const,label:'Resident side gate'},
    seniorBuilding:{id:'circle-park-senior-building',position:[-10,0,58] as const,label:'Senior building'},
    hill:{id:'circle-park-grill-hill',position:[-5,1.8,64] as const,label:'Hill behind senior building'},
    grill:{id:'circle-park-hill-grill',position:[-2,2,66] as const,label:'Grill / gathering area'},
    poolIndoor:{id:'circle-park-indoor-pool',position:[6,0,63] as const,label:'Indoor pool'},
    poolDeck:{id:'circle-park-pool-deck',position:[10,0,63] as const,label:'Outdoor pool deck'},
  },
  methods:{
    guardSignIn:{
      id:'guard-sign-in' as const,
      label:'SIGN IN',
      steps:['APPROACH GATE','TALK TO SECURITY','SIGN IN','ENTER'],
      signOutOnExit:true,
      visitorFriendly:true,
    },
    residentKey:{
      id:'resident-key' as const,
      label:'USE RESIDENT KEY',
      credential:'fictional-gameplay-resident-key',
      opens:'residentSideGate',
      signInRequired:false,
      auditEvent:'resident-key-entry',
    },
    gateVault:{
      id:'gate-vault' as const,
      label:'HOP / VAULT GATE',
      realWorldInstruction:false,
      gameplayOnly:true,
      usesBodyProfile:true,
      producesLandingImpact:true,
      mayTriggerCommunitySafetyResponse:true,
    },
  },
  privacy:{
    noRealGateCodes:true,
    noRealSecuritySchedules:true,
    noExactCurrentSecuritySystems:true,
  },
} as const

export const CIRCLE_PARK_COMMUNITY_SAFETY={
  schema:'tryamm.circle-park.community-safety.v1',
  mission:'keep-the-peace',
  doctrine:['de-escalation','separate-conflict','assist-first','document-fairly','protect-residents','call-emergency-services-when-needed'] as const,
  patrolShifts:[
    {id:'day' as CircleParkPatrolShift,label:'DAY PATROL',worldHours:[7,15] as const},
    {id:'evening' as CircleParkPatrolShift,label:'EVENING PATROL',worldHours:[15,23] as const},
    {id:'overnight' as CircleParkPatrolShift,label:'OVERNIGHT PATROL',worldHours:[23,7] as const},
  ],
  incidents:{
    disturbance:{severity:1,response:['observe','verbal-deescalation','community-note']},
    noise:{severity:1,response:['request-volume-reduction','community-note']},
    fight:{severity:3,response:['separate-if-safe','protect-bystanders','request-help','incident-report']},
    trespass:{severity:2,response:['verify-access','ask-to-leave-or-check-in','incident-report']},
    medical:{severity:4,response:['protect-scene','request-medical-help','guide-responders']},
    'property-damage':{severity:2,response:['protect-area','document','incident-report']},
    'lost-person':{severity:2,response:['assist','reunification','community-note']},
    'assist-request':{severity:1,response:['assist','community-note']},
  } satisfies Record<CircleParkIncidentKind,{severity:number;response:readonly string[]}>,
  standing:{
    positive:['help-neighbor','deescalate-conflict','clean-up','mentor','report-hazard'] as const,
    negative:['disturbance','fight','property-damage','repeat-rule-violation'] as const,
    outcomes:['commendation','verbal-warning','written-note','written-up','temporary-gameplay-restriction','restorative-task'] as const,
    noAutomaticRealWorldPunishment:true,
  },
} as const

export function circleParkPatrolShiftForHour(hour:number):CircleParkPatrolShift{
  const h=((Math.floor(hour)%24)+24)%24
  if(h>=7&&h<15)return'day'
  if(h>=15&&h<23)return'evening'
  return'overnight'
}
