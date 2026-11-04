/**
 * Creative brief bridge between TRYAMM discovery, Holo Reels, Holo Ads and
 * OmniBox. Stores only a short non-sensitive draft, not client contacts,
 * payment details, ownership proofs, impressions, or purchase authorization.
 */
export type TryammPlacementSurface='streetverse'|'holo-reel'|'omni-box'|'free-tv'|'all-american-network'|'streetverse-radio'
export type TryammCreativeBrief={
 brand:string;product:string;message:string;surface:TryammPlacementSurface;
 merchantUrl:string;rightsConfirmed:boolean;disclosure:'ADVERTISEMENT';
 status:'proposal-only';version:1
}
export const TRYAMM_BRIEF_SESSION_KEY='tryamm.creative-placement-handoff.v1'
export const TRYAMM_PLACEMENT_SURFACES:readonly {id:TryammPlacementSurface;label:string;approval:string}[]=[
 {id:'streetverse',label:'StreetVerse 3D business / product scene',approval:'3D asset, likeness and world integration pending'},
 {id:'holo-reel',label:'Holo Reel sponsor showcase',approval:'Creator assets, music and publication rights pending'},
 {id:'omni-box',label:'OmniBox scripted product placement',approval:'Script review and on-screen disclosures pending'},
 {id:'free-tv',label:'Free TV commercial / sponsor break',approval:'Commercial review and verified ad delivery pending'},
 {id:'all-american-network',label:'All American Network sponsorship',approval:'Network schedule and authorized program pending'},
 {id:'streetverse-radio',label:'StreetVerse Radio sponsor message',approval:'Authorized audio recording and station programming pending'}
] as const
const scrub=(s:string,max:number)=>String(s||'').replace(/[<>\u0000-\u001f]/g,'').replace(/\s+/g,' ').trim().slice(0,max)
export function prepareTryammCreativeBrief(input:{
 brand:string;product:string;message:string;surface:TryammPlacementSurface;
 merchantUrl?:string;rightsConfirmed?:boolean
}):TryammCreativeBrief{
 const brand=scrub(input.brand,80),product=scrub(input.product,90),message=scrub(input.message,150)
 if(brand.length<2||product.length<2)throw Error('Enter a business and product name for the placement.')
 if(!TRYAMM_PLACEMENT_SURFACES.some(s=>s.id===input.surface))throw Error('Select an available TRYAMM placement surface.')
 const rawUrl=String(input.merchantUrl||'').trim()
 let merchantUrl=''
 if(rawUrl){
  try{
   const url=new URL(rawUrl)
   if(url.protocol!=='https:'||!url.hostname.includes('.')||url.username||url.password)throw Error('unsafe url')
   merchantUrl=url.href.slice(0,400)
  }catch{throw Error('Use a valid HTTPS merchant website or leave the link blank.')}
 }
 return {brand,product,message,surface:input.surface,merchantUrl,rightsConfirmed:Boolean(input.rightsConfirmed),
   disclosure:'ADVERTISEMENT',status:'proposal-only',version:1}
}
export function briefToInquiryNotes(brief:TryammCreativeBrief):string{
 return ['Product placement concept (NOT BOOKED)', 'Business: '+brief.brand,
  'Product: '+brief.product,'Placement: '+brief.surface,'Ad message: '+brief.message,
  'Merchant link: '+(brief.merchantUrl||'To be provided'),
  'Advertiser reports rights: '+(brief.rightsConfirmed?'Yes (not independently verified)':'Not yet confirmed'),
  'Production, 3D asset use, rights, moderation, distribution, price and billing require manual approval'].join('\n')
}
export function briefToMediaStudio(brief:TryammCreativeBrief){
 return {source:'tryamm-growth',title:(brief.brand+' • '+brief.product+' Holo Reel').slice(0,110),
  caption:('ADVERTISEMENT • '+brief.brand+' • '+(brief.message||brief.product)).slice(0,165)}
}
export function saveTryammCreativeHandoff(brief:TryammCreativeBrief):boolean{
 if(typeof sessionStorage==='undefined')return false
 try{sessionStorage.setItem(TRYAMM_BRIEF_SESSION_KEY,JSON.stringify(brief));return true}catch{return false}
}
export function readTryammCreativeHandoff():TryammCreativeBrief|null{
 if(typeof sessionStorage==='undefined')return null
 try{
  const data=JSON.parse(sessionStorage.getItem(TRYAMM_BRIEF_SESSION_KEY)||'null')
  if(!data||data.version!==1||data.status!=='proposal-only')return null
  return prepareTryammCreativeBrief(data)
 }catch{return null}
}
export function proposedOmniBoxPlacement(brief:TryammCreativeBrief){
 return {
  title:'Sponsor concept: '+brief.product,
  purpose:'Proposed product story beat for '+brief.brand+'. APPROVAL REQUIRED; placement has not been booked.',
  shots:'Story only: show the approved product clearly; do not add it to 3D scenes until asset and location rights are cleared. Merchant URL: '+(brief.merchantUrl||'not supplied'),
  dialogue:'SAMPLE SCRIPT ONLY — not a paid endorsement. ADVERTISEMENT: '+brief.message,
  audio:'Original or licensed audio only. Require product/brand permissions, signed releases, disclosure and creator approval.'
 }
}
