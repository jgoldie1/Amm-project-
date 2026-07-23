const assert = require('assert');
const { createHolo5dxManager } = require('../lib/holo5dx-manager');

const manager = createHolo5dxManager();
const caps = manager.capabilities({ profile: '5dx-holo', device: { holo: true, spatialAudio: true, gamepad: true, network: true } });
assert.equal(caps.visual, 'holo-multiview');
assert.equal(caps.spatialAudio, true);
assert.equal(caps.haptics, true);

const session = manager.startSession({ experienceId: 'talon-lock', gameId: 'talon-lock', profile: '5dx-holo', device: { holo: true } });
assert.ok(session.id);
assert.equal(manager.getSession(session.id).experienceId, 'talon-lock');

const calibration = manager.createCalibration({ displayWidthMm: 280, displayHeightMm: 175, coneHeightMm: 140, coneAngleDeg: 45, viewerDistanceMm: 550, viewCount: 8, viewingConeDeg: 120, resolutionPx: { width: 2560, height: 1600 } });
assert.equal(calibration.cameraRig.length, 8);
assert.equal(calibration.packing.length, 8);

const renderPlan = manager.createRenderPlan({ mode: 'cone-reflector-8view', calibration: { viewCount: 8, viewConeDegrees: 120, viewerDistanceMm: 550, reflectorCount: 4 } });
assert.equal(renderPlan.views.length, 8);
assert.equal(renderPlan.trueHolographicHardwareRequired, true);

console.log('Holo5DX manager smoke test passed');