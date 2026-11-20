/**
 * CrossVerse destinations for the existing StreetVerse Three.js game.
 * Catalog entries are NOT proof of a playable city, assets, routing or live travel.
 * Chicago alone points to a verified source-code landing ID; live render still needs E2E.
 */
export const CROSSVERSE_CITIES = Object.freeze([
  {id:'chicago',label:'Chicago',region:'Illinois',country:'US',state:'playable-code',landingId:'circle-park-abla'},
  {id:'new-york',label:'New York City',region:'New York',country:'US',state:'preview',landingId:null},
  {id:'philadelphia',label:'Philadelphia',region:'Pennsylvania',country:'US',state:'preview',landingId:null},
  {id:'atlanta',label:'Atlanta',region:'Georgia',country:'US',state:'preview',landingId:null},
  {id:'dallas',label:'Dallas',region:'Texas',country:'US',state:'preview',landingId:null},
  {id:'houston',label:'Houston',region:'Texas',country:'US',state:'preview',landingId:null},
  {id:'los-angeles',label:'Los Angeles',region:'California',country:'US',state:'preview',landingId:null},
  {id:'san-diego',label:'San Diego',region:'California',country:'US',state:'preview',landingId:null},
  {id:'detroit',label:'Detroit',region:'Michigan',country:'US',state:'preview',landingId:null},
  {id:'las-vegas',label:'Las Vegas',region:'Nevada',country:'US',state:'preview',landingId:null},
  {id:'miami',label:'Miami',region:'Florida',country:'US',state:'preview',landingId:null},
  {id:'ethiopia-preview',label:'Addis Ababa',region:'Addis Ababa',country:'ET',state:'preview',landingId:null},
  {id:'nigeria-preview',label:'Lagos',region:'Lagos',country:'NG',state:'preview',landingId:null},
]);
export const CROSSVERSE_CITY_STATES = Object.freeze(['playable-code','preview']);
export function resolveCrossVerseDestination(id) {
  const city = CROSSVERSE_CITIES.find(x=>x.id===id);
  if (!city) return {ok:false,reason:'unknown-destination',city:null};
  if (city.state!=='playable-code'||!city.landingId)
    return {ok:false,reason:'preview-only',city};
  return {ok:true,reason:'source-code-landing',city};
}
export function validateCrossVerseCatalog(cities=CROSSVERSE_CITIES){
  const ids=new Set();
  const errors=[];
  for(const city of cities){
    if(!city||typeof city.id!=='string'||ids.has(city.id))errors.push('duplicate-or-invalid-id');
    else ids.add(city.id);
    if(!CROSSVERSE_CITY_STATES.includes(city?.state))errors.push('invalid-state');
    if(city?.state==='preview'&&city.landingId!==null)errors.push('preview-with-unverified-landing');
    if(city?.state==='playable-code'&&(!city.landingId||city.id!=='chicago'))errors.push('unverified-playable-city');
  }
  return [...new Set(errors)];
}
