const assert = require('assert');
const { createRenderPlan, createCalibration } = require('../lib/holo5dx-core');

const plan = createRenderPlan({ hardwareProfileId: 'QCONE-8V-PROTOTYPE', width: 2560, height: 1600, viewingConeDeg: 120 });
assert.equal(plan.cameras.length, 8);
assert.equal(plan.packing.length, 8);
assert.equal(plan.requiresPhysicalCalibration, true);
assert.equal(plan.fallback, 'STANDARD-3D');

const calibration = createCalibration({ hardwareProfileId: 'QCONE-8V-PROTOTYPE', coneHeightMm: 140, coneAngleDeg: 45, displayWidthMm: 300 });
assert.equal(calibration.physicallyValidated, false);
assert.ok(Array.isArray(calibration.measurementsRequired));

console.log('Holo5DX Core v0.2 smoke test passed');
