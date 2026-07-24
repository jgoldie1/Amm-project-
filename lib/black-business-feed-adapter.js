"use strict";

function normalizeBlackBusinessFeedItem(input = {}) {
  if (!input.businessId) throw new Error("BUSINESS_ID_REQUIRED");

  return {
    id: input.id || `black-business:${input.businessId}`,
    contentType: input.contentType || "business",
    surface: input.surface || "support-black-business",
    businessId: input.businessId,
    ownerId: input.ownerId || null,
    title: input.title || input.businessName || "Business",
    description: input.description || "",
    mediaUrl: input.mediaUrl || null,
    thumbnailUrl: input.thumbnailUrl || null,
    live: input.live === true,
    shopLive: input.shopLive === true,
    city: input.city || null,
    region: input.region || null,
    country: input.country || "US",
    categories: Array.isArray(input.categories) ? input.categories : [],
    verificationLevel: input.verificationLevel || "self_attested",
    holoCouponIds: Array.isArray(input.holoCouponIds) ? input.holoCouponIds : [],
    storefrontId: input.storefrontId || null,
    holoMenuId: input.holoMenuId || null,
    rideEligible: input.rideEligible === true,
    deliveryEligible: input.deliveryEligible === true,
    africaDiaspora: input.africaDiaspora === true,
    paidPlacement: input.paidPlacement === true,
    paidPlacementLabel: input.paidPlacement === true ? (input.paidPlacementLabel || "Sponsored") : null,
    commerceAvailable: input.commerceAvailable !== false,
    ageLane: input.ageLane || "all",
    moderationStatus: input.moderationStatus || "approved",
    rightsStatus: input.rightsStatus || "not_applicable",
    createdAt: input.createdAt || new Date().toISOString(),
    rankingSignals: {
      qualityScore: Number(input.qualityScore || 0),
      customerRating: Number(input.customerRating || 0),
      saves: Number(input.saves || 0),
      shares: Number(input.shares || 0),
      couponConversionRate: Number(input.couponConversionRate || 0),
      purchaseConversionRate: Number(input.purchaseConversionRate || 0),
      distanceMiles: Number.isFinite(Number(input.distanceMiles)) ? Number(input.distanceMiles) : null,
      freshnessScore: Number(input.freshnessScore || 0)
    }
  };
}

function eligibleForUser(item, context = {}) {
  if (item.moderationStatus !== "approved") return false;
  if (context.country && item.country && item.country !== context.country && context.allowCrossBorder !== true) return false;
  if (context.ageLane === "teen" && item.ageLane === "adult") return false;
  if (context.blockedBusinessIds?.includes(item.businessId)) return false;
  return true;
}

function scoreItem(item, context = {}) {
  const s = item.rankingSignals || {};
  let score = 0;

  score += Math.min(20, Number(s.qualityScore || 0) * 2);
  score += Math.min(15, Number(s.customerRating || 0) * 3);
  score += Math.min(10, Number(s.saves || 0) / 20);
  score += Math.min(10, Number(s.shares || 0) / 20);
  score += Math.min(15, Number(s.couponConversionRate || 0) * 15);
  score += Math.min(15, Number(s.purchaseConversionRate || 0) * 15);
  score += Math.min(10, Number(s.freshnessScore || 0) * 10);

  if (context.city && item.city && context.city.toLowerCase() === item.city.toLowerCase()) score += 20;
  if (context.preferLive && item.live) score += 15;
  if (context.preferShopLive && item.shopLive) score += 15;
  if (context.preferCoupons && item.holoCouponIds?.length) score += 10;
  if (context.africaDiaspora === true && item.africaDiaspora) score += 10;

  if (s.distanceMiles !== null && s.distanceMiles !== undefined) {
    score += Math.max(0, 15 - Math.min(15, s.distanceMiles));
  }

  return score;
}

function buildSupportBlackBusinessFeed(items = [], context = {}) {
  return items
    .map(normalizeBlackBusinessFeedItem)
    .filter(item => eligibleForUser(item, context))
    .map(item => ({ ...item, rankScore: scoreItem(item, context) }))
    .sort((a, b) => b.rankScore - a.rankScore);
}

module.exports = {
  normalizeBlackBusinessFeedItem,
  eligibleForUser,
  scoreItem,
  buildSupportBlackBusinessFeed
};
