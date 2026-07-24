"use strict";

const TAB_TYPES = {
  "for-you": null,
  following: null,
  live: new Set(["live-stream", "game-live"]),
  "shop-live": new Set(["shop-live"]),
  "business-live": new Set(["business-live"]),
  reels: new Set(["reel", "creator-video"]),
  threads: new Set(["thread-post"]),
  "news-tv": new Set(["news-clip", "tv-clip"]),
  holomusic: new Set(["music-track", "music-video"]),
  games: new Set(["game-clip", "game-live"]),
  local: new Set(["local-business", "holo-coupon", "business-live"])
};

function includesCountry(item, country) {
  const list = item.countryAvailability || ["GLOBAL"];
  return list.includes("GLOBAL") || list.includes(country);
}

function isAgeAllowed(item, ageLane) {
  const lane = item.ageLane || "all";
  if (lane === "all") return true;
  return lane === ageLane;
}

function isRightsAllowed(item) {
  return !["blocked", "expired", "unverified-required"].includes(item.rightsStatus);
}

function isCommerceAllowed(item, context) {
  const actions = item.commerceActions || [];
  if (!actions.length) return true;
  if (!context.commerceEnabled) return false;
  return true;
}

function score(item, context) {
  const e = item.engagement || {};
  let s = 0;
  s += Number(e.watchTimeScore || 0) * 3;
  s += Number(e.completionRate || 0) * 2;
  s += Number(e.shareRate || 0) * 2;
  s += Number(e.saveRate || 0);
  s += Number(e.commentQuality || 0);
  s += Number(e.purchaseConversion || 0) * 2;
  s += Number(e.couponConversion || 0) * 2;
  s += Number(item.freshnessScore || 0);
  s += Number(item.safetyQualityScore || 0) * 2;
  if (context.followingCreatorIds?.includes(item.creatorId)) s += 8;
  if (context.localRegion && item.localRegion === context.localRegion) s += 6;
  if (context.language && item.language === context.language) s += 2;
  return s;
}

function buildFeed(items = [], context = {}) {
  const tab = context.tab || "for-you";
  const allowedTypes = TAB_TYPES[tab];

  return items
    .filter(item => !allowedTypes || allowedTypes.has(item.contentType))
    .filter(item => includesCountry(item, context.country || "US"))
    .filter(item => isAgeAllowed(item, context.ageLane || "adult"))
    .filter(isRightsAllowed)
    .filter(item => item.moderationStatus !== "blocked")
    .filter(item => !(context.blockedCreatorIds || []).includes(item.creatorId))
    .filter(item => isCommerceAllowed(item, context))
    .filter(item => tab !== "following" || (context.followingCreatorIds || []).includes(item.creatorId))
    .map(item => ({ ...item, rankingScore: score(item, context) }))
    .sort((a, b) => b.rankingScore - a.rankingScore);
}

module.exports = { buildFeed, TAB_TYPES };
