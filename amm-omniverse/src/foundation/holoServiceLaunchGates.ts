/** Cross-service launch gates. These describe verified production capabilities,
 * not mere existence of UI tabs, records, or AI-generated claims. */
export type HoloService = 'advertising'|'rideshare'|'delivery'|'freight'|'drone'|'payments'|'support'|'identity'|'privacy'|'accessibility'|'safety'|'analytics'
export type ServiceGate = 'providerAuthorized'|'identityVerified'|'privacyConsent'|'termsAndRefunds'|'paymentVerified'|'insuranceVerified'|'dispatchVerified'|'regulatoryClearance'|'rightsCleared'|'humanEscalation'|'accessibilityTested'|'eventAuditVerified'
export const HOLO_SERVICE_GATES:Readonly<Record<HoloService,readonly ServiceGate[]>>={
 advertising:['providerAuthorized','identityVerified','privacyConsent','termsAndRefunds','paymentVerified','rightsCleared','humanEscalation','eventAuditVerified'],
 rideshare:['providerAuthorized','identityVerified','privacyConsent','termsAndRefunds','paymentVerified','insuranceVerified','dispatchVerified','regulatoryClearance','humanEscalation','accessibilityTested'],
 delivery:['providerAuthorized','identityVerified','privacyConsent','termsAndRefunds','paymentVerified','insuranceVerified','dispatchVerified','humanEscalation','eventAuditVerified'],
 freight:['providerAuthorized','identityVerified','privacyConsent','termsAndRefunds','paymentVerified','insuranceVerified','dispatchVerified','regulatoryClearance','humanEscalation','eventAuditVerified'],
 drone:['providerAuthorized','identityVerified','privacyConsent','termsAndRefunds','paymentVerified','insuranceVerified','dispatchVerified','regulatoryClearance','humanEscalation','eventAuditVerified'],
 payments:['providerAuthorized','identityVerified','privacyConsent','termsAndRefunds','paymentVerified','humanEscalation','eventAuditVerified'],
 support:['identityVerified','privacyConsent','humanEscalation','accessibilityTested','eventAuditVerified'],
 identity:['providerAuthorized','identityVerified','privacyConsent','humanEscalation','eventAuditVerified'],
 privacy:['privacyConsent','humanEscalation','eventAuditVerified'],
 accessibility:['accessibilityTested','humanEscalation'],
 safety:['privacyConsent','humanEscalation','eventAuditVerified'],
 analytics:['privacyConsent','identityVerified','eventAuditVerified']
} as const
export type GateEvidence={gate:ServiceGate;verified:boolean;authority:string;reference:string;checkedAt:string;expiresAt?:string}
export function assessHoloService(service:HoloService,evidence:readonly GateEvidence[],now:Date=new Date()){
 const required=HOLO_SERVICE_GATES[service]
 const isVerified=(gate:ServiceGate)=>{
  const matches=evidence.filter(e=>e.gate===gate)
  // Conflicting or duplicated evidence must not silently pass.
  if(matches.length!==1)return false
  const e=matches[0]
  return e.verified===true&&!!e.authority.trim()&&!!e.reference.trim()&&
   Number.isFinite(Date.parse(e.checkedAt))&&Date.parse(e.checkedAt)<=now.getTime()&&
   (!e.expiresAt||(Number.isFinite(Date.parse(e.expiresAt))&&Date.parse(e.expiresAt)>now.getTime()))
 }
 const missing=required.filter(g=>!isVerified(g))
 return {service,passed:required.length-missing.length,total:required.length,missing,ready:missing.length===0}
}
export const HOLO_SERVICE_LABELS:Record<HoloService,string>={
 advertising:'Holo Advertise',rideshare:'Holo Ride',delivery:'Holo Delivery',
 freight:'Holo Logistics',drone:'Holo Drone',payments:'Holo Pay and Refunds',
 support:'Holo Support and Disputes',identity:'Holo Identity / Provider Verification',
 privacy:'Holo Privacy and Consent',accessibility:'Holo Access',
 safety:'Holo Guardian',analytics:'Holo Analytics and Attribution'
}
