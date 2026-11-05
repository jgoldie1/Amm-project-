'use strict';
/**
 * TRYAMM Creator Campaign Kit — deterministic, no paid model or publishing.
 * Generates a reviewable 4-scene short-form storyboard. Original effects only.
 */
const clean=(value,max)=>String(value??'').replace(/[\x00-\x1f\x7f]/g,' ').trim().slice(0,max);
const modes=new Set(['question','benefit','demonstration']);
function buildCampaign(input={}){
 const name=clean(input.businessName,120),offer=clean(input.offer,180),benefit=clean(input.benefit,180);
 if(!name||!offer||!benefit)throw Object.assign(new Error('Business name, offer and customer benefit required'),{status:400});
 const mode=modes.has(input.hookMode)?input.hookMode:'question';
 const contact=clean(input.contactUrl,300);
 if(contact){let url;try{url=new URL(contact)}catch{throw Object.assign(new Error('Valid HTTPS contact URL required'),{status:400})}
 if(url.protocol!=='https:'||url.username||url.password||!url.hostname.includes('.'))throw Object.assign(new Error('Valid HTTPS contact URL required'),{status:400})}
 const hook=mode==='question'?('Looking for '+benefit+'?'):mode==='benefit'?benefit:('See how '+name+' works');
 const scenes=[
  {seconds:[0,3],role:'HOOK',visual:'Readable high-contrast caption over approved brand visual',caption:hook,accessibility:'No essential information conveyed by sound alone'},
  {seconds:[3,9],role:'PROBLEM_AND_SOLUTION',visual:'Show authorized product, service or website preview',caption:name+' helps with '+benefit},
  {seconds:[9,20],role:'DEMONSTRATION',visual:'Use real authorized before/after or a verified product demonstration',caption:offer},
  {seconds:[20,25],role:'CALL_TO_ACTION',visual:'Show approved logo, contact information and website QR if verified',caption:contact?'Learn more at '+contact:'Contact '+name+' for details'}
 ];
 return {brand:name,mode,durationSeconds:25,scenes,renderStatus:'STORYBOARD_ONLY',published:false,verifiedResults:false,
  accessibility:['Captions always visible','Avoid flashing and rapid strobing','Offer reduced-motion transitions','Use only rights-cleared visuals and audio'],
  next:'Review facts and licenses, attach original media, render, inspect, then explicitly approve publication'};
}
module.exports={buildCampaign};
