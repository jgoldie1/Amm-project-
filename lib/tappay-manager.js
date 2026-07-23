const crypto = require('crypto');

function createTapPayManager({ manifest, io }) {
  const intents = new Map();
  const now = () => new Date().toISOString();
  const emit = (event, payload) => io && io.emit(event, payload);

  const regionMap = {
    NG: { region: 'africa', currency: 'NGN', preferred: ['flutterwave','paystack'], methods: ['card','bank-transfer','ussd','apple-pay','google-pay','opay'] },
    GH: { region: 'africa', currency: 'GHS', preferred: ['flutterwave','paystack'], methods: ['card','mobile-money'] },
    KE: { region: 'africa', currency: 'KES', preferred: ['flutterwave','paystack'], methods: ['card','mpesa'] },
    ZA: { region: 'africa', currency: 'ZAR', preferred: ['flutterwave','paystack'], methods: ['card','bank','apple-pay','google-pay'] },
    BR: { region: 'latin-america', currency: 'BRL', preferred: ['stripe','regional-latam-adapter'], methods: ['card','pix','apple-pay','google-pay','boleto-where-supported'] },
    MX: { region: 'latin-america', currency: 'MXN', preferred: ['stripe','regional-latam-adapter'], methods: ['card','bank-transfer','wallets'] },
    CO: { region: 'latin-america', currency: 'COP', preferred: ['flutterwave','regional-latam-adapter'], methods: ['card','bank-transfer','wallets'] },
    AR: { region: 'latin-america', currency: 'ARS', preferred: ['regional-latam-adapter'], methods: ['card','bank-transfer','wallets'] },
    US: { region: 'north-america', currency: 'USD', preferred: ['stripe','flutterwave'], methods: ['card','apple-pay','google-pay','ach','tap-to-pay-provider-sdk'] },
  };

  function routeForCountry(countryCode = 'US') {
    const key = String(countryCode || 'US').toUpperCase();
    return regionMap[key] || { region: 'global', currency: 'USD', preferred: ['stripe','flutterwave','approved-global-adapter'], methods: ['card','wallets','bank-transfer-where-supported'] };
  }

  function createIntent(input = {}) {
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('VALID_AMOUNT_REQUIRED');
    const country = String(input.country || 'US').toUpperCase();
    const route = routeForCountry(country);
    const currency = String(input.currency || route.currency).toUpperCase();
    const method = input.method || route.methods[0];
    if (!route.methods.includes(method)) throw new Error('UNSUPPORTED_PAYMENT_METHOD_FOR_ROUTE');
    const intent = {
      id: crypto.randomUUID(),
      country,
      region: route.region,
      currency,
      amount: Number(amount.toFixed(2)),
      method,
      providerCandidates: route.preferred,
      provider: input.provider || route.preferred[0],
      customerId: input.customerId || null,
      merchantId: input.merchantId || null,
      orderId: input.orderId || null,
      purpose: input.purpose || 'checkout',
      status: 'created',
      fxQuote: input.fxQuote || null,
      feeDisclosure: input.feeDisclosure || null,
      compliance: { kycKybRequired: true, sanctionsScreening: true, providerEligibilityRequired: true },
      createdAt: now(),
      updatedAt: now()
    };
    intents.set(intent.id, intent); emit('tappay:intent', intent); return intent;
  }

  function updateIntent(id, patch = {}) {
    const intent = intents.get(id); if (!intent) return null;
    const allowed = ['status','provider','providerReference','fxQuote','feeDisclosure','settlementReference','failureCode'];
    for (const key of allowed) if (patch[key] !== undefined) intent[key] = patch[key];
    intent.updatedAt = now(); emit('tappay:intent', intent); return intent;
  }

  function getIntent(id) { return intents.get(id) || null; }
  function listIntents() { return Array.from(intents.values()).sort((a,b) => b.createdAt.localeCompare(a.createdAt)); }
  function report() {
    const byRegion = {}; const byStatus = {};
    for (const i of intents.values()) { byRegion[i.region]=(byRegion[i.region]||0)+1; byStatus[i.status]=(byStatus[i.status]||0)+1; }
    return { intents: intents.size, byRegion, byStatus };
  }

  return { routeForCountry, createIntent, updateIntent, getIntent, listIntents, report };
}

module.exports = { createTapPayManager };
