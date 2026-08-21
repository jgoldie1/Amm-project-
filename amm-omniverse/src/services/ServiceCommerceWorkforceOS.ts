export const SERVICE_COMMERCE_WORKFORCE_OS = {
  identityRule:'ONE TRYAMM ID → MANY VERIFIED ROLES → ONE ACCESSIBILITY PROFILE → ROLE-SCOPED PERMISSIONS → SHARED MONEY/TAX/PAYOUT EVIDENCE',
  onboardingRoles:[
    'rider','driver','food-delivery-courier','restaurant-owner','restaurant-staff','marketplace-vendor','advertiser','creator','ministry-worker','employee','contractor','student','educator','agency-member','dealer','franchise-operator','support-agent'
  ],
  commonSteps:[
    'create/sign-in account','verify email/phone as required','age/guardian lane','accessibility/preferences','role selection','identity/business verification where required','terms/consents','background/license/insurance gates when applicable','tax/payroll classification','payout destination','training','role-specific readiness','activate'
  ],
  roleGates:{
    driver:['driver-license','vehicle-registration','insurance','background-check-provider','local/state operating requirements'],
    'food-delivery-courier':['identity','age','transport-mode','background-check if program requires','delivery safety training'],
    'restaurant-owner':['business identity','menu/price/tax setup','food-service permits represented as external evidence','payout/tax profile'],
    advertiser:['business/identity','ad policy','billing','creative rights','targeting/privacy policy'],
    'ministry-worker':['organization relationship','role authorization','worker classification','service program terms','tax/payroll setup as applicable'],
    employee:['employer relationship','I-9/W-4 or provider workflow as applicable','payroll profile','direct-deposit/payout','policy acknowledgments'],
    student:['age/guardian where applicable','learning passport','accessibility','program enrollment'],
    educator:['identity','role authorization','program/institution assignment','safeguarding/training where applicable']
  }
} as const

export const HOLO_COMMERCE_SURFACES = {
  menu:{name:'Holo Menu',capabilities:['3D/AR menu preview','dietary/allergen fields','availability','modifiers','pickup/delivery','translation','accessibility','restaurant-controlled pricing']},
  coupons:{name:'Holo Coupons',capabilities:['merchant campaigns','eligibility rules','start/end dates','usage limits','server redemption','family/member offers','no fake scarcity']},
  advertising:{name:'Holo Advertising',capabilities:['search ads','promoted storefronts','creator campaigns','venue ads','local offers','clearly labeled sponsored placements','budget/cap controls','conversion attribution']},
  search:{name:'Holo Search',capabilities:['business/service discovery','menu/item search','jobs','courses','ministry/community services','creators','events','venues','accessibility filters','location/availability filters']}
} as const

export const RIDE_DELIVERY_CONTRACT = {
  ride:'REQUEST → QUOTE → ELIGIBLE DRIVER MATCH → ACCEPT → ARRIVAL → TRIP → SAFETY/INCIDENT CHANNEL → COMPLETE → FARE FINALIZE → PAYMENT → DRIVER EARNINGS LEDGER → RATING/SUPPORT',
  food:'BROWSE HOLO MENU → CART → COUPON → ORDER → MERCHANT ACCEPT → PREP → COURIER MATCH → PICKUP → DELIVERY → PAYMENT FINALIZE → MERCHANT/COURIER LEDGERS → SUPPORT/REFUND',
  hardRules:['no client-generated fares or payouts','driver/courier eligibility server-authoritative','emergency/safety escalation always available','tips/fees disclosed','refunds/chargebacks reconcile ledger','local regulated-service gates remain external-evidence based']
} as const

export const WORKFORCE_TAX_TRUTH = {
  canDoNow:['prepare worker/vendor profiles','classify employee/contractor workflow states','collect provider-ready tax onboarding data securely','calculate/reconcile payroll inputs','track W-2/1099/other form readiness','store filing status/evidence references','produce review queues'],
  notLiveWithoutProvider:['IRS IRIS transmission','SSA W-2/W-3 transmission','state/local payroll filings','tax payments/remittances','direct-deposit payroll execution unless payment/payroll provider is live'],
  productionGates:['authorized payroll/tax filing provider or approved IRS/SSA credentials','secure taxpayer onboarding','entity tax configuration','state/local registrations','bank/funding setup','webhook/signature verification','sandbox filing test','production filing acknowledgement/reconciliation']
} as const

export const SERVICE_GROWTH_LOOP='SEARCH/DISCOVERY → LANDING PAGE → AI CALL CENTER/CHAT HELP → ONBOARD ROLE → TRAIN/VERIFY → WORK/BUY/LEARN/SERVE → MONEY/REWARD/PROGRESS LEDGER → COUPON/AD/RECOMMENDATION → RETURN/REFER'
