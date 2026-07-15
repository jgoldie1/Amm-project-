const Stripe = require('stripe');

function client() {
  return process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
}

function requireUrl(value, name) {
  if (!value || !/^https?:\/\//i.test(String(value))) throw new Error(`${name} must be an absolute http(s) URL.`);
  return value;
}

async function createCheckout({
  kind,
  priceId,
  quantity = 1,
  customerEmail,
  customerId,
  userId,
  successUrl,
  cancelUrl,
  referralCode,
  campaignId,
  country,
  platform,
  idempotencyKey,
  clientReferenceId
}) {
  const stripe = client();
  if (!stripe) return { provider: 'stripe', mode: 'mock', url: `/platform.html?checkout=mock&kind=${encodeURIComponent(kind || 'payment')}` };
  if (!priceId) throw new Error('Stripe price ID is required.');
  if (!['subscription', 'token-pack', 'payment'].includes(kind)) throw new Error('Stripe checkout kind must be subscription, token-pack, or payment.');

  const metadata = {
    kind,
    userId: String(userId || ''),
    referralCode: String(referralCode || ''),
    campaignId: String(campaignId || ''),
    country: String(country || ''),
    platform: String(platform || '')
  };

  const params = {
    mode: kind === 'subscription' ? 'subscription' : 'payment',
    line_items: [{ price: priceId, quantity: Math.max(1, Number(quantity) || 1) }],
    customer: customerId || undefined,
    customer_email: customerId ? undefined : (customerEmail || undefined),
    success_url: requireUrl(successUrl, 'successUrl'),
    cancel_url: requireUrl(cancelUrl, 'cancelUrl'),
    allow_promotion_codes: true,
    client_reference_id: clientReferenceId || userId || undefined,
    metadata,
    subscription_data: kind === 'subscription' ? { metadata } : undefined,
    payment_intent_data: kind === 'subscription' ? undefined : { metadata }
  };

  const session = await stripe.checkout.sessions.create(params, idempotencyKey ? { idempotencyKey } : undefined);
  return { provider: 'stripe', mode: 'live', id: session.id, url: session.url, customer: session.customer || customerId || null };
}

async function createCustomerPortal({ customerId, returnUrl, idempotencyKey }) {
  const stripe = client();
  if (!stripe) return { provider: 'stripe', mode: 'mock', url: '/platform.html?portal=mock' };
  if (!customerId) throw new Error('Stripe customer ID is required.');
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: requireUrl(returnUrl, 'returnUrl')
  }, idempotencyKey ? { idempotencyKey } : undefined);
  return { provider: 'stripe', mode: 'live', id: session.id, url: session.url };
}

async function retrieveCheckoutSession(sessionId) {
  const stripe = client();
  if (!stripe) return { provider: 'stripe', mode: 'mock', id: sessionId, payment_status: 'paid', status: 'complete' };
  if (!sessionId) throw new Error('Stripe checkout session ID is required.');
  return stripe.checkout.sessions.retrieve(sessionId, { expand: ['customer', 'subscription', 'payment_intent'] });
}

function verifyWebhook(rawBody, signature) {
  const stripe = client();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) throw new Error('Stripe webhook verification is not configured.');
  if (!signature) throw new Error('Stripe webhook signature is required.');
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = {
  createCheckout,
  createCustomerPortal,
  retrieveCheckoutSession,
  verifyWebhook,
  connected: () => Boolean(client())
};