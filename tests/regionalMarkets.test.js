const assert = require("assert");
const { createRegionalMarketStore, marketRequirements } = require("../regionalMarkets");

const store = createRegionalMarketStore();
const markets = store.list();

assert(markets.some((market) => market.code === "AFRICA-40"));
assert(markets.some((market) => market.code === "ASIA-41"));
assert(markets.some((market) => market.code === "PHILIPPINES-42"));
assert(markets.some((market) => market.id === "nigeria" && market.currency === "NGN"));
assert(markets.some((market) => market.id === "japan" && market.locale === "ja-JP"));
assert(marketRequirements.length >= 6);

const caribbean = store.create({ name: "Caribbean Regional", region: "caribbean", code: "CARIBBEAN-LAUNCH", currency: "USD", locale: "en" });
assert.strictEqual(caribbean.id, "caribbean-regional");
assert.strictEqual(store.get(caribbean.id).code, "CARIBBEAN-LAUNCH");

const ambassador = store.addAmbassador({ id: "ambassador-test", marketId: "nigeria", displayName: "Test Ambassador", referralCode: "NIGERIA-TEST" });
assert.strictEqual(ambassador.marketId, "nigeria");
assert.strictEqual(store.listAmbassadors().length, 1);

console.log("regional market tests passed");
