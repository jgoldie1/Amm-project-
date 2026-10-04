export type DomainProvisionState='draft'|'quoted'|'payment-pending'|'paid'|'registration-pending'|'registered'|'dns-pending'|'ssl-pending'|'verifying'|'live'|'failed'
export type DomainRegistrant={
 name:string;organization?:string;email:string;phone:string;
 address1:string;city:string;region:string;postalCode:string;country:string
}
export type DomainProvisionRequest={
 id:string;siteId:string;domain:string;registrant:DomainRegistrant;state:DomainProvisionState;
 autoRenew:boolean;privacyRequested:boolean;hostingTarget:string;
 quoteMinor?:number;currency?:'USD';provider?:string;providerOrderId?:string;
 dnsConfigured?:boolean;sslReady?:boolean;ownershipVerified?:boolean;paymentVerified?:boolean
}

export const DOMAIN_AUTOMATION_FLOW=[
 'DOMAIN SEARCH','AVAILABILITY / QUOTE','REGISTRANT INFO','DISCLOSURES / CONSENT','PAYMENT',
 'REGISTRAR PURCHASE','NAMESERVER / DNS CONFIG','HOSTING BIND','SSL CERTIFICATE','RESOLUTION CHECK','SITE HEALTH CHECK','LIVE'
] as const

export function validateRegistrant(r:DomainRegistrant){
 const missing:string[]=[]
 for(const [key,value] of Object.entries(r)){if(!String(value||'').trim())missing.push(key)}
 return{valid:missing.length===0,missing}
}

export function domainCanGoLive(x:DomainProvisionRequest){
 const blockers:string[]=[]
 if(x.state==='failed')blockers.push('provisioning_failed')
 if(!x.paymentVerified)blockers.push('verified_payment_required')
 if(!x.providerOrderId)blockers.push('registrar_confirmation_required')
 if(!x.dnsConfigured)blockers.push('dns_not_configured')
 if(!x.sslReady)blockers.push('ssl_not_ready')
 if(!x.ownershipVerified)blockers.push('domain_resolution_not_verified')
 return{live:blockers.length===0,blockers}
}

export const DOMAIN_PROVISIONING_BOUNDARY={
 automaticAfterProviderConnection:true,
 registrarApiRequired:true,
 serverSideCredentialsOnly:true,
 browserDoesNotHoldRegistrarSecrets:true,
 paymentMustBeVerifiedBeforeRegistration:true,
 noDomainClaimBeforeProviderConfirmation:true,
 sslAndDnsMustVerifyBeforeLive:true,
} as const