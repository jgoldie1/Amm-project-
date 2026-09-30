export const CIRCLE_PARK_SENIOR_COMMONS={
 id:'circle-park-senior-commons',
 label:'Circle Park Senior Commons',
 streetVersePlacement:'Roosevelt-side entry',
 evidence:{
  verified:['Circle Park includes senior/disabled housing','Circle Park includes a common room for seniors'],
  userDirected:['Roosevelt-side placement in StreetVerse'],
  exactFacadeSurveyed:false,
 },
 activities:[
  {id:'dominoes',label:'Dominoes / Cards'},
  {id:'chess',label:'Chess Club'},
  {id:'oral-history',label:'Neighborhood Oral History'},
  {id:'music',label:'Music & Dance Social'},
  {id:'faith-study',label:'Faith / Study Room'},
  {id:'tech-help',label:'Holo FON / Tech Help'},
  {id:'family-visit',label:'Family & Community Visit'},
  {id:'garden',label:'Courtyard Garden'},
  {id:'movement',label:'Gentle Movement / Aqua'},
  {id:'mentor',label:'Business & Life Mentoring'},
  {id:'creator-story',label:'Storytelling / Reel Studio'},
 ] as const,
 accessibility:{oneHandControls:true,largeText:true,seatedMode:true,voiceReady:true,reducedMotion:true},
 privacy:'No medical records, diagnoses, or real resident identities are stored in this gameplay hub.'
} as const
export const requestSeniorCommonsActivity=(activityId:string)=>window.dispatchEvent(new CustomEvent('tryamm:senior-commons-activity',{detail:{activityId,location:'circle-park',source:'senior-commons'}}))
