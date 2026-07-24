"use strict";

function createBlackBusinessCommandCenter({ db }) {
  if (!db) throw new Error("DB_REQUIRED");

  async function getDashboard(businessId) {
    const [profile, procurement, funding, suppliers, campaigns] = await Promise.all([
      db.getBlackBusinessProfile(businessId),
      db.listProcurementMatches(businessId),
      db.listFundingMatches(businessId),
      db.listSupplierExchangeListings({ businessId }),
      db.listActiveBlackBusinessCampaigns()
    ]);

    return {
      profile,
      procurement,
      funding,
      suppliers,
      campaigns,
      readiness: calculateReadiness(profile)
    };
  }

  function calculateReadiness(profile = {}) {
    const checks = [
      ["directoryOptIn", profile.opted_in === true],
      ["verification", Boolean(profile.verification_level)],
      ["categories", Array.isArray(profile.categories) && profile.categories.length > 0],
      ["location", Boolean(profile.country_code)],
      ["supplierProfile", Boolean(profile.supplier_ready)],
      ["fundingProfile", Boolean(profile.funding_ready)]
    ];

    const completed = checks.filter(([, ok]) => ok).length;
    return {
      completed,
      total: checks.length,
      percent: Math.round((completed / checks.length) * 100),
      checks: checks.map(([name, ok]) => ({ name, ok }))
    };
  }

  function scoreOpportunityMatch({ business, opportunity }) {
    let score = 0;
    const reasons = [];
    const businessCategories = new Set(business.categories || []);
    const overlap = (opportunity.categories || []).filter(c => businessCategories.has(c));

    if (overlap.length) {
      score += Math.min(50, overlap.length * 15);
      reasons.push(`category_match:${overlap.join(",")}`);
    }

    if (business.supplier_ready) {
      score += 20;
      reasons.push("supplier_ready");
    }

    if (business.country_code && opportunity.geography && opportunity.geography.includes(business.country_code)) {
      score += 15;
      reasons.push("geography_match");
    }

    return { score: Math.min(100, score), reasons };
  }

  function scoreFundingMatch({ business, opportunity }) {
    let score = 0;
    const reasons = [];

    if (business.funding_ready) {
      score += 30;
      reasons.push("funding_ready_profile");
    }

    if (business.country_code && opportunity.geography && opportunity.geography.includes(business.country_code)) {
      score += 20;
      reasons.push("geography_match");
    }

    const categories = new Set(business.categories || []);
    const text = `${opportunity.title || ""} ${opportunity.eligibility_summary || ""}`.toLowerCase();
    const matched = [...categories].filter(c => text.includes(String(c).toLowerCase()));
    if (matched.length) {
      score += Math.min(30, matched.length * 10);
      reasons.push(`category_signal:${matched.join(",")}`);
    }

    return { score: Math.min(100, score), reasons };
  }

  async function publishSupplierListing(input = {}) {
    if (!input.businessId) throw new Error("BUSINESS_ID_REQUIRED");
    if (!input.title) throw new Error("TITLE_REQUIRED");
    if (!['supply','request','wholesale','partnership'].includes(input.listingType)) {
      throw new Error("INVALID_LISTING_TYPE");
    }

    return db.createSupplierExchangeListing({
      businessId: input.businessId,
      listingType: input.listingType,
      title: input.title,
      description: input.description || null,
      categories: input.categories || [],
      minimumOrder: Number(input.minimumOrder || 0),
      currency: input.currency || "USD",
      countriesServed: input.countriesServed || []
    });
  }

  return {
    getDashboard,
    calculateReadiness,
    scoreOpportunityMatch,
    scoreFundingMatch,
    publishSupplierListing
  };
}

module.exports = { createBlackBusinessCommandCenter };
