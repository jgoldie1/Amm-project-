const crypto = require('crypto');
const hardwareRegistry = require('../data/holo5dx-hardware-profiles.json');

function clamp(v, min, max) { return Math.max(min, Math.min(max, Number(v))); }

function getHardwareProfile(id) {
  return hardwareRegistry.profiles.find((p) => p.id === id) || hardwareRegistry.profiles[0];
}

function buildCameraRig({ viewCount = 1, viewingConeDeg = 30, viewerDistanceMm = 600 } = {}) {
  const count = Math.max(1, Math.min(32, Math.floor(Number(viewCount) || 1)));
  const cone = clamp(viewingConeDeg || 30, 1, 180);
  const distance = Math.max(100, Number(viewerDistanceMm) || 600);
  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const yawDegrees = -cone / 2 + cone * t;
    return { index: i, yawDegrees, viewerDistanceMm: distance };
  });
}

function buildPackingPlan({ viewCount = 1, width = 1920, height = 1080 } = {}) {
  const n = Math.max(1, Math.floor(Number(viewCount) || 1));
  const cols = Math.ceil(Math.sqrt(n));
  const rows = Math.ceil(n / cols);
  const cellW = Math.floor(width / cols);
  const cellH = Math.floor(height / rows);
  return Array.from({ length: n }, (_, i) => ({
    view: i,
    x: (i % cols) * cellW,
    y: Math.floor(i / cols) * cellH,
    width: cellW,
    height: cellH
  }));
}

function createRenderPlan(input = {}) {
  const hardware = getHardwareProfile(input.hardwareProfileId || 'STANDARD-3D');
  const viewCount = Number(input.viewCount) || hardware.viewCount || 1;
  const width = Math.max(1, Number(input.width) || 1920);
  const height = Math.max(1, Number(input.height) || 1080);
  return {
    id: crypto.randomUUID(),
    mode: hardware.type,
    hardwareProfileId: hardware.id,
    requiresPhysicalCalibration: Boolean(hardware.requiresPhysicalCalibration),
    certified: Boolean(hardware.certified),
    cameras: buildCameraRig({ viewCount, viewingConeDeg: input.viewingConeDeg || 60, viewerDistanceMm: input.viewerDistanceMm || 600 }),
    packing: buildPackingPlan({ viewCount, width, height }),
    compositor: {
      requiredStages: ['render-views', 'apply-per-view-warp', 'brightness-gamma-compensation', 'pack-output'],
      gpuImplementationStatus: 'contract-defined-not-production-renderer'
    },
    fallback: 'STANDARD-3D'
  };
}

function createCalibration(input = {}) {
  const coneHeightMm = Math.max(1, Number(input.coneHeightMm) || 120);
  const coneAngleDeg = clamp(input.coneAngleDeg || 45, 10, 80);
  const displayWidthMm = Math.max(1, Number(input.displayWidthMm) || 300);
  const footprintRadiusMm = coneHeightMm * Math.tan((coneAngleDeg * Math.PI) / 180);
  return {
    id: crypto.randomUUID(),
    hardwareProfileId: input.hardwareProfileId || 'QCONE-4V-PROTOTYPE',
    geometry: { coneHeightMm, coneAngleDeg, displayWidthMm, footprintRadiusMm },
    measurementsRequired: ['crosstalk', 'brightness', 'optical-center-error', 'viewing-angle', 'distortion', 'latency'],
    warpMatrices: null,
    physicallyValidated: false,
    warnings: footprintRadiusMm * 2 > displayWidthMm ? ['Cone footprint exceeds display width.'] : []
  };
}

module.exports = { getHardwareProfile, buildCameraRig, buildPackingPlan, createRenderPlan, createCalibration };
