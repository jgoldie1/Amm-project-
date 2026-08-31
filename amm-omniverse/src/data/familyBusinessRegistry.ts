export type BusinessSiteStatus='registry'|'site-ready'|'domain-pending'|'live'

export type FamilyBusinessProfile={
  id:string
  owner:string
  region:string
  ventures:string[]
  modules:string[]
  status:BusinessSiteStatus
}

export const FAMILY_BUSINESS_REGISTRY:FamilyBusinessProfile[]=[
  {id:'afonso-gregory',owner:'Afonso Gregory',region:'Las Vegas',ventures:['CNA/home-care agency'],modules:['website','lead-form','booking','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
  {id:'c-von-thornton',owner:'C Von Thornton',region:'United States',ventures:['barber business','upscale short-term rental'],modules:['website','booking','store','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
  {id:'micky-von-wife',owner:"Micky Von's wife",region:'United States',ventures:['Turo business','online store'],modules:['website','vehicle-catalog','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'david-castner',owner:'David Castner',region:'United States',ventures:['transmission/automotive business','online store','business development'],modules:['website','service-booking','store','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
  {id:'brielle-ryan',owner:'Brielle Ryan',region:'United States',ventures:['fitness training','bartending','vegan meal prep','natural juice','delivery'],modules:['website','booking','store','delivery-tracking','crm','holo-ads','analytics'],status:'registry'},
  {id:'alyssa-rock-island',owner:'Alyssa',region:'Rock Island',ventures:['fitness app','online store','Turo','business development'],modules:['website','booking','store','vehicle-catalog','crm','holo-ads','analytics'],status:'registry'},
  {id:'alyssa-robinson',owner:'Alyssa Robinson',region:'United States',ventures:['aesthetics','lymphatic drainage','beauty and wellness services'],modules:['website','booking','service-catalog','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'ashley-grander',owner:'Ashley Grander',region:'United States',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'gina',owner:'Gina',region:'United States',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'brittany',owner:'Brittany',region:'United States',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'sarah-laur',owner:'Sarah Laur',region:'United States',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'eric-kirkland',owner:'Eric Kirkland',region:'California',ventures:['record label','music publishing'],modules:['website','artist-roster','music-catalog','licensing','store','crm','holo-ads','starverse','analytics'],status:'registry'},
  {id:'al-ai-security',owner:'Al AI Security & Conceal-to-Carry',region:'United States',ventures:['lawful security services','concealed-carry training and compliance'],modules:['website','lead-form','booking','training-catalog','compliance-gate','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
]

export const SITE_FACTORY_PIPELINE=['business-profile','brand-kit','website','booking-or-store','payments-provider-gate','crm','holo-ads','streetverse-location','reels','search','analytics'] as const

export function buildSiteBlueprint(profile:FamilyBusinessProfile){
  return {
    slug:profile.id,
    title:`${profile.owner} — ${profile.ventures[0]}`,
    modules:profile.modules,
    pipeline:SITE_FACTORY_PIPELINE,
    productionReady:profile.status==='live',
    requiresDomain:profile.status!=='live',
  }
}
