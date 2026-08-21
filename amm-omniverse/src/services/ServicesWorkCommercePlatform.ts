export const SERVICES_WORK_COMMERCE = {
  property: [
    {id:'section8-hud',name:'Section 8 + HUD Housing',gate:'regulated',features:['voucher document intake','owner application routing','eligibility/status tracking','accessibility','no SSN exposure in client logs']},
    {id:'short-stay',name:'TRYAMM Short Stay',gate:'local-rules',features:['host onboarding','property verification','occupancy/tax rules','guest safety','local permit gate']},
    {id:'vehicle-share',name:'Peer Vehicle Share',gate:'insurance-regulated',features:['driver verification','vehicle eligibility','insurance/protection gate','claims workflow','tax/airport/local rules']},
    {id:'farm-land',name:'Farm + Land Marketplace',gate:'verification',features:['zoning','water/access','soil/environment records','ownership/provenance','financing/service leads']},
    {id:'landfill-environment',name:'Landfill + Environmental Property',gate:'environmental-regulated',features:['waste permits','contamination records','environmental testing','remediation estimates','government approvals','never present as ordinary farmland without verified testing']},
  ],
  mobility:['rideshare','food delivery','moving/logistics','freight/trucking','travel/booking where eligible','drone services'],
  work:['employee onboarding','contractor onboarding','agency/franchise work','training/certifications','payroll/tax readiness','job matching'],
  education:['All American University','AI teacher at your pace','career pathways','simulation labs','accessibility passport'],
  worlds:['Holoverse','Omniverse','Quantumverse','StreetVerse','HoloArena'],
} as const

export const DRONE_OS = {
  lanes:['recreational-training','Part-107-career-training','inspection/media','mapping','venue/event media','agriculture where lawful','future delivery only after approvals'],
  registrationPath:['choose operation type','drone make/model/weight','registration-required check','Remote ID check','FAA DroneZone handoff','store registration evidence securely','renewal reminders'],
  training:[
    'AI teacher adaptive lessons','airspace basics','weather','preflight','battery/fire safety','Remote ID','TRUST recreational pathway','Part 107 knowledge prep','LAANC/airspace authorization awareness','emergency procedures','privacy/property etiquette','mission simulation','maintenance logs','accessibility adaptations'
  ],
  careerPath:'LEARN → SIMULATOR → KNOWLEDGE CHECK → REQUIRED FAA PATH → REGISTER DEVICE → REMOTE ID → SUPERVISED PRACTICE → VERIFIED SKILLS → JOB/CONTRACT MARKETPLACE',
  hardStops:['no autonomous unsafe launch','no bypassing FAA registration','no controlled-airspace claim without authorization evidence','no delivery/BVLOS claim without applicable approval','no client-side certification minting'],
} as const
