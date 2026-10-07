export type BusinessOSCheckoutOffer={
  id:string
  label:string
  paymentLinkId:string
  url:string
  live:boolean
}

export const BUSINESS_OS_CHECKOUT_MODE='sandbox' as const
export const BUSINESS_OS_CHECKOUT_OFFERS:Record<string,BusinessOSCheckoutOffer>={
  starter:{id:'business-in-a-box-starter',label:'Starter Site',paymentLinkId:'plink_1UO47oFfjMtLicwAl88swLby',url:'https://buy.stripe.com/test_8x2aEXgpa02zcTFf2o5AQ00',live:false},
  pro:{id:'business-in-a-box-pro',label:'Business-in-a-Box Pro',paymentLinkId:'plink_1UO47rFfjMtLicwACKCF9c3l',url:'https://buy.stripe.com/test_9B6bJ11ug2aH2f12fC5AQ01',live:false},
  commerce:{id:'business-in-a-box-commerce',label:'Commerce + Growth',paymentLinkId:'plink_1UO47tFfjMtLicwAgJRu9G2X',url:'https://buy.stripe.com/test_14AbJ15Kw8z5g5R07u5AQ02',live:false},
  managed:{id:'business-in-a-box-managed',label:'Managed Business',paymentLinkId:'plink_1UO47vFfjMtLicwAW90964pm',url:'https://buy.stripe.com/test_00w4gzc8U4iP06T4nK5AQ03',live:false},
  'ai-business-os':{id:'ai-business-os',label:'Stubbs AI Business OS',paymentLinkId:'plink_1UO47xFfjMtLicwA9LTMWe4j',url:'https://buy.stripe.com/test_eVq3cva0M2aHcTFaM85AQ04',live:false},
  'holo-services':{id:'holo-services',label:'Holo Services Suite',paymentLinkId:'plink_1UO47zFfjMtLicwALbdUP0Vn',url:'https://buy.stripe.com/test_00wdR9a0MdTp5rd2fC5AQ05',live:false},
}

export function checkoutOffer(id:string){return BUSINESS_OS_CHECKOUT_OFFERS[id]}
export const BUSINESS_OS_CHECKOUT_NOTICE='SANDBOX CHECKOUT • TEST MODE • NO REAL MONEY IS COLLECTED'
