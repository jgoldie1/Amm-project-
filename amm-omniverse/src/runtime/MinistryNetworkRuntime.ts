export type MinistryTaxStatus='unverified'|'church-claim-pending'|'501c3-verified'|'other-exempt-verified'|'nonprofit-not-tax-exempt'

export interface MinistryApplication {
  organizationName:string
  leaderName:string
  email?:string
  state?:string
  einLast4?:string
  taxStatus:MinistryTaxStatus
  services:string[]
}

const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

export function submitMinistryApplication(input:MinistryApplication){
  const request={...input,requestedAt:new Date().toISOString(),status:'pending-verification',rules:{noAutomatic501c3Label:true,verifyOrganization:true,verifyPaymentDestination:true,verifyTaxTreatment:true}}
  emit('tryamm:ministry-network:application-request',request)
  return request
}

export function requestMinistryGiving(input:{ministryId:string;amountCents:number;purpose:string;donorUserId?:string}){
  const request={...input,requestedAt:new Date().toISOString(),status:'pending-server-verification',rules:{paymentAccountRequired:true,accountingDestinationRequired:true,receiptWorkflowRequired:true,taxDeductibilityMustBeVerified:true,noClientSideSettlement:true}}
  emit('tryamm:ministry-giving:request',request)
  emit('tryamm:payments:verification-required',{...request,reason:'Ministry giving must be processed by a verified payment/accounting destination; tax deductibility is never implied by the client.'})
  return request
}

export function requestMinistryServicePayment(input:{ministryId:string;amountCents:number;service:string;customerUserId?:string}){
  const request={...input,requestedAt:new Date().toISOString(),status:'pending-server-verification',classification:'service-payment-not-donation',rules:{paymentAccountRequired:true,receiptRequired:true,noTaxDeductionClaim:true,noClientSideSettlement:true}}
  emit('tryamm:ministry-service-payment:request',request)
  return request
}

export function installMinistryNetworkRuntime(){
  const w=window as typeof window & {__tryammSubmitMinistryApplication?:typeof submitMinistryApplication;__tryammRequestMinistryGiving?:typeof requestMinistryGiving;__tryammRequestMinistryServicePayment?:typeof requestMinistryServicePayment}
  w.__tryammSubmitMinistryApplication=submitMinistryApplication
  w.__tryammRequestMinistryGiving=requestMinistryGiving
  w.__tryammRequestMinistryServicePayment=requestMinistryServicePayment
  emit('tryamm:ministry-network:ready',{leaderOnboarding:true,otherMinistries:true,givingProviderGate:true,servicePaymentsSeparatedFromDonations:true,taxStatusVerificationRequired:true})
}
