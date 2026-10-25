'use strict';

// Pure, dependency-free qualification rules for MiddleVerse AI Website Services.
// This module makes no outbound calls, stores no PII, and never marks orders paid.
const ALLOWED_SERVICES = Object.freeze([
  { id: 'starter', name: 'Starter Website', scope: 'Mobile-friendly website, contact form and launch handoff' },
  { id: 'pro', name: 'Business Pro', scope: 'Multi-page website with approved booking or catalog requirements' },
  { id: 'premium', name: 'AI Business Premium', scope: 'Website and specifically approved AI/customer-intake integrations' }
]);
const CATEGORIES = new Set(['beauty','mobility','logistics','restaurant','security','creator','other']);
function clean(value, max=160) {
  return String(value == null ? '' : value).trim().slice(0,max);
}
function createWebsiteLead(input={}, approval={}) {
  const category = clean(input.category,40).toLowerCase();
  const plan = ALLOWED_SERVICES.find(p=>p.id===clean(input.plan,30).toLowerCase()) || null;
  const isApproved = Boolean(approval && approval.offersApproved && approval.pricesApproved);
  const rawPrice = plan && approval.pricesCents && approval.pricesCents[plan.id];
  const validPrice = Number.isSafeInteger(rawPrice) && rawPrice > 0;
  const lead = {
    businessId: clean(input.businessId,80),
    category: CATEGORIES.has(category) ? category : 'other',
    planId: plan ? plan.id : null,
    businessName: clean(input.businessName,120),
    contactName: clean(input.contactName,120),
    contactEmail: clean(input.contactEmail,200),
    requirements: clean(input.requirements,1200),
    source: clean(input.source,100) || 'middleverse-ai',
    status: 'new_unverified_lead',
    paymentStatus: 'not_requested'
  };
  const missing = [];
  if (!lead.businessId) missing.push('businessId');
  if (!lead.businessName) missing.push('businessName');
  if (!/^\S+@\S+\.\S+$/.test(lead.contactEmail)) missing.push('contactEmail');
  if (!plan) missing.push('plan');
  return {
    lead, valid: missing.length===0, missing,
    displayOffer: plan && isApproved && validPrice ? {
      name: plan.name, scope: plan.scope, priceCents: rawPrice, currency: 'USD'
    } : null,
    response: missing.length ? 'I can help with your website request. Please provide the missing information.' :
      (isApproved && validPrice ? 'Your inquiry is ready for a business representative. Pricing and delivery remain subject to confirmed checkout and acceptance.' :
      'Thank you. Your website inquiry can be reviewed by the business. A representative must confirm the final scope, pricing and availability.'),
    canCreateCheckout: missing.length===0 && isApproved && validPrice,
    paid: false
  };
}
function canPublishCreatorLink({approved=false,moderationPassed=false,targetUrl='',allowedHosts=[]}={}) {
  if (!approved || !moderationPassed) return false;
  try {
    const u=new URL(targetUrl);
    if (u.protocol!=='https:' || u.username || u.password) return false;
    return Array.isArray(allowedHosts) && allowedHosts.some(host=>u.hostname===host);
  } catch { return false; }
}
module.exports={ALLOWED_SERVICES,createWebsiteLead,canPublishCreatorLink};
