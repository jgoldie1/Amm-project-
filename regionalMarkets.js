const defaultMarkets = [
  { id: "africa", name: "Africa Regional", region: "africa", countries: [], code: "AFRICA-40", currency: "USD", locale: "en", status: "campaign", ambassadorProgram: true },
  { id: "nigeria", name: "Nigeria", region: "africa", countries: ["NG"], code: "NIGERIA-LAUNCH", currency: "NGN", locale: "en-NG", status: "planned", ambassadorProgram: true },
  { id: "ghana", name: "Ghana", region: "africa", countries: ["GH"], code: "GHANA-LAUNCH", currency: "GHS", locale: "en-GH", status: "planned", ambassadorProgram: true },
  { id: "kenya", name: "Kenya", region: "africa", countries: ["KE"], code: "KENYA-LAUNCH", currency: "KES", locale: "en-KE", status: "planned", ambassadorProgram: true },
  { id: "south-africa", name: "South Africa", region: "africa", countries: ["ZA"], code: "SOUTHAFRICA-LAUNCH", currency: "ZAR", locale: "en-ZA", status: "planned", ambassadorProgram: true },
  { id: "asia", name: "Asia Regional", region: "asia", countries: [], code: "ASIA-41", currency: "USD", locale: "en", status: "campaign", ambassadorProgram: true },
  { id: "india", name: "India", region: "asia", countries: ["IN"], code: "INDIA-LAUNCH", currency: "INR", locale: "en-IN", status: "planned", ambassadorProgram: true },
  { id: "japan", name: "Japan", region: "asia", countries: ["JP"], code: "JAPAN-LAUNCH", currency: "JPY", locale: "ja-JP", status: "planned", ambassadorProgram: true },
  { id: "philippines", name: "Philippines", region: "asia", countries: ["PH"], code: "PHILIPPINES-42", currency: "PHP", locale: "en-PH", status: "campaign", ambassadorProgram: true }
];

const marketRequirements = [
  "Local-currency display and settlement through licensed providers",
  "Country-specific tax, consumer-protection, privacy, and payout review",
  "Localized language, support, moderation, and accessibility",
  "Regional music charts and business-directory discovery",
  "Fraud, duplicate-account, sanctions, and identity checks",
  "Regional ambassador agreements and transparent commissions",
  "Music licensing, royalty reporting, and territory rights",
  "Country-aware pricing approved before public launch"
];

function createRegionalMarketStore() {
  const markets = new Map(defaultMarkets.map((market) => [market.id, { ...market }]));
  const ambassadors = new Map();

  return {
    list() { return [...markets.values()]; },
    get(id) { return markets.get(id); },
    create(input) {
      const id = String(input.id || input.name || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const name = String(input.name || "").trim().slice(0, 80);
      const region = String(input.region || "global").trim().toLowerCase().slice(0, 30);
      const code = String(input.code || "").trim().toUpperCase();
      const currency = String(input.currency || "USD").trim().toUpperCase();
      const locale = String(input.locale || "en").trim().slice(0, 20);
      if (!id || !name || !/^[A-Z0-9-]{4,40}$/.test(code) || !/^[A-Z]{3}$/.test(currency)) throw new Error("Valid name, code, and 3-letter currency are required.");
      if (markets.has(id) || [...markets.values()].some((item) => item.code === code)) throw new Error("Market ID or code already exists.");
      const market = { id, name, region, countries: Array.isArray(input.countries) ? input.countries.slice(0, 20) : [], code, currency, locale, status: "planned", ambassadorProgram: input.ambassadorProgram !== false };
      markets.set(id, market);
      return market;
    },
    update(id, input) {
      const market = markets.get(id);
      if (!market) return null;
      if (input.status !== undefined) {
        const status = String(input.status).toLowerCase();
        if (!["planned", "campaign", "pilot", "active", "paused"].includes(status)) throw new Error("Invalid market status.");
        market.status = status;
      }
      if (input.currency !== undefined) {
        const currency = String(input.currency).toUpperCase();
        if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Currency must be a 3-letter code.");
        market.currency = currency;
      }
      if (input.locale !== undefined) market.locale = String(input.locale).slice(0, 20);
      return market;
    },
    addAmbassador(input) {
      const market = markets.get(String(input.marketId || ""));
      const displayName = String(input.displayName || "").trim().slice(0, 80);
      if (!market || !displayName) throw new Error("Valid marketId and displayName are required.");
      const ambassador = { id: input.id, marketId: market.id, displayName, referralCode: String(input.referralCode || market.code).toUpperCase(), status: "pending", qualifiedConversions: 0, commissionCents: 0 };
      ambassadors.set(ambassador.id, ambassador);
      return ambassador;
    },
    listAmbassadors() { return [...ambassadors.values()]; }
  };
}

module.exports = { createRegionalMarketStore, marketRequirements };
