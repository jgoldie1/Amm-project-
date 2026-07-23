const crypto = require('crypto');
const { planOpticalOutput } = require('./holo5dx-optical-renderer');
const { calibrateQuantumCone } = require('./quantum-cone-calibration');

function createHolo5dxManager({ io } = {}) {
  const sessions = new Map();
  const calibrations = new Map();

  function capabilities({ profile='5dx-lite', device={} }={}) {
    return {
      profile,
      visual: device.xr ? 'xr-spatial' : device.holo ? 'holo-multiview' : 'standard-3d',
      spatialAudio: Boolean(device.spatialAudio),
      haptics: Boolean(device.gamepad || device.haptics),
      livingAI: true,
      connected: device.network !== false,
      fallbacks: { visual:'standard-3d', audio:'stereo', haptics:'none', controls:'keyboard-touch' }
    };
  }

  function startSession({ experienceId, gameId=null, device={}, profile='5dx-lite' }={}) {
    if(!experienceId) throw new Error('EXPERIENCE_ID_REQUIRED');
    const id=crypto.randomUUID();
    const session={id,experienceId,gameId,profile,capabilities:capabilities({profile,device}),state:'ready',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    sessions.set(id,session); io?.emit('holo5dx:session',session); return session;
  }

  function createCalibration(input={}) {
    const id=crypto.randomUUID();
    const plan=calibrateQuantumCone(input);
    const record={id,status:'draft-unvalidated',version:1,createdAt:new Date().toISOString(),...plan};
    calibrations.set(id,record); io?.emit('holo5dx:calibration',record); return record;
  }

  function createRenderPlan(input={}) { return planOpticalOutput({mode:input.mode||'standard-3d',calibration:input.calibration||{}}); }
  function getSession(id){return sessions.get(id)||null}
  function getCalibration(id){return calibrations.get(id)||null}
  function diagnostics({sessionId,fps=null,latencyMs=null,pingMs=null}={}) { const s=sessions.get(sessionId); if(!s) throw new Error('SESSION_NOT_FOUND'); return {sessionId,state:s.state,capabilities:s.capabilities,telemetry:{fps,latencyMs,pingMs},generatedAt:new Date().toISOString()}; }

  return {capabilities,startSession,getSession,createCalibration,getCalibration,createRenderPlan,diagnostics};
}
module.exports={createHolo5dxManager};
