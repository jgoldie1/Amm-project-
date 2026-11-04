/** TRYAMM approved-content pipeline: draft briefs are not ad inventory or 3D placements. */
export type PlacementSurface='holo-reel'|'streetverse-world'|'omnibox-story'|'free-tv'|'vehicle-screen'
export const TRYAMM_PLACEMENT_SURFACES:readonly {id:PlacementSurface;label:string;approval:string}[]=[
 {id:'holo-reel',label:'Holo Reel',approval:'Performer, brand, music and publishing rights'},
 {id:'streetverse-world',label:'StreetVerse storefront or scene',approval:'3D asset compatibility, scene safety, owner authorization and sponsor label'},
 {id:'omnibox-story',label:'OmniBox episode',approval:'Story treatment, likeness releases and editorial sponsor disclosure'},
 {id:'free-tv',label:'Free TV / All American Network',approval:'Channel rights, scheduled inventory, audience policy and ad clearance'},
 {id:'vehicle-screen',label:'Car, bus, train or airport screen',approval:'Legible placement, contextual safety and authorized media feed'}
] as const
export type PlacementBriefInput={
 brand:string;product:string;description:string;productUrl:string;
 surfaces:readonly PlacementSurface[];ctaText:string;creativeNotes:string;
 advertiserAcknowledgesRightsReview:boolean
}
export type PlacementBrief={
 schema:'tryamm.placement-brief.v1';brand:string;product:string;description:string;
 productUrl:string;surfaces:PlacementSurface[];ctaText:string;creativeNotes:string;
 status:'proposal-only';rights:'unverified';publicationAuthorized:false;billingAuthorized:false;
 disclosure:'Sponsored product placement — proposal only';
 requiredApprovals:string[]
}
const clean=(v:string,max:number)=>String(v||'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,max)
export function createPlacementBrief(input:PlacementBriefInput):PlacementBrief{
 const brand=clean(input.brand,90),product=clean(input.product,100),description=clean(input.description,350)
 const ctaText=clean(input.ctaText,50),creativeNotes=clean(input.creativeNotes,450)
 if(brand.length<2||product.length<2)throw new Error('Enter a brand and product name.')
 if(!description)throw new Error('Describe the product or service.')
 if(!input.advertiserAcknowledgesRightsReview)throw new Error('Acknowledge that rights and placement require approval.')
 const surfaces=TRYAMM_PLACEMENT_SURFACES.filter(s=>input.surfaces.includes(s.id)).map(s=>s.id)
 if(!surfaces.length)throw new Error('Select at least one placement location.')
 let productUrl=''
 if(input.productUrl.trim()){
  const raw=input.productUrl.trim()
  try{const url=new URL(raw)
   if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw Error()
   productUrl=url.toString().slice(0,500)
  }catch{throw new Error('Enter a public HTTPS or HTTP product link with no credentials.')}
 }
 return{schema:'tryamm.placement-brief.v1',brand,product,description,productUrl,surfaces,
  ctaText:ctaText||'Learn more',creativeNotes,status:'proposal-only',rights:'unverified',
  publicationAuthorized:false,billingAuthorized:false,disclosure:'Sponsored product placement — proposal only',
  requiredApprovals:['Customer and trademark or product rights review','Advertising disclosure and audience suitability',
   ...surfaces.map(s=>TRYAMM_PLACEMENT_SURFACES.find(x=>x.id===s)!.approval),
   'Publisher inventory and media compatibility','Verified service agreement before payment and publishing']}
}
export function placementToInquiryNotes(brief:PlacementBrief,max=900):string{
 return[
 'Product placement proposal — NO PLACEMENT PUBLISHED',
 'Brand: '+brief.brand,'Product: '+brief.product,'Details: '+brief.description,
 'Requested surfaces: '+brief.surfaces.join(', '),
 'CTA: '+brief.ctaText,
 brief.productUrl?'Public product link: '+brief.productUrl:'',
 brief.creativeNotes?'Creative direction: '+brief.creativeNotes:'',
 'Rights and inventory: pending manual verification.'
 ].filter(Boolean).join('\n').slice(0,Math.max(0,max))
}
export const TRYAMM_PLACEMENT_STUDIO_HANDOFF_KEY='tryamm.placement-studio-proposal.v1'
export function placementToStudioHandoff(brief:PlacementBrief){
 return{
  source:'tryamm-growth',title:(brief.brand+' • '+brief.product+' | TRYAMM Holo Reel').slice(0,100),
  caption:('Sponsored concept • '+brief.product+' • '+brief.ctaText+' • Rights review required').slice(0,180),
  creatorMode:'holographic' as const,
  projectPrompt:('Draft, not approved. '+brief.brand+' / '+brief.product+': '+brief.description+
   '. Placements: '+brief.surfaces.join(', ')+'. '+brief.creativeNotes+
   '. Do not present sponsor assets as cleared or publish until approved.').slice(0,650)
 }
}
export function isPlacementBrief(value:unknown):value is PlacementBrief{
 if(!value||typeof value!=='object')return false
 const b=value as Partial<PlacementBrief>
 return b.schema==='tryamm.placement-brief.v1'&&b.status==='proposal-only'&&
  b.rights==='unverified'&&b.publicationAuthorized===false&&b.billingAuthorized===false&&
  typeof b.brand==='string'&&b.brand.length>1&&b.brand.length<=90&&
  typeof b.product==='string'&&b.product.length>1&&b.product.length<=100&&
  typeof b.description==='string'&&b.description.length<=350&&
  Array.isArray(b.surfaces)&&b.surfaces.length>0&&
  b.surfaces.every(s=>TRYAMM_PLACEMENT_SURFACES.some(x=>x.id===s))
}
