'use strict';

const world = require('../config/world-expansion.json');

const STATUS_ORDER = new Map(world.statusModel.map((status, index) => [status, index]));
const STREETVIEW_POLICY = Object.freeze({
  provider: 'google-street-view',
  role: 'reference-and-runtime-supported-api-only',
  scrapeOrBulkDownload: false,
  copyPixelsIntoGameAssets: false,
  permanentTextureSource: false,
  attributionRequired: true,
  authorizedApiKeyRequired: true,
  derivedGameAssetsMustBeTryammCreatedOrLicensed: true
});

function createChicagoRegistry() {
  return world.chicago.communityAreas.map((name, index) => ({
    id: `CHI-${String(index + 1).padStart(2, '0')}`,
    number: index + 1,
    name,
    status: index === 31 ? 'CONSTRUCTING' : 'DATA_READY',
    dimensions: Object.fromEntries(world.chicago.certificationDimensions.map(dimension => [dimension, 'PLANNED']))
  }));
}

function validateStatus(status) {
  if (!STATUS_ORDER.has(status)) throw new Error(`Unknown world status: ${status}`);
  return status;
}

function canPromote(fromStatus, toStatus) {
  validateStatus(fromStatus);
  validateStatus(toStatus);
  return STATUS_ORDER.get(toStatus) === STATUS_ORDER.get(fromStatus) + 1;
}

function buildNeighborhoodJob(area, options = {}) {
  if (!area || !area.id || !area.name) throw new Error('Community area is required');
  return {
    schemaVersion: 2,
    compiler: 'TRYAMM_NEIGHBORHOOD_COMPILER',
    areaId: area.id,
    areaNumber: area.number || null,
    areaName: area.name,
    targetStatus: options.targetStatus || 'PLAYABLE',
    boundary: options.boundary || null,
    pipeline: [...world.generationPipeline],
    timeLayers: [...world.timeLayers],
    modes: ['DAY', 'AFTER_DARK'],
    geospatial: {
      globeScale: true,
      equalAreaWorldView: true,
      cesiumCompatible: true,
      externalImageryPolicy: world.mapPolicy.thirdPartyImagery,
      boundarySource: options.boundarySource || 'city-of-chicago-community-areas',
      streetNetwork: 'permitted-open-or-licensed-vector-data',
      buildingFootprints: 'permitted-open-or-licensed-building-data',
      terrain: 'permitted-open-or-licensed-terrain-data',
      google: {
        photorealistic3DTiles: 'optional-runtime-reference',
        streetView: { ...STREETVIEW_POLICY }
      }
    },
    generation: {
      holoAssets: true,
      proceduralNeighborhoods: true,
      streamingLod: true,
      aiAssistedValidation: true,
      humanCertificationRequired: true,
      layers: [
        'ROADS_SIDEWALKS_INTERSECTIONS',
        'BUILDINGS_LANDMARKS',
        'RESIDENTIAL_PROPERTIES',
        'BUSINESSES_POI',
        'CTA_TRANSIT_STOPS',
        'NPC_POPULATION',
        'TRAFFIC_PARKING',
        'TREES_PARKS_WATER',
        'MISSIONS_EVENTS',
        'CREATOR_REEL_LOCATIONS',
        'JOBS_MARKETPLACE_DELIVERY',
        'ACCESSIBILITY',
        'DAY_AFTER_DARK',
        'STREAMING_COLLISION_LOD'
      ]
    },
    streetViewReference: {
      purpose: [
        'HUMAN_SCALE_STREET_CONTEXT',
        'INTERSECTION_CURB_REFERENCE',
        'STOREFRONT_CONTEXT',
        'STREET_FURNITURE_TREE_CONTEXT',
        'LANDMARK_VALIDATION',
        'VISUAL_QA'
      ],
      policy: { ...STREETVIEW_POLICY }
    },
    gameplay: {
      playerSpawn: true,
      walking: true,
      driving: true,
      transitHandoff: true,
      missions: true,
      creatorCapture: true,
      businessDiscovery: true,
      propertyInteraction: true
    },
    economy: [...world.economyLayers],
    supplyChainNodes: [...world.supplyChain.nodes]
  };
}

function compilePlayableSlice(area, inputs = {}) {
  const job = buildNeighborhoodJob(area, inputs);
  return {
    id: `${area.id}:playable-slice:v1`,
    areaId: area.id,
    areaName: area.name,
    boundary: inputs.boundary || null,
    sourceManifest: {
      boundary: inputs.boundarySource || 'city-of-chicago-community-areas',
      roads: inputs.roadsSource || 'OPEN_OR_LICENSED_VECTOR_REQUIRED',
      buildings: inputs.buildingsSource || 'OPEN_OR_LICENSED_BUILDING_DATA_REQUIRED',
      businesses: inputs.businessSource || 'AUTHORIZED_BUSINESS_DATA_REQUIRED',
      transit: inputs.transitSource || 'AUTHORIZED_TRANSIT_DATA_REQUIRED',
      streetView: STREETVIEW_POLICY
    },
    runtimeLayers: job.generation.layers.map(name => ({ name, status: 'BUILDING' })),
    gameplay: { ...job.gameplay },
    certification: {
      status: 'BUILDING',
      requiresRenderedBrowserProof: true,
      requiresMobileProof: true,
      requiresHumanCertification: true
    }
  };
}

function summarizeWorld(registry = createChicagoRegistry()) {
  const counts = Object.fromEntries(world.statusModel.map(status => [status, 0]));
  for (const area of registry) {
    validateStatus(area.status);
    counts[area.status] += 1;
  }
  return {
    worldName: world.worldName,
    chicagoCommunityAreas: registry.length,
    counts,
    expansionOrder: [...world.expansionOrder],
    mapPolicy: { ...world.mapPolicy }
  };
}

module.exports = {
  world,
  STREETVIEW_POLICY,
  createChicagoRegistry,
  validateStatus,
  canPromote,
  buildNeighborhoodJob,
  compilePlayableSlice,
  summarizeWorld
};
