export type StreetVerseRescueIncidentKind=
  |'structure-fire'
  |'house-fire'
  |'cat-in-tree'
  |'car-wreck'
  |'stroke-emergency'
  |'gunshot-victim'
  |'sexual-assault-survivor'
  |'assault'
  |'robbery'

export type StreetVerseResponderService='security'|'police'|'sheriff'|'ambulance'|'fire'

export type StreetVerseRescueIncidentDefinition={
  kind:StreetVerseRescueIncidentKind
  label:string
  severity:number
  services:readonly StreetVerseResponderService[]
  objectives:readonly string[]
  victimCount:number
  animalCount:number
  fire:boolean
  violentCrime:boolean
  survivorCentered:boolean
}

export const STREETVERSE_RESCUE_INCIDENTS:Record<StreetVerseRescueIncidentKind,StreetVerseRescueIncidentDefinition>={
  'structure-fire':{
    kind:'structure-fire',label:'BUILDING FIRE',severity:5,services:['security','fire','ambulance','police'],
    objectives:['EVACUATE OCCUPANTS','SUPPRESS FIRE','SEARCH FOR TRAPPED PEOPLE','TREAT INJURED','SECURE SCENE'],
    victimCount:3,animalCount:0,fire:true,violentCrime:false,survivorCentered:true,
  },
  'house-fire':{
    kind:'house-fire',label:'HOUSE FIRE',severity:5,services:['security','fire','ambulance'],
    objectives:['EVACUATE RESIDENTS','SUPPRESS FIRE','SEARCH ROOMS','TREAT INJURED'],
    victimCount:2,animalCount:1,fire:true,violentCrime:false,survivorCentered:true,
  },
  'cat-in-tree':{
    kind:'cat-in-tree',label:'ANIMAL RESCUE',severity:1,services:['fire'],
    objectives:['LOCATE ANIMAL','CREATE SAFE RESCUE AREA','RETURN ANIMAL TO OWNER'],
    victimCount:0,animalCount:1,fire:false,violentCrime:false,survivorCentered:true,
  },
  'car-wreck':{
    kind:'car-wreck',label:'CAR WRECK',severity:4,services:['security','ambulance','fire','police'],
    objectives:['SECURE TRAFFIC','REACH OCCUPANTS','EXTRICATE IF TRAPPED','TREAT INJURED','CLEAR ROADWAY'],
    victimCount:2,animalCount:0,fire:false,violentCrime:false,survivorCentered:true,
  },
  'stroke-emergency':{
    kind:'stroke-emergency',label:'MEDICAL EMERGENCY • POSSIBLE STROKE',severity:5,services:['security','ambulance'],
    objectives:['CALL EMS','KEEP ACCESS ROUTE CLEAR','HAND OFF TO PARAMEDICS','TRANSPORT FOR MEDICAL CARE'],
    victimCount:1,animalCount:0,fire:false,violentCrime:false,survivorCentered:true,
  },
  'gunshot-victim':{
    kind:'gunshot-victim',label:'PERSON SHOT',severity:5,services:['security','ambulance','police'],
    objectives:['PROTECT BYSTANDERS','REQUEST POLICE AND EMS','SECURE SCENE','TREAT VICTIM','INVESTIGATE'],
    victimCount:1,animalCount:0,fire:false,violentCrime:true,survivorCentered:true,
  },
  'sexual-assault-survivor':{
    kind:'sexual-assault-survivor',label:'SURVIVOR SUPPORT CALL',severity:5,services:['security','ambulance','police'],
    objectives:['PROTECT SURVIVOR PRIVACY','OFFER MEDICAL CARE','PRESERVE OPTIONS AND EVIDENCE','SUPPORT SURVIVOR CHOICE','INVESTIGATE WITH CONSENT'],
    victimCount:1,animalCount:0,fire:false,violentCrime:true,survivorCentered:true,
  },
  assault:{
    kind:'assault',label:'ASSAULT RESPONSE',severity:4,services:['security','ambulance','police'],
    objectives:['STOP FURTHER HARM','PROTECT VICTIM','REQUEST MEDICAL HELP','SECURE SCENE','INVESTIGATE'],
    victimCount:1,animalCount:0,fire:false,violentCrime:true,survivorCentered:true,
  },
  robbery:{
    kind:'robbery',label:'ROBBERY RESPONSE',severity:4,services:['security','police','ambulance'],
    objectives:['PROTECT PEOPLE','REPORT DESCRIPTION','SECURE SCENE','TREAT INJURED','INVESTIGATE'],
    victimCount:1,animalCount:0,fire:false,violentCrime:true,survivorCentered:true,
  },
}

export const STREETVERSE_RESCUE_ROLES={
  security:['FIRST CONTACT','DE-ESCALATE','PROTECT BYSTANDERS','CALL RESPONDERS','GUIDE UNITS'],
  fire:['FIRE SUPPRESSION','BUILDING SEARCH','EVACUATION','EXTRICATION','ANIMAL RESCUE'],
  ambulance:['TRIAGE','STABILIZE','MEDICAL HANDOFF','TRANSPORT'],
  police:['SCENE SAFETY','VIOLENT-CRIME RESPONSE','INVESTIGATION','TRAFFIC CONTROL'],
  sheriff:['COUNTY RESPONSE','PERIMETER','TRANSPORT SUPPORT','INVESTIGATION SUPPORT'],
} as const
