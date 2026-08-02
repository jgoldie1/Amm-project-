'use strict';

async function jsonRequest(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok) {
    const error = new Error(`Provider ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    error.status = response.status;
    error.providerResponse = data;
    throw error;
  }
  return data;
}

function paystackConfigured() { return Boolean(process.env.PAYSTACK_SECRET_KEY); }
function flutterwaveConfigured() { return Boolean(process.env.FLUTTERWAVE_SECRET_KEY); }

async function initializePaystack({ email, amountMinor, reference, callbackUrl, metadata, purpose }) {
  if (!paystackConfigured()) throw new Error('Paystack is not configured');
  const data = await jsonRequest('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount: amountMinor, currency: 'NGN', reference, callback_url: callbackUrl, metadata: metadata || { purpose } })
  });
  return { provider: 'paystack', reference, checkoutUrl: data?.data?.authorization_url || null, accessCode: data?.data?.access_code || null, raw: data };
}

async function verifyPaystack(reference) {
  if (!paystackConfigured()) throw new Error('Paystack is not configured');
  const data = await jsonRequest(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
  });
  return {
    provider: 'paystack', reference,
    status: data?.data?.status || 'unknown',
    amountMinor: Number(data?.data?.amount || 0),
    currency: data?.data?.currency || null,
    raw: data
  };
}

async function initializeFlutterwave({ email, amountMinor, reference, callbackUrl, metadata, purpose }) {
  if (!flutterwaveConfigured()) throw new Error('Flutterwave is not configured');
  const meta = metadata || { purpose };
  const data = await jsonRequest('https://api.flutterwave.com/v3/payments', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tx_ref: reference,
      amount: (amountMinor / 100).toFixed(2),
      currency: 'NGN',
      redirect_url: callbackUrl,
      customer: { email },
      meta,
      customizations: { title: 'TryAMM Nigeria', description: meta?.purpose || 'TryAMM payment' }
    })
  });
  return { provider: 'flutterwave', reference, checkoutUrl: data?.data?.link || null, raw: data };
}

async function verifyFlutterwave(transactionId) {
  if (!flutterwaveConfigured()) throw new Error('Flutterwave is not configured');
  const data = await jsonRequest(`https://api.flutterwave.com/v3/transactions/${encodeURIComponent(transactionId)}/verify`, {
    headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
  });
  return {
    provider: 'flutterwave', transactionId,
    status: data?.data?.status || 'unknown',
    amountMinor: Math.round(Number(data?.data?.amount || 0) * 100),
    currency: data?.data?.currency || null,
    reference: data?.data?.tx_ref || null,
    raw: data
  };
}

async function initialize(provider, payload) {
  if (provider === 'paystack') return initializePaystack(payload);
  if (provider === 'flutterwave') return initializeFlutterwave(payload);
  throw new Error('Unsupported Africa payment provider');
}

async function verify(provider, referenceOrTransactionId) {
  if (provider === 'paystack') return verifyPaystack(referenceOrTransactionId);
  if (provider === 'flutterwave') return verifyFlutterwave(referenceOrTransactionId);
  throw new Error('Unsupported Africa payment provider');
}

module.exports = {
  paystackConfigured,
  flutterwaveConfigured,
  initializePaystack,
  verifyPaystack,
  initializeFlutterwave,
  verifyFlutterwave,
  initialize,
  verify
};
