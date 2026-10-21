import {TEMPLATE_CATALOG} from './templateCatalog'
import {TEMPLATE_SECTORS} from './templateSectors'

export const US_STATES=['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'] as const
export type FundingProfile={name:string;templateId:string;state:string;stage:string;amount:string;useOfFunds:string;customers:string;revenueModel:string;competition:string;ownerExperience:string;milestones:string;revenueEstimate:string;expensesEstimate:string;notes:string}
export type ReadinessStep={id:string;title:string;why:string;resource?:string;industry?:boolean}
const SBA_LAUNCH='https://www.sba.gov/counseling/launch-your-business/'
export const BASE_STEPS:ReadinessStep[]=[
 {id:'business-idea',title:'Describe the customer, service, market and business model',why:'A funder needs to understand how the company will earn revenue.',resource:'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan'},
 {id:'registered',title:'Check business structure, name and entity registration',why:'Check the state and local formation rules. The website cannot register an entity for you.',resource:SBA_LAUNCH},
 {id:'ein',title:'Determine whether an EIN is needed; apply directly with the IRS for free',why:'Tax identification may be required for banking, hiring and permits.',resource:'https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number'},
 {id:'licenses',title:'Verify federal, state, county and city license and permit requirements',why:'Requirements vary by activity and physical location, and some expire.',resource:SBA_LAUNCH},
 {id:'bank',title:'Review business banking and record separation',why:'Separating business finances improves financial recordkeeping.',resource:SBA_LAUNCH},
 {id:'insurance',title:'Discuss commercial liability, property, auto and worker coverage as relevant',why:'Insurance needs depend on activities, employees, contracts and location.',resource:SBA_LAUNCH},
 {id:'tax',title:'Review tax registration, bookkeeping and filing obligations with a qualified preparer',why:'Sales, income, payroll and excise obligations differ by business.',resource:'https://www.irs.gov/businesses'},
 {id:'plan',title:'Write a business plan and market strategy',why:'Lenders commonly need a plan grounded in actual assumptions.',resource:'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan'},
 {id:'funds',title:'Itemize funding amount and intended use',why:'A specific equipment, inventory, operating or staffing budget is stronger than an unsupported round-number request.',resource:'https://www.sba.gov/loans/lender-match/'},
 {id:'financials',title:'Prepare historical records and clearly labeled cash-flow projections',why:'Do not invent sales, assets, income or guarantees.',resource:'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan'},
 {id:'marketing',title:'Prepare honest website, customer terms, privacy and marketing practices',why:'Avoid unsupported performance claims and misleading testimonials.',resource:'https://www.ftc.gov/business-guidance/advertising-marketing'},
 {id:'contracts',title:'Review customer agreements, supplier terms, record retention and data security',why:'Operational compliance depends on the services and information collected.',resource:'https://www.sba.gov/counseling/launch-your-business/'},
]
export const INDUSTRY_STEPS:Record<string,ReadinessStep[]>={
 'Beauty & Personal Care':[
  {id:'industry-cosmetology',title:'Confirm cosmetology, barbering, braiding or nail-practice rules as applicable',why:'Professional licensing can vary substantially by state and exact service.',industry:true,resource:SBA_LAUNCH},
  {id:'industry-products',title:'Review cosmetics labeling, sanitation and product-safety requirements if selling goods',why:'Product sellers and beauty practitioners face different rules.',industry:true,resource:'https://www.fda.gov/cosmetics'},
 ],
 'Care & Mobility':[
  {id:'industry-care',title:'Confirm whether this service involves regulated medical care, healthcare data, prescriptions or mobility equipment',why:'A public website does not create HIPAA compliance or medical licensure.',industry:true,resource:'https://www.hhs.gov/hipaa/'},
  {id:'industry-claims',title:'Require appropriate professional review of health, fitness and savings claims',why:'Do not present diagnosis, a medical service or insurance discounts until verified.',industry:true,resource:'https://www.ftc.gov/business-guidance/advertising-marketing'},
 ],
 'Creator & Entertainment':[
  {id:'industry-rights',title:'Clear music, video, image, performance, release and distribution rights',why:'Ownership, licensing, artist agreements and publishing rights determine what may be sold.',industry:true,resource:'https://www.copyright.gov/'},
  {id:'industry-sponsored',title:'Review endorsements, paid promotions and participant permissions',why:'Sponsored creator posts and testimonials require truthful disclosure.',industry:true,resource:'https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews'},
 ],
 'Faith & Community':[
  {id:'industry-charity',title:'Verify entity, fundraising and tax-exempt status before claiming donations are deductible',why:'Creating a ministry or foundation website does not create 501(c)(3) status.',industry:true,resource:'https://www.irs.gov/charities-non-profits'},
  {id:'industry-youth',title:'Review child safety, background screening and participant consent for youth programs',why:'Program protections depend on local law and activities.',industry:true,resource:SBA_LAUNCH},
 ],
 'Food & Retail':[
  {id:'industry-food',title:'Verify food establishment permits, handling, labeling and inspections where applicable',why:'Catering, delivery and food preparation may require inspections and certified staff.',industry:true,resource:'https://www.fda.gov/food'},
  {id:'industry-fulfillment',title:'Document returns, sales tax, delivery, sourcing and customer terms',why:'Online checkout requires real operational, consumer and tax arrangements.',industry:true,resource:'https://www.ftc.gov/business-guidance/advertising-marketing'},
 ],
 'Professional & Finance':[
  {id:'industry-regulated',title:'Determine required professional, financial, legal or money-transmission authorizations',why:'A website cannot enable legal practice, credit services, loan brokering or remittances.',industry:true,resource:SBA_LAUNCH},
  {id:'industry-finance-ads',title:'Have consumer-finance claims and disclosures independently reviewed',why:'No guaranteed credit score, loan approval, investment return or regulated advice.',industry:true,resource:'https://www.ftc.gov/business-guidance/advertising-marketing'},
 ],
 'Property & Trades':[
  {id:'industry-contractor',title:'Verify contractor, trade, real-estate brokerage and inspection licenses as applicable',why:'Different licensed activities cannot be bundled as one generic authorization.',industry:true,resource:SBA_LAUNCH},
  {id:'industry-property',title:'Check bonding, building permits, fair-housing rules and project insurance as applicable',why:'Rental, brokerage, construction and home services each carry distinct duties.',industry:true,resource:'https://www.hud.gov/'},
 ],
 'Security & Legal':[
  {id:'industry-guards',title:'Verify security company, guard, instructor and professional credentials separately',why:'A template does not authorize regulated guard services, weapons training or legal advice.',industry:true,resource:SBA_LAUNCH},
  {id:'industry-procedures',title:'Review liability coverage, staff screening, local operating limits and client contracts',why:'Unauthorized services and inaccurate credential claims create risk.',industry:true,resource:'https://www.ftc.gov/business-guidance/advertising-marketing'},
 ],
 'Technology & Workforce':[
  {id:'industry-data',title:'Review privacy, security, data retention and appropriate consent',why:'AI call centers and automation must not assume permission to collect or contact people.',industry:true,resource:'https://www.ftc.gov/business-guidance/privacy-security'},
  {id:'industry-labor',title:'Review independent contractor, employment, remote-work and communications requirements',why:'Do not promise jobs, wages or automatic outreach without legal review.',industry:true,resource:'https://www.dol.gov/agencies/whd'},
 ],
 'Travel & Logistics':[
  {id:'industry-transport',title:'Determine whether motor carrier, broker, aviation or transport authorization applies',why:'Transportation activities may have specialized registration and insurance requirements.',industry:true,resource:'https://www.fmcsa.dot.gov/registration'},
  {id:'industry-booking',title:'Review rental terms, commercial vehicle insurance and customer disclosures',why:'Showing listings does not mean availability, coverage or lawful rental operations.',industry:true,resource:SBA_LAUNCH},
 ],
}
export const FUNDING_PATHS=[
 {id:'self',title:'Self-funding / preorders',description:'Test demand and operating costs before taking debt. Preorders require truthful delivery terms.',url:'https://www.sba.gov/business-guide/plan-your-business/fund-your-business',type:'Planning'},
 {id:'micro',title:'SBA Microloan intermediaries',description:'Explore intermediaries offering eligible loans up to $50,000. Lenders decide underwriting, rates and availability.',url:'https://www.sba.gov/loans/microloans/',type:'Loan'},
 {id:'match',title:'SBA Lender Match',description:'Request introductions to participating lenders. Matching does not mean approval.',url:'https://www.sba.gov/loans/lender-match/',type:'Loan'},
 {id:'grants',title:'Targeted grant research',description:'Search opportunity-specific grants. SBA generally does not award ordinary startup/expansion grants.',url:'https://www.sba.gov/loans/additional-funding-opportunities/grants/',type:'Research'},
 {id:'contracts',title:'SAM.gov federal awards / contracts',description:'Only complete SAM registration when applicable for awards. Unique Entity ID and registration are free.',url:'https://sam.gov/entity-registration',type:'Government'},
 {id:'research',title:'Research and innovation programs',description:'Explore competitively awarded research programs only if the company performs eligible R&D.',url:'https://www.sba.gov/funding-programs/grants/small-business-innovation-research-program-sbir',type:'Research'},
]
export function sectorForTemplate(templateId:string){return TEMPLATE_SECTORS[templateId]||'General Business'}
export function checklistForTemplate(templateId:string){return [...BASE_STEPS,...(INDUSTRY_STEPS[sectorForTemplate(templateId)]||[{id:'industry-research',title:'Confirm all industry-specific permits and disclosures with local authorities',why:'Generic templates do not resolve special licensing.',resource:SBA_LAUNCH,industry:true}])]}
export function getTemplateName(templateId:string){return TEMPLATE_CATALOG.find(t=>t.id===templateId)?.name||'Independent business'}
export function readinessSummary(templateId:string,completed:ReadonlySet<string>){const tasks=checklistForTemplate(templateId);return {total:tasks.length,done:tasks.filter(t=>completed.has(t.id)).length}}
export function makeFundingPacket(profile:FundingProfile,completed:ReadonlySet<string>){
 const sector=sectorForTemplate(profile.templateId),tasks=checklistForTemplate(profile.templateId)
 const val=(s:string)=>s.trim()||'[Owner to complete]'
 const money=(s:string)=>s.trim()?('$'+Number(s).toLocaleString('en-US')):'[Owner to determine]'
 return [
 'TRYAMM BUSINESS FUNDING READINESS PACKET',
 'DRAFT / SELF-REPORTED / NOT SUBMITTED / NOT VERIFIED / NO FUNDING GUARANTEE',
 'Prepared: '+new Date().toISOString().slice(0,10),
 '',
 'BUSINESS PROFILE',
 'Business name: '+val(profile.name),
 'Business concept: '+getTemplateName(profile.templateId),
 'Sector: '+sector,
 'State or jurisdiction: '+val(profile.state),
 'Stage: '+val(profile.stage),
 '',
 'BUSINESS PLAN OUTLINE',
 'Products/services and market: '+val(profile.customers),
 'Revenue model: '+val(profile.revenueModel),
 'Competition and differentiation: '+val(profile.competition),
 'Owner/team experience: '+val(profile.ownerExperience),
 'First milestones: '+val(profile.milestones),
 '',
 'REQUESTED FUNDING',
 'Requested capital (not approval or eligibility): '+money(profile.amount),
 'Detailed use of funds and budget: '+val(profile.useOfFunds),
 'Estimated monthly revenue (unverified forecast): '+money(profile.revenueEstimate),
 'Estimated monthly operating costs (unverified forecast): '+money(profile.expensesEstimate),
 'Additional notes: '+val(profile.notes),
 '',
 'BUSINESS READINESS CHECKLIST — OWNER SELF-ATTESTED ONLY',
 ...tasks.map(t=>(completed.has(t.id)?'[OWNER MARKED] ':'[NOT MARKED] ')+t.title+(t.resource?' — '+t.resource:'')),
 '',
 'FUNDING PATHS TO RESEARCH; NOT QUALIFICATION OR APPROVAL',
 ...FUNDING_PATHS.map(p=>p.title+': '+p.url),
 '',
 'IMPORTANT: No data was submitted to lenders or government agencies. A business plan, licenses, official registrations, insurance and compliance still require independent verification.',
 ].join('\n')
}
