export type JourneyStage =
  | 'authenticated'
  | 'passport_ready'
  | 'business_ready'
  | 'order_ready'
  | 'jarvis_approved'
  | 'payment_sandbox_authorized'
  | 'delivery_ready'
  | 'audited'
  | 'complete';

export type PayToPlayEntitlement = {
  id: string;
  accountId: string;
  productId: string;
  mode: 'one_time' | 'subscription' | 'event_access' | 'game_access' | 'creator_access' | 'business_feature';
  status: 'preview' | 'payment_required' | 'active' | 'expired' | 'revoked' | 'refunded';
  startsAt?: string;
  endsAt?: string;
  sourcePaymentId?: string;
};

export type PayToPlayContext = {
  authenticatedUserId?: string;
  passportId?: string;
  businessId?: string;
  orderId?: string;
  jarvisApprovalId?: string;
  sandboxPaymentId?: string;
  deliveryId?: string;
  auditEventId?: string;
};

export type JourneyDecision = {
  stage: JourneyStage;
  allowed: boolean;
  reason: string;
  nextAction?: string;
};

export function evaluatePayToPlayJourney(ctx: PayToPlayContext): JourneyDecision {
  if (!ctx.authenticatedUserId) return { stage: 'authenticated', allowed: false, reason: 'Authentication required.', nextAction: 'sign_in' };
  if (!ctx.passportId) return { stage: 'passport_ready', allowed: false, reason: 'A valid TRYAMM Passport is required.', nextAction: 'complete_passport' };
  if (!ctx.businessId) return { stage: 'business_ready', allowed: false, reason: 'Business context is required for this business journey.', nextAction: 'select_or_create_business' };
  if (!ctx.orderId) return { stage: 'order_ready', allowed: false, reason: 'Create or select an order before payment.', nextAction: 'create_order' };
  if (!ctx.jarvisApprovalId) return { stage: 'jarvis_approved', allowed: false, reason: 'Human approval is required for the prepared JARVIS action.', nextAction: 'review_jarvis_action' };
  if (!ctx.sandboxPaymentId) return { stage: 'payment_sandbox_authorized', allowed: false, reason: 'Sandbox payment authorization required.', nextAction: 'authorize_sandbox_payment' };
  if (!ctx.deliveryId) return { stage: 'delivery_ready', allowed: false, reason: 'A delivery or fulfillment record is required.', nextAction: 'create_fulfillment' };
  if (!ctx.auditEventId) return { stage: 'audited', allowed: false, reason: 'Audit evidence is required before completion.', nextAction: 'write_audit_event' };
  return { stage: 'complete', allowed: true, reason: 'Authenticated pay-to-play sandbox journey complete.' };
}

export function canActivateEntitlement(input: {
  entitlement: PayToPlayEntitlement;
  realMoneyGateEnabled: boolean;
  paymentEnvironment: 'sandbox' | 'production';
}) {
  const { entitlement, realMoneyGateEnabled, paymentEnvironment } = input;
  if (paymentEnvironment === 'production' && !realMoneyGateEnabled) {
    return { allowed: false, reason: 'REAL_MONEY feature gate is disabled.' };
  }
  if (!entitlement.sourcePaymentId) {
    return { allowed: false, reason: 'Payment evidence is required.' };
  }
  if (entitlement.status === 'revoked' || entitlement.status === 'refunded') {
    return { allowed: false, reason: `Entitlement is ${entitlement.status}.` };
  }
  return { allowed: true, reason: `${paymentEnvironment} entitlement activation requirements satisfied.` };
}

// Security rules:
// - Client state never authorizes production payment or entitlement activation.
// - Production activation is server-authoritative and tied to verified provider evidence.
// - Paid-prize/game access must also pass jurisdiction/age/rules gates where applicable.
// - Human approval remains mandatory for JARVIS-prepared consequential transactions.
