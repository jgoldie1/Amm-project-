export const ATC_CAREER_PROGRAM = {
  id:'atc-career-prep',
  name:'ATC Career Preparation & Simulation',
  purpose:'Prepare learners for air-traffic-control concepts, communication discipline, situational awareness and career exploration through simulation. This is educational preparation and does not itself confer FAA certification or employment eligibility.',
  levels:[
    {id:'atc-101',name:'Airspace Foundations',modules:['airport layout','airspace classes','runways/taxiways','weather basics','aviation phraseology','human factors'],sim:'single-airport ground/tower orientation'},
    {id:'atc-201',name:'Tower Operations',modules:['ground control','local control','departures/arrivals','runway separation concepts','readback/hearback discipline','emergency priorities'],sim:'multi-aircraft tower traffic'},
    {id:'atc-301',name:'Approach & Departure',modules:['radar picture','sequencing','vector concepts','altitude/speed planning','handoffs','traffic complexity'],sim:'terminal-area sequencing'},
    {id:'atc-401',name:'High-Density Scenario Lab',modules:['weather disruption','equipment outage','priority handling','fatigue awareness','team coordination','post-scenario debrief'],sim:'complex supervised scenario lab'}
  ],
  aiInstructor:{name:'AAU ATC AI Instructor',roles:['teach concepts','run oral drills','generate scenario briefs','score communication consistency','explain mistakes','adapt difficulty','support accessibility','refer regulatory questions to current official sources'],guardrails:['never impersonate FAA authority','never issue real ATC clearances','never represent simulation scores as certification','separate training scenario from real-world operational instructions']},
  assessment:['knowledge checks','phraseology drills','scenario performance','decision review','debrief reflection','career-readiness portfolio'],
  liveRequirements:['authenticated learning passport','scenario save/rejoin','instructor audit trail','accessibility profile','content/version labels','current-regulation source links','clear simulation-only labeling'],
} as const

export const AAU_CAREER_EXPANSION = [
  {id:'aviation-dispatch',name:'Flight Dispatch & Airline Operations',labs:['dispatch planning','weather/NOTAM reading','irregular operations','crew coordination']},
  {id:'airport-ops',name:'Airport Operations & Ramp Safety',labs:['airfield inspection','ground movement','incident response','winter ops']},
  {id:'drone-ops',name:'Drone/UAS Operations',labs:['mission planning','airspace awareness','inspection workflows','public-safety scenarios']},
  {id:'logistics',name:'Logistics, Dispatch & Freight Operations',labs:['routing','load planning','fleet dispatch','exception management']},
  {id:'cyber',name:'Jacobie Vision Cybersecurity Academy',labs:['SOC triage','identity/device trust','incident response','secure networks']},
  {id:'ems',name:'Emergency Communications & Dispatch',labs:['call intake','resource dispatch','multi-agency coordination','stress-aware communication']},
  {id:'media',name:'Creator, Film, Music & Broadcast Production',labs:['Aniyah 64-track','Movie Box','LIVE production','rights/provenance']},
  {id:'xr',name:'XR Venue & HoloArena Operations',labs:['OpenXR setup','calibration','operator safety','session management']},
  {id:'business',name:'Entrepreneurship, Marketplace & Franchise Operations',labs:['storefront setup','unit economics','customer acquisition','agency/franchise ops']},
  {id:'health-admin',name:'Healthcare Administration & Patient Access',labs:['scheduling','service navigation','privacy basics','call-center workflows']},
  {id:'trades',name:'Skilled Trades Digital Twin Lab',labs:['room scan','measurement','safety planning','CAD/STEP workflow']},
] as const

export const AAU_GO_LIVE_CONTRACT = 'DISCOVER PROGRAM → ENROLL → LEARNING PASSPORT → AI INSTRUCTOR → LESSON → SIMULATION/LAB → ASSESSMENT → SAVE/REJOIN → PORTFOLIO/CREDENTIAL → OPPORTUNITY MATCH → HUMAN ADVISOR/EMPLOYER OR OFFICIAL CERTIFICATION PATH'
