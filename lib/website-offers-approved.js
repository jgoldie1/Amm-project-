'use strict';
// Owner-approved TRYAMM Website Services launch price card, confirmed 2026-10-24.
// Prices are in USD cents. Activation requires separately tested Stripe checkout,
// defined fulfillment terms, and verified entitlement; this file never charges anyone.
const approvedWebsiteOffers=Object.freeze({
  currency:'USD',
  approvedOn:'2026-10-24',
  approvedBy:'business-owner',
  offersApproved:true,
  pricesApproved:true,
  pricesCents:Object.freeze({starter:19900,pro:49900,premium:99900}),
  supportMonthlyCents:4900,
  supportBillingPeriod:'month',
  published:false,
  liveCheckoutEnabled:false,
  freeTemplateCampaignLimit:10,
  freeTemplateTestimonialPolicy:'Optional honest feedback only; no positive review required',
  disclaimers:Object.freeze([
    'Domain registration, AI consumption and third-party service charges must be disclosed before checkout.',
    'Scope, revision count, delivery timelines and refund terms require final confirmation before live purchase.',
    'Monthly support must not be billed until customers explicitly consent to recurring charges.'
  ])
});
module.exports={approvedWebsiteOffers};
