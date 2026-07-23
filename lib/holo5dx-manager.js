const crypto = require('crypto');
const opticalProfile = require('../data/holo5dx-quantum-cone-lens.json');
const { createOpticalRenderPlan } = require('./holo5dx-optical-renderer');
const { createConeCalibrationPlan } = require('./quantum-cone-calibration');

function createHolo5dxManager({ io } = {}) {
  const sessions = new Map();

  function capabilities(input = {}) {
    const profile = input.profile || '5dx-lite';
    const device = input.device || {};
    return {
      profile,
      visual: device.xr ? 'xr-spatial' : device.holo ? 'holo-multiview' : 'standard-3d',
      spatialAudio: Boolean(device.spatialAudio),
      haptics: Boolean(device.gamepad || device.haptics),
      livingAI: true,
      connected: Boolean(device.network !== false),
      fallbacks: {
        visual: 'standard-3d',
        audio: 'stereo',
        haptics: 'none',
        controls: 'keyboard-touch'
      }
    };
  }

  function startSession({ experienceId, gameId = null, device = {}, profile = '5dx-lite' } = {}) {
    if (!experienceId) throw new Error('EXPERIENCE_ID_REQUIRED');
    const id = crypto.randomUUID();
    const caps = capabilities({ profile, device });
    const session = { id, experienceId, gameId, profile, capabilities: caps, state: 'ready', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    sessions.set(id, session);
    io?.emit('holo5dx:session', session);
    return session;
  }

  function getSession(id) { return sessions.get(id) || null; }

  function createCalibration(input = {}) {
    return createConeCalibrationPlan(input);
  }

  function createRenderPlan(input = {}) {
    const mode = input.mode || 'standard-3d';
    return createOpticalRenderPlan({ ...input, mode, profile: opticalProfile });
  }

  function diagnostics({ sessionId, fps = null, latencyMs = null, pingMs = null } = {}) {
    const session = sessions.get(sessionId);
    if (!session) throw new Error('SESSION_NOT_FOUND');
    return {
      sessionId,
      state: session.state,
      capabilities: session.capabilities,
      telemetry: { fps, latencyMs, pingMs },
      generatedAt: new Date().toISOString()
    };
  }

  return { capabilities, startSession, getSession, createCalibration, createRenderPlan, diagnostics };
}

module.exports = { createHolo5dxManager };