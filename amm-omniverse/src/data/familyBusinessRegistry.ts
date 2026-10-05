import {BUSINESS_IN_A_BOX_PRICING} from './ElSaturnLaunchPriceBook'
export type BusinessSiteStatus='registry'|'site-ready'|'domain-pending'|'live'
export type FamilyBusinessProfile={id:string;owner:string;region:string;ventures:string[];modules:string[];status:BusinessSiteStatus}

export const FAMILY_BUSINESS_REGISTRY:FamilyBusinessProfile[]=[
  {id:'aniyah-64-track-studio',owner:'Aniyah 64-Track Studio',region:'United States',ventures:['64-track recording studio','AI music production','mixing and mastering','remote recording','soundtrack production'],modules:['website','business-in-a-box','booking','store','creator-tools','music-catalog','licensing','starverse','crm','holo-ads','middleverse','analytics','stubbs-ai'],status:'site-ready'},
  {id:'afonso-gregory',owner:'Afonso Gregory',region:'Las Vegas',ventures:['CNA/home-care agency'],modules:['website','lead-form','booking','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
  {id:'kim-lucii',owner:'Kim Lucii',region:'Las Vegas',ventures:['fashion designer business','online fashion brand','private-label fashion'],modules:['website','business-in-a-box','fashion-design-studio','product-catalog','store','creator-tools','crm','holo-ads','middleverse','quantum-sourcing','low-moq','global-delivery-tracking','analytics','stubbs-ai'],status:'registry'},
  {id:'jasmine-dilland',owner:'Jasmine Dilland',region:'Las Vegas',ventures:['makeup line for Black women','hair bundles and wigs','nail business','beauty brand'],modules:['website','business-in-a-box','beauty-brand-builder','shade-catalog','hair-catalog','nail-catalog','store','subscriptions','creator-tools','crm','holo-ads','middleverse','quantum-sourcing','low-moq','global-delivery-tracking','analytics','stubbs-ai'],status:'registry'},
  {id:'latasha-johnson',owner:'Latasha Johnson',region:'United States',ventures:['meal prep','food delivery','catering'],modules:['website','business-in-a-box','menu','meal-plans','catering-quotes','ordering','booking','delivery-tracking','subscriptions','crm','holo-ads','streetverse-location','analytics','stubbs-ai','food-compliance-gate'],status:'registry'},
  {id:'alton-kevon-stubbs',owner:'Alton Kevon Stubbs',region:'Chicago',ventures:['video production','forex trading education and analysis','forex trading bot research'],modules:['website','business-in-a-box','video-production-studio','portfolio','booking','creator-tools','market-data-adapter','forex-analysis-lab','paper-trading','backtesting','risk-controls','trade-watchlist','analytics','stubbs-ai','financial-compliance-gate'],status:'registry'},
  {id:'don-cario-stubbs',owner:'Don Cario Stubbs',region:'Chicago',ventures:['Pathway to Business','entrepreneurship development'],modules:['website','business-in-a-box','business-pathway','training','store','crm','holo-ads','middleverse','streetverse-location','analytics','stubbs-ai'],status:'registry'},
  {id:'kenneth-p',owner:'Kenneth P',region:'Chicago',ventures:['Pathway to Business','entrepreneurship development'],modules:['website','business-in-a-box','business-pathway','training','store','crm','holo-ads','middleverse','streetverse-location','analytics','stubbs-ai'],status:'registry'},
  {id:'mike-p',owner:'Mike P',region:'Chicago',ventures:['Pathway to Business','entrepreneurship development'],modules:['website','business-in-a-box','business-pathway','training','store','crm','holo-ads','middleverse','streetverse-location','analytics','stubbs-ai'],status:'registry'},
  {id:'c-von-thornton',owner:'C Von Thornton',region:'United States',ventures:['barber business','upscale short-term rental'],modules:['website','booking','store','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
  {id:'micky-von-wife',owner:"Micky Von's wife",region:'United States',ventures:['Turo business','online store'],modules:['website','vehicle-catalog','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'david-castner',owner:'David Castner',region:'United States',ventures:['transmission/automotive business','online store','business development'],modules:['website','service-booking','store','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
  {id:'michael-castner',owner:'Michael Castner',region:'United States',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
  {id:'mikey-castner',owner:'Mikey Castner',region:'United States',ventures:['business pathway','entrepreneurship development'],modules:['website','business-pathway','training','crm','holo-ads','middleverse','analytics'],status:'registry'},
  {id:'brielle-ryan',owner:'Brielle Ryan',region:'United States',ventures:['fitness training','bartending','vegan meal prep','natural juice','delivery'],modules:['website','booking','store','delivery-tracking','crm','holo-ads','analytics'],status:'registry'},
  {id:'alyssa-rock-island',owner:'Alyssa',region:'Rock Island',ventures:['fitness app','online store','Turo','business development'],modules:['website','booking','store','vehicle-catalog','crm','holo-ads','analytics'],status:'registry'},
  {id:'alyssa-robinson',owner:'Alyssa Robinson',region:'United States',ventures:['aesthetics','lymphatic drainage','beauty and wellness services'],modules:['website','booking','service-catalog','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'ashley-grander',owner:'Ashley Grander',region:'United States',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'gina',owner:'Gina',region:'United States',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'brittany',owner:'Brittany',region:'United States',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'sarah-laur',owner:'Sarah Laur',region:'United States',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','analytics'],status:'registry'},
  {id:'eric-kirkland',owner:'Eric Kirkland',region:'California',ventures:['record label','music publishing'],modules:['website','artist-roster','music-catalog','licensing','store','crm','holo-ads','starverse','analytics'],status:'registry'},
  {id:'nikki-frances',owner:'Nikki Frances',region:'Indiana',ventures:['business profile recovery','business development'],modules:['website','lead-form','booking','store','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
  {id:'golden-ma',owner:'Golden Ma',region:'California',ventures:['Pathway to Business','entrepreneurship development'],modules:['website','business-pathway','training','lead-form','crm','holo-ads','middleverse','quantum-sourcing','analytics'],status:'registry'},
  {id:'tasha-ash-family',owner:'Tasha Ash Family',region:'United States',ventures:['family business pathway','creator and entrepreneurship development'],modules:['website','family-hub','business-pathway','creator-tools','store','crm','holo-ads','middleverse','streetverse-location','quantum-sourcing','analytics'],status:'registry'},
  {id:'al-ai-security',owner:'Al AI Security & Conceal-to-Carry',region:'United States',ventures:['lawful security services','concealed-carry training and compliance'],modules:['website','lead-form','booking','training-catalog','compliance-gate','crm','holo-ads','streetverse-location','analytics'],status:'registry'},
]

export const SITE_FACTORY_PIPELINE=['business-profile','brand-kit','website','booking-or-store','quantum-sourcing','low-moq','direct-to-consumer','payments-provider-gate','global-delivery-tracking','crm','holo-ads','streetverse-location','reels','search','analytics'] as const
export const BUSINESS_PROTECTION_PIPELINE=['nda-template','supplier-agreement','trademark-readiness','copyright-readiness','ip-vault','compliance-review'] as const
export const GLOBAL_SUPPLY_CHAIN_PIPELINE=['supplier-discovery','supplier-verification','quote-comparison','sample-gate','low-moq','purchase-order','quality-check','freight-routing','customs-readiness','last-mile-delivery','global-tracking','returns-and-disputes'] as const
export const COMPETITOR_CAPABILITY_ABSORPTION=['shopify-style-storefront','alibaba-style-supplier-discovery','amazon-style-catalog-fulfillment','tiktok-style-creator-commerce','roblox-style-world-commerce','salesforce-style-crm','hubspot-style-lead-automation','doordash-style-local-delivery','canva-style-brand-assets','stubbs-ai-orchestration'] as const
export const BUSINESS_IN_A_BOX_PIPELINE=['idea','business-plan','brand-kit','ip-readiness','supplier-sourcing','samples','catalog','website','store','payments-provider-gate','marketing','crm','delivery','analytics','streetverse-location','middleverse-workforce','stubbs-ai-assistant'] as const
export const TRADING_ANALYSIS_SAFETY_PIPELINE=['licensed-market-data','strategy-rules','backtest','paper-trade','risk-limits','human-confirmation','broker-provider-gate','audit-log','performance-review'] as const
export const FOUNDER_UPGRADE=['business-portfolio-dashboard','saas-revenue-map','venture-incubator','business-in-a-box-factory','streetverse-commercial-district','middleverse-workforce','omnicash-ledger','stubbs-ai-command-layer','compliance-dashboard','portfolio-analytics'] as const

export function buildSiteBlueprint(profile:FamilyBusinessProfile){return {slug:profile.id,title:`${profile.owner} — ${profile.ventures[0]}`,modules:profile.modules,pipeline:SITE_FACTORY_PIPELINE,businessInABox:BUSINESS_IN_A_BOX_PIPELINE,competitorCapabilities:COMPETITOR_CAPABILITY_ABSORPTION,protectionPipeline:BUSINESS_PROTECTION_PIPELINE,supplyChainPipeline:GLOBAL_SUPPLY_CHAIN_PIPELINE,tradingSafety:profile.modules.includes('forex-analysis-lab')?TRADING_ANALYSIS_SAFETY_PIPELINE:undefined,founderUpgrade:FOUNDER_UPGRADE,productionReady:profile.status==='live',requiresDomain:profile.status!=='live'}}


export const BUSINESS_COMPLETION_STAGES=[
 'registry','brand-and-offer','website','booking-or-store','domain','payments-provider',
 'crm','marketing','delivery-or-fulfillment','analytics','streetverse-location','middleverse-workforce','live-operations'
] as const

export function recommendedBusinessPackage(profile:FamilyBusinessProfile){
 const commerce=profile.modules.some(x=>['store','product-catalog','ordering','subscriptions','vehicle-catalog','music-catalog'].includes(x))
 const managed=profile.modules.includes('financial-compliance-gate')||profile.modules.includes('food-compliance-gate')||profile.modules.includes('compliance-gate')
 if(managed)return BUSINESS_IN_A_BOX_PRICING.managed
 if(commerce)return BUSINESS_IN_A_BOX_PRICING.commerce
 if(profile.modules.includes('business-in-a-box'))return BUSINESS_IN_A_BOX_PRICING.pro
 return BUSINESS_IN_A_BOX_PRICING.starter
}

export function businessCompletionPlan(profile:FamilyBusinessProfile){
 const pkg=recommendedBusinessPackage(profile)
 return{
  businessId:profile.id,
  owner:profile.owner,
  currentStatus:profile.status,
  stages:BUSINESS_COMPLETION_STAGES,
  package:pkg,
  readyToSellPackage:true,
  liveBusiness:profile.status==='live',
  blockers:profile.status==='live'?[]:['domain_or_public_url_not_verified','payments_not_verified','live_transactions_not_verified'],
  note:'The business package can be sold before every external provider is live, but TRYAMM must not label the business live until the public site/domain and real transaction path are verified.'
 }
}
