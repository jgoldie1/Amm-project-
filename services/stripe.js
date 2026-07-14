const Stripe = require('stripe');

function client() {
  return process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
}

async function createCheckout({ kind, priceId, quantity = 1, customerEmail, successUrl, cancelUrl }) {
  const stripe = client();
  if (!stripe) return { provider: 'stripe', mode: 'mock', url: `/platform.html?checkout=mock&kind=${encodeURIComponent(kind)}` };
  if (!priceId) throw new Error('Stripe price ID is required.');
  const session = await stripe.checkout.sessions.create({
    mode: kind === 'subscription' ? 'subscription' : 'payment',
    line_items: [{ price: priceId, quantity }],
    customer_email: customerEmail || undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: { kind }
  });
  return { provider: 'stripe', mode: 'live', id: session.id, url: session.url };
}

function verifyWebhook(rawBody, signature) {
  const stripe = client();
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return { mock: true, type: 'mock.webhook' };
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = { createCheckout, verifyWebhook, connected: () => Boolean(client()) };
