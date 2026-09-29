export type FounderRevenueSource='business-plan'|'production-package'|'commerce-fee'|'advertising'|'sponsorship'|'subscription'|'ppv-ticket'|'marketplace'|'licensing'|'business-service'
export interface FounderRevenueScenario{source:FounderRevenueSource;grossMinor:number;currency:string;note:string}

export const FOUNDER_REVENUE_MODEL={
 principle:'Founder compensation comes from TRYAMM company revenue/profit under declared business, tax and payout rules; customer gross receipts are not automatically personal income.',
 recurringBusinessPlans:[
  {plan:'Starter',priceMinor:2900},
  {plan:'Growth',priceMinor:4900},
  {plan:'Business Pass',priceMinor:14900},
 ],
 oneTimeBusinessPackages:[
  {plan:'Preview',priceMinor:49900},
  {plan:'Experience',priceMinor:125000},
  {plan:'Digital Twin',priceMinor:250000},
 ],
 additionalSources:['Holo Ads','sponsorship','commerce fees','eligible subscriptions','PPV/tickets','marketplace fees','licensing','production/business services'],
} as const

export const founderGrossExamples={
 recurring100Starter:100*2900,
 recurring100Growth:100*4900,
 recurring100BusinessPass:100*14900,
 package10Preview:10*49900,
 package10Experience:10*125000,
 package10DigitalTwin:10*250000,
} as const

export const FOUNDER_PAYOUT_RULES={
 companyReceivesCustomerRevenueFirst:true,
 deductRefundsChargebacksTaxesProcessorFeesAndDeclaredSplits:true,
 creatorScoutRightsHolderAndVendorObligationsPaidBeforeTreatingRemainderAsFounderProfit:true,
 founderPayMustFollowEntityTaxAndAccountingRules:true,
 noGuaranteedIncome:true,
 authoritativeLedgerRequired:true,
} as const
