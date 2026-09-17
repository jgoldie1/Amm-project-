export type RetailLane='all-american-store'|'all-american-beauty'|'holofon-telecom'
export type RetailCapability={id:string;label:string;lane:RetailLane;status:'ready'|'provider-gated';authority:'server'|'provider';notes:string}

export const ALL_AMERICAN_RETAIL_CAPABILITIES:RetailCapability[]=[
{id:'marketplace',label:'All American Store marketplace',lane:'all-american-store',status:'ready',authority:'server',notes:'General merchandise, local businesses, Business Passport/QR, authoritative inventory and order records.'},
{id:'vendor-onboarding',label:'Vendor + business onboarding',lane:'all-american-store',status:'ready',authority:'server',notes:'Merchant identity, catalog, fulfillment and policy gates precede sellable inventory.'},
{id:'warehouse-delivery',label:'Virtual Warehouse + Holo Delivery',lane:'all-american-store',status:'ready',authority:'server',notes:'Reservation, fulfillment, tracking, delivery proof, returns and authoritative inventory decrement.'},
{id:'live-pk',label:'LIVE / PK creator commerce',lane:'all-american-store',status:'ready',authority:'server',notes:'Product pins and creator attribution may initiate checkout; clients never settle money or mutate inventory.'},
{id:'beauty-wigs',label:'Wigs + hair bundles',lane:'all-american-beauty',status:'ready',authority:'server',notes:'Black/African-American beauty-focused assortment with verified supplier/authenticity controls.'},
{id:'beauty-braiding',label:'Braiding hair + protective-style supplies',lane:'all-american-beauty',status:'ready',authority:'server',notes:'Supplier, authenticity, price-floor and inventory gates apply.'},
{id:'beauty-makeup',label:'Makeup + lashes + nails',lane:'all-american-beauty',status:'ready',authority:'server',notes:'Inclusive beauty catalog, creator storefronts and business-in-a-box routing.'},
{id:'holofon-devices',label:'Holo FON devices + accessories',lane:'holofon-telecom',status:'provider-gated',authority:'provider',notes:'Device availability, activation and network claims require verified telecom/provider integration.'},
{id:'holofon-plans',label:'Holo FON plans + activation',lane:'holofon-telecom',status:'provider-gated',authority:'provider',notes:'Plans, numbers, eSIM/SIM and service activation remain carrier/provider authoritative.'},
{id:'holofon-billpay',label:'Pay My Holo FON Bill',lane:'holofon-telecom',status:'provider-gated',authority:'provider',notes:'TRYAMM may create a payment intent/portal handoff; only the billing/payment provider may mark a bill paid.'},
{id:'holofon-account',label:'Holo FON account + usage',lane:'holofon-telecom',status:'provider-gated',authority:'provider',notes:'Balance, usage, due date, autopay and service status require authenticated provider data.'},
]

export const RETAIL_SHARED_GUARDRAILS={
clientMayMutateInventory:false,
clientMayMarkBillPaid:false,
clientMayActivateTelecomService:false,
clientMaySettleRealMoney:false,
providerSettlementRequired:true,
returnsAndRefundsServerAuthoritative:true,
storehouseSeparateFromSellerRevenue:true,
}

export const STREETVERSE_RETAIL_LOOP=['DISCOVER STORE','SCAN BUSINESS PASSPORT / ENTER STOREFRONT','BROWSE VERIFIED INVENTORY','LIVE/PK OR STANDARD CART','SERVER AUTHORIZATION','PROVIDER PAYMENT WHEN REQUIRED','WAREHOUSE / MERCHANT FULFILLMENT','HOLO DELIVERY / PICKUP','PROOF + RECEIPT','RETURNS / SUPPORT','LEDGER + ATTRIBUTION','REORDER / NEXT MISSION'] as const
