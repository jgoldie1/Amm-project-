'use strict';

const assert = require('assert');
const {
  world,
  STREETVIEW_POLICY,
  createChicagoRegistry,
  canPromote,
  buildNeighborhoodJob,
  compilePlayableSlice,
  compileChicago77,
  summarizeWorld
} = require('../lib/world-compiler');

const registry = createChicagoRegistry();
assert.strictEqual(world.chicago.officialCommunityAreaCount, 77, 'Chicago official community area count must remain 77');
assert.strictEqual(registry.length, 77, 'Chicago registry must account for all 77 community areas');
assert.strictEqual(new Set(registry.map(area => area.name)).size, 77, 'Chicago community area names must be unique');
assert.strictEqual(registry[0].name, 'Rogers Park');
assert.strictEqual(registry[76].name, 'Edgewater');
assert.strictEqual(registry.find(area => area.name === 'The Loop').status, 'CONSTRUCTING');
assert.strictEqual(canPromote('DATA_READY', 'CONSTRUCTING'), true);
assert.strictEqual(canPromote('DATA_READY', 'PLAYABLE'), false);

const englewood = registry.find(area => area.name === 'Englewood');
const job = buildNeighborhoodJob(englewood);
for (const stage of ['REFERENCE_SLIDES', 'HOLO_ASSET_GENERATOR', 'NEIGHBORHOOD_COMPILER', 'STREAMING_LOD', 'DAY_AFTER_DARK', 'ECONOMY_SUPPLY_CHAIN', 'CERTIFICATION']) {
  assert(job.pipeline.includes(stage), `${stage} missing from neighborhood generation pipeline`);
}
for (const layer of ['ROADS_SIDEWALKS_INTERSECTIONS','BUILDINGS_LANDMARKS','BUSINESSES_POI','CTA_TRANSIT_STOPS','NPC_POPULATION','TRAFFIC_PARKING','MISSIONS_EVENTS','CREATOR_REEL_LOCATIONS','JOBS_MARKETPLACE_DELIVERY']) {
  assert(job.generation.layers.includes(layer), `${layer} missing from playable slice compiler`);
}
for (const layer of ['ROADS','BUILDINGS','TRANSIT','BUSINESSES','NPC_POPULATION','TRAFFIC','MISSIONS','PROPERTIES','CREATOR_LOCATIONS','ECONOMY','STREAMING_LOD']) {
  assert(job.playableSlice.compile.layers.includes(layer), `${layer} missing from runtime Neighborhood Compiler`);
}
assert(job.modes.includes('AFTER_DARK'), 'Omniverse After Dark must be part of generated neighborhoods');
assert.strictEqual(job.geospatial.equalAreaWorldView, true, 'Equal-area world view must remain enabled');
assert.strictEqual(job.geospatial.cesiumCompatible, true, 'World jobs must remain Cesium-compatible');
assert.strictEqual(job.generation.humanCertificationRequired, true, 'Generated neighborhoods require human certification');
assert.strictEqual(STREETVIEW_POLICY.copyPixelsIntoGameAssets, false, 'Street View pixels must not be copied into permanent game assets');
assert.strictEqual(STREETVIEW_POLICY.scrapeOrBulkDownload, false, 'Street View scraping/bulk download must stay disabled');
assert.strictEqual(STREETVIEW_POLICY.attributionRequired, true, 'Street View attribution must stay required');
assert.strictEqual(job.playableSlice.reference.googleStreetView.machineInterpretation, false);
assert.strictEqual(job.playableSlice.reference.googleStreetView.deriveGeometry, false);
assert.strictEqual(job.playableSlice.compile.economy.authoritativeRewards, true);
assert.strictEqual(job.playableSlice.compile.economy.clientCashAwards, false);
assert.strictEqual(job.playableSlice.stream.strategy, 'ACTIVE_AREA_PLUS_NEIGHBORS');
assert(job.playableSlice.certification.required.includes('MOBILE_VIEWPORT_VALID'));
assert(job.playableSlice.certification.required.includes('REEL_HANDOFF_VALID'));

const slice = compilePlayableSlice(englewood, { boundary: { type: 'Polygon' } });
assert.strictEqual(slice.areaName, 'Englewood');
assert.strictEqual(slice.certification.status, 'BUILDING');
assert.strictEqual(slice.certification.requiresRenderedBrowserProof, true);
assert.strictEqual(slice.certification.requiresMobileProof, true);
assert(slice.runtimeLayers.some(layer => layer.name === 'CTA_TRANSIT_STOPS'));
assert(slice.runtimeLayers.every(layer => layer.status === 'BUILDING'));
assert.strictEqual(slice.compilerSlice.communityArea.name, 'Englewood');
assert(job.supplyChainNodes.includes('PORT') && job.supplyChainNodes.includes('CUSTOMER'), 'Supply chain graph incomplete');

const chicago77 = compileChicago77();
assert.strictEqual(chicago77.slices.length, 77, 'Neighborhood Compiler must produce one plan per Chicago community area');
assert.deepStrictEqual(chicago77.rollout.proofOrder, ['The Loop', 'Hyde Park', 'Austin', 'Rogers Park']);
assert.strictEqual(chicago77.rollout.allAreasMustPassSameCertification, true);

const summary = summarizeWorld(registry);
assert.strictEqual(summary.chicagoCommunityAreas, 77);
assert(summary.expansionOrder.includes('United States - all 50 states'));
assert(summary.expansionOrder.includes('Global'));
assert.strictEqual(summary.mapPolicy.africaRepresentation, 'true-relative-area');

console.log('TRYAMM world compiler, Chicago 77 runtime Neighborhood Compiler, Street View policy, mobile certification and economy checks passed');
