export type BusinessPlanId='free'|'preview'|'experience'|'digital-twin'|'business-pass'
export interface BusinessPlan{
 id:BusinessPlanId; name:string; priceMinor:number; billing:'free'|'one-time'|'monthly'
 description:string; includes:string[]; example:string
}

export const TRYAMM_BUSINESS_PLANS:BusinessPlan[]=[
 {id:'free',name:'Free Listing',priceMinor:0,billing:'free',description:'Claim a basic TRYAMM Business Passport and see how the network works before buying.',includes:['basic listing','business QR','category and contact details','StreetVerse directory eligibility','plan examples'],example:'See a sample business card/listing and QR entry point.'},
 {id:'preview',name:'TRYAMM Preview',priceMinor:49900,billing:'one-time',description:'A richer preview of how the business can appear across TRYAMM.',includes:['enhanced profile','media preview','Business Twin concept preview','QR campaign setup'],example:'Preview the business as a richer TRYAMM destination before a larger build.'},
 {id:'experience',name:'TRYAMM Experience',priceMinor:125000,billing:'one-time',description:'Interactive business experience package.',includes:['interactive experience setup','media placement setup','StreetVerse experience configuration','campaign launch assistance'],example:'Customer enters an interactive branded experience from QR or StreetVerse.'},
 {id:'digital-twin',name:'Digital Twin',priceMinor:250000,billing:'one-time',description:'Higher-detail digital business representation.',includes:['digital twin production scope','interactive location','commerce/media connection','StreetVerse integration scope'],example:'A business becomes a navigable interactive destination subject to asset/source availability.'},
 {id:'business-pass',name:'Business Pass',priceMinor:14900,billing:'monthly',description:'Ongoing TRYAMM business network services.',includes:['ongoing Business Passport services','campaign tools','analytics','network updates','eligible media/commerce integrations'],example:'Manage the business, QR funnel, campaigns and performance from one recurring service.'},
]

export const PLAN_SELECTION_FLOW=[
 'Scout or owner opens free listing',
 'owner claims/verifies business',
 'show real examples and side-by-side plan capabilities',
 'owner chooses Free or a paid plan voluntarily',
 'show exact price, billing cadence and included scope before checkout',
 'server creates verified checkout for selected plan',
 'entitlement activates only after verified payment',
 'conversion and Scout attribution update from authoritative events',
] as const

export const PLAN_RULES={
 freeListingHasNoCardRequirement:true,
 noForcedUpgrade:true,
 examplesMustBeClearlyLabeledExampleOrDemo:true,
 noFakePerformanceClaims:true,
 exactPriceBeforeCheckout:true,
 recurringBillingClearlyDisclosed:true,
 cancellationTermsVisibleBeforeSubscription:true,
 upgradesRequireOwnerApproval:true,
 scoutCannotSelectPaidPlanForOwner:true,
 paidEntitlementRequiresVerifiedPayment:true,
} as const
