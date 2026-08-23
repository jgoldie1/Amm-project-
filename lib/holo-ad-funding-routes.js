'use strict';

const AD_PRODUCTS = Object.freeze({
  holo_banner: { id:'holo_banner', name:'Holo Banner', priceCents:25000, placement:'feed / marketplace / creator surface' },
  holo_popup: { id:'holo_popup', name:'Holo Spatial Pop-Up', priceCents:50000, placement:'interactive world / LIVE surface' },
  holo_interactive: { id:'holo_interactive', name:'Interactive Holo Experience', priceCents:100000, placement:'clickable / playable branded experience' },
  world_takeover: { id:'world_takeover', name:'World Takeover', priceCents:250000, placement:'featured world sponsorship window' },
  sponsored_mission: { id:'sponsored_mission', name:'Sponsored Mission', priceCents:500000, placement:'server-verified branded mission' },
  tournament_sponsor: { id:'tournament_sponsor', name:'Skill Tournament Sponsor', priceCents:1000000, placement:'eligible skill tournament sponsorship' }
});

const REWARD_RESERVE_BPS = Math.max(0, Math.min(5000, Number(process.env.HOLO_AD_REWARD_RESERVE_BPS || 2500)));
const OPERATIONS_BPS = Math.max(0, Math.min(10000, Number(process.env.HOLO_AD_OPERATIONS_BPS || 5000)));
const GROWTH_BPS = Math.max(0, Math.min(10000, Number(process.env.HOLO_AD_GROWTH_BPS || 1500)));
const CONTINGENCY_BPS = Math.max(0, Math.min(10000, Number(process.env.HOLO_AD_CONTINGENCY_BPS || 1000)));

function splitNetRevenue(netCents) {
  const net = Math.max(0, Math.round(Number(netCents || 0)));
  const rewardReserveCents = Math.floor(net * REWARD_RESERVE_BPS / 10000);
  const operationsCents = Math.floor(net * OPERATIONS_BPS / 10000);
  const growthCents = Math.floor(net * GROWTH_BPS / 10000);
  const contingencyCents = Math.max(0, net - rewardReserveCents - operationsCents - growthCents);
  return { netCents:net, rewardReserveCents, operationsCents, growthCents, contingencyCents };
}

function quote(productId, providerFeesCents = 0, taxesCents = 0) {
  const product = AD_PRODUCTS[String(productId || '')];
  if (!product) return null;
  const grossCents = product.priceCents;
  const externalCostsCents = Math.max(0, Math.round(Number(providerFeesCents || 0))) + Math.max(0, Math.round(Number(taxesCents || 0)));
  const netCents = Math.max(0, grossCents - externalCostsCents);
  return { product, grossCents, externalCostsCents, ...splitNetRevenue(netCents) };
}

module.exports = function registerHoloAdFundingRoutes({ app, auth }) {
  app.get('/api/holo-ads/catalog', (_req, res) => res.json({
    products:Object.values(AD_PRODUCTS),
    allocation:{ rewardReserveBps:REWARD_RESERVE_BPS, operationsBps:OPERATIONS_BPS, growthBps:GROWTH_BPS, contingencyBps:CONTINGENCY_BPS },
    rule:'Reward reserve is allocated from verified net advertising revenue after provider fees/taxes. User Holo Credit balances are not treated as payout cash.',
    tournamentRule:'Cash skill-tournament prizes require separately funded eligible programs; chance-based games such as poker are excluded.'
  }));

  app.post('/api/holo-ads/quote', auth, (req, res) => {
    const result = quote(req.body?.productId);
    if (!result) return res.status(404).json({ error:'Holo advertising product not found' });
    res.json({ ok:true, ...result, checkoutStatus:'quote-only', notice:'Final reserve allocation uses verified settlement net after payment-provider fees, taxes, refunds and disputes.' });
  });
};

module.exports.AD_PRODUCTS = AD_PRODUCTS;
module.exports.splitNetRevenue = splitNetRevenue;
module.exports.quote = quote;
