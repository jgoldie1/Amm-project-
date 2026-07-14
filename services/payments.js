const crypto = require("crypto");

const PROVIDERS = new Set(["flutterwave", "paystack", "mock"]);

function getProvider(requested) {
  const configured = String(process.env.AFRICA_PAYMENT_PROVIDER || "mock").toLowerCase();
  const candidate = String(requested || configured).toLowerCase();
  return PROVIDERS.has(candidate) ? candidate : "mock";
}

function asMinorUnits(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) throw new Error("A positive payment amount is required.");
  return Math.round(value * 100);
}

function reference(prefix = "amm") {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

async function initializePayment(input) {
  const provider = getProvider(input.provider);
  const txRef = input.reference || reference("pay");
  const currency = String(input.currency || "NGN").toUpperCase();
  const amount = Number(input.amount);
  if (!input.email) throw new Error("Customer email is required.");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("A positive payment amount is required.");

  if (provider === "mock") {
    return {
      provider,
      reference: txRef,
      status: "pending",
      checkoutUrl: `/payments/mock-success?reference=${encodeURIComponent(txRef)}`,
      currency,
      amount
    };
  }

  if (provider === "paystack") {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.email,
        amount: asMinorUnits(amount),
        currency,
        reference: txRef,
        callback_url: input.callbackUrl,
        metadata: input.metadata || {},
        subaccount: input.subaccount,
        transaction_charge: input.platformFeeMinor,
        bearer: input.feeBearer || "account"
      })
    });
    const data = await response.json();
    if (!response.ok || !data.status) throw new Error(data.message || "Paystack initialization failed.");
    return { provider, reference: data.data.reference, status: "pending", checkoutUrl: data.data.authorization_url, accessCode: data.data.access_code, raw: data.data };
  }

  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not configured.");
  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      tx_ref: txRef,
      amount,
      currency,
      redirect_url: input.callbackUrl,
      payment_options: input.paymentOptions || "card,banktransfer,ussd,mobilemoney",
      customer: { email: input.email, name: input.customerName, phonenumber: input.phone },
      customizations: { title: input.title || "TryAMM", description: input.description || "TryAMM purchase" },
      meta: input.metadata || {},
      subaccounts: Array.isArray(input.subaccounts) ? input.subaccounts : undefined
    })
  });
  const data = await response.json();
  if (!response.ok || data.status !== "success") throw new Error(data.message || "Flutterwave initialization failed.");
  return { provider, reference: txRef, status: "pending", checkoutUrl: data.data.link, raw: data.data };
}

function verifyWebhook(provider, rawBody, headers) {
  const body = Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody || "");
  if (provider === "paystack") {
    const signature = headers["x-paystack-signature"];
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!signature || !key) return false;
    const digest = crypto.createHmac("sha512", key).update(body).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(String(signature)));
  }
  if (provider === "flutterwave") {
    const signature = headers["verif-hash"] || headers["flutterwave-signature"];
    const secret = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    if (!signature || !secret) return false;
    return crypto.timingSafeEqual(Buffer.from(String(signature)), Buffer.from(String(secret)));
  }
  return true;
}

async function createPayout(input) {
  const provider = getProvider(input.provider);
  const amount = Number(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("A positive payout amount is required.");
  const currency = String(input.currency || "NGN").toUpperCase();
  const txRef = input.reference || reference("payout");

  if (provider === "mock") return { provider, reference: txRef, status: "queued", amount, currency };

  if (provider === "paystack") {
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
    const response = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ source: "balance", amount: asMinorUnits(amount), recipient: input.recipientCode, reference: txRef, reason: input.reason || "TryAMM creator payout" })
    });
    const data = await response.json();
    if (!response.ok || !data.status) throw new Error(data.message || "Paystack payout failed.");
    return { provider, reference: data.data.reference, status: data.data.status, raw: data.data };
  }

  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key) throw new Error("FLUTTERWAVE_SECRET_KEY is not configured.");
  const response = await fetch("https://api.flutterwave.com/v3/transfers", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      account_bank: input.bankCode,
      account_number: input.accountNumber,
      amount,
      currency,
      narration: input.reason || "TryAMM creator payout",
      reference: txRef,
      beneficiary_name: input.beneficiaryName,
      callback_url: input.callbackUrl,
      debit_currency: input.debitCurrency || currency
    })
  });
  const data = await response.json();
  if (!response.ok || data.status !== "success") throw new Error(data.message || "Flutterwave payout failed.");
  return { provider, reference: txRef, status: data.data.status || "queued", raw: data.data };
}

module.exports = { getProvider, initializePayment, verifyWebhook, createPayout };
