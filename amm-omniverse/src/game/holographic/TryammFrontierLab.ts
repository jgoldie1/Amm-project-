export type FrontierConcept=
 |'intent-market'|'portable-reputation'|'world-twin-commerce'|'attention-dividend'
 |'ai-business-in-a-box'|'rights-router'|'accessibility-market'|'city-api'
 |'skill-to-income'|'personal-agent-market'

export interface FrontierProgram{
 id:FrontierConcept; name:string; thesis:string; firstPrototype:string
 revenue:string[]; safeguards:string[]
}

export const TRYAMM_FRONTIER_LAB:FrontierProgram[]=[
 {id:'intent-market',name:'Intent Market',thesis:'Users can request an outcome and eligible businesses compete to fulfill it instead of forcing users to search ads.',firstPrototype:'StreetVerse request card → matched verified businesses → quotes/offers → checkout',revenue:['qualified lead fee','transaction fee','business subscription'],safeguards:['no sale of sensitive intent','clear sponsored ranking','user controls matching']},
 {id:'portable-reputation',name:'Portable Trust Passport',thesis:'A user or business can carry verified skills, fulfillment history and credentials across TRYAMM worlds without exposing raw private data.',firstPrototype:'selective-disclosure Passport badges',revenue:['business verification','credential services','enterprise API'],safeguards:['user consent','minimal disclosure','appeal/correction','no hidden social score']},
 {id:'world-twin-commerce',name:'Playable Business Twin',thesis:'A business digital twin can be simultaneously a store, ad, game mission, live studio and fulfillment endpoint.',firstPrototype:'one StreetVerse business → mission → LIVE → product/service checkout',revenue:['twin subscription','commerce fee','sponsorship','production services'],safeguards:['merchant authorization','truthful offers','rights clearance']},
 {id:'attention-dividend',name:'Verified Attention Rewards',thesis:'A disclosed portion of eligible ad value can fund useful viewer rewards without fake engagement or guaranteed earnings.',firstPrototype:'opt-in sponsored mission with server-verified completion',revenue:['advertising','sponsored missions'],safeguards:['no click fraud','caps','age controls','not pay-for-news opinion']},
 {id:'ai-business-in-a-box',name:'Business-in-a-Box Agent',thesis:'Turn a verified local business into a managed digital operation: storefront, booking, media, ads, support and delivery from one passport.',firstPrototype:'Business Passport → generated operating checklist → approved storefront/media campaign',revenue:['monthly service','setup','transactions','ads'],safeguards:['human approval','no unauthorized financial actions','audit trail']},
 {id:'rights-router',name:'Rights Router',thesis:'Every media asset carries machine-readable ownership, territory, duration and revenue-split permissions so distribution can be decided automatically.',firstPrototype:'rights manifest → TRYAMM TV/Reels/Holo LIVE eligibility',revenue:['rights administration','licensing','distribution fee'],safeguards:['rights-holder approval','dispute workflow','immutable audit references']},
 {id:'accessibility-market',name:'Accessibility as a Platform',thesis:'One-hand, voice, captions, translation and adaptive UI can become reusable infrastructure businesses and creators can opt into.',firstPrototype:'TRYAMM accessibility profile applied across StreetVerse/TV/commerce',revenue:['enterprise accessibility tools','creator/business services'],safeguards:['privacy','user choice','no medical inference']},
 {id:'city-api',name:'StreetVerse City API',thesis:'Permissioned city/business/event data can power experiences, media and commerce without requiring every partner to build a metaverse.',firstPrototype:'city events + verified businesses + media schedule API',revenue:['developer/API plans','enterprise integrations'],safeguards:['licensed/open data','rate limits','no sensitive infrastructure exposure']},
 {id:'skill-to-income',name:'Mission-to-Credential-to-Work',thesis:'Game-like training can produce evidence-backed skill badges that connect users to real opportunities.',firstPrototype:'training mission → assessment → badge → eligible opportunity directory',revenue:['employer programs','training sponsorship','education partnerships'],safeguards:['no guaranteed jobs','valid assessments','minor protections']},
 {id:'personal-agent-market',name:'User-Owned Agent Market',thesis:'A personal TRYAMM agent can negotiate preferences across commerce and media while revealing only what the user authorizes.',firstPrototype:'local request → agent compares eligible offers → user approves purchase',revenue:['transaction fee','premium agent tools'],safeguards:['explicit approval for purchases','minimal data','no dark patterns']},
]

export const FRONTIER_LAB_RULES={
 prototypesAreNotProductionClaims:true,
 testDemandBeforeScaling:true,
 measurableUnitEconomics:true,
 humanApprovalForMaterialActions:true,
 serverVerifiedMoneyMovement:true,
 privacyByDefault:true,
 accessibilityByDefault:true,
 rightsAndConsentByDefault:true,
} as const
