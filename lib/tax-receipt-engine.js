"use strict";

function resolveTaxResponsibility(input = {}) {
  const {
    marketplaceFacilitatorRequired = false,
    merchantTaxResponsible = true,
    sellerOfRecord = "merchant",
    jurisdiction = "unknown"
  } = input;

  if (marketplaceFacilitatorRequired) {
    return {
      jurisdiction,
      sellerOfRecord,
      taxCollector: "tryamm",
      taxRemitter: "tryamm",
      merchantTaxResponsibleForThisMarketplaceSale: false,
      reason: "marketplace_facilitator_required"
    };
  }

  return {
    jurisdiction,
    sellerOfRecord,
    taxCollector: merchantTaxResponsible ? "merchant" : "configured-provider",
    taxRemitter: merchantTaxResponsible ? "merchant" : "configured-provider",
    merchantTaxResponsibleForThisMarketplaceSale: merchantTaxResponsible,
    reason: "merchant_or_provider_responsibility"
  };
}

function buildDigitalReceipt(input = {}) {
  const items = Array.isArray(input.items) ? input.items : [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const discount = Number(input.discount || 0);
  const tax = Number(input.tax || 0);
  const fees = Number(input.fees || 0);
  const tip = Number(input.tip || 0);
  const total = Math.max(0, subtotal - discount + tax + fees + tip);

  return {
    receiptId: input.receiptId,
    transactionId: input.transactionId,
    merchantName: input.merchantName,
    merchantAddress: input.merchantAddress || null,
    merchantSupport: input.merchantSupport || null,
    occurredAt: input.occurredAt || new Date().toISOString(),
    items,
    subtotal,
    discount,
    tax,
    fees,
    tip,
    total,
    currency: input.currency || "USD",
    paymentMethodMasked: input.paymentMethodMasked || null,
    holoCouponCode: input.holoCouponCode || null,
    refundPolicyUrl: input.refundPolicyUrl || null,
    verificationUrl: input.verificationUrl || null,
    deliveryChannels: {
      sms: Boolean(input.sms),
      email: Boolean(input.email),
      inApp: input.inApp !== false,
      qr: Boolean(input.qr)
    }
  };
}

module.exports = {
  resolveTaxResponsibility,
  buildDigitalReceipt
};
