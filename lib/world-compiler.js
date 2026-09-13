'use strict';

const world = require('../config/world-expansion.json');
const { buildNeighborhoodSlice, buildChicago77Compilation } = require('./neighborhood-compiler');

const STATUS_ORDER = new Map(world.statusModel.map((status, index) => [status, index]));

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
  const slice = buildNeighborhoodSlice(area, options);
  return {
    areaId: area.id,
    areaName: area.name,
    areaNumber: area.number,
    targetStatus: options.targetStatus || 'PLAYABLE',
    pipeline: [...world.generationPipeline],
    timeLayers: [...world.timeLayers],
    modes: ['DAY', 'AFTER_DARK'],
    geospatial: {
      globeScale: true,
      equalAreaWorldView: true,
      cesiumCompatible: true,
      externalImageryPolicy: world.mapPolicy.thirdPartyImagery,
      googleReferenceOnly: true,
      googleGeometryExtractionAllowed: false
    },
    generation: {
      holoAssets: true,
      proceduralNeighborhoods: true,
      streamingLod: true,
      aiAssistedValidation: true,
      humanCertificationRequired: true
    },
    economy: [...world.economyLayers],
    supplyChainNodes: [...world.supplyChain.nodes],
    playableSlice: slice
  };
}

function compileChicago77(options = {}) {
  return buildChicago77Compilation(createChicagoRegistry(), options);
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
  createChicagoRegistry,
  validateStatus,
  canPromote,
  buildNeighborhoodJob,
  compileChicago77,
  summarizeWorld
};
