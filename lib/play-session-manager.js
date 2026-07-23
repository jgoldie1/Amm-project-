const crypto = require('crypto');

function createPlaySessionManager({ gameverse, io }) {
  const sessions = new Map();

  function publicSession(session) {
    return {
      id: session.id,
      gameId: session.gameId,
      state: session.state,
      controllerMode: session.controllerMode,
      displayMode: session.displayMode,
      castTarget: session.castTarget,
      pairingCode: session.pairingCode,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      aiPreflight: session.aiPreflight,
    };
  }

  function create({ gameId, controllerMode = 'touch', displayMode = 'local' }) {
    const game = gameverse.games.find((item) => item.id === gameId);
    if (!game) throw new Error('UNKNOWN_GAME');

    const session = {
      id: crypto.randomUUID(),
      gameId,
      state: 'created',
      controllerMode,
      displayMode,
      castTarget: null,
      pairingCode: String(Math.floor(100000 + Math.random() * 900000)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiPreflight: {
        status: 'not-run',
        checks: [],
        recommendations: [],
      },
    };
    sessions.set(session.id, session);
    io.emit('livingworld:session', publicSession(session));
    return publicSession(session);
  }

  function get(id) {
    const session = sessions.get(id);
    return session ? publicSession(session) : null;
  }

  function update(id, patch) {
    const session = sessions.get(id);
    if (!session) return null;
    Object.assign(session, patch, { updatedAt: new Date().toISOString() });
    io.emit('livingworld:session', publicSession(session));
    return publicSession(session);
  }

  function preflight(id, runtimeAvailable = false) {
    const session = sessions.get(id);
    if (!session) return null;
    const checks = [
      { name: 'game-registry-entry', ok: true },
      { name: 'runtime-available', ok: Boolean(runtimeAvailable) },
      { name: 'controller-profile', ok: true },
      { name: 'telemetry', ok: true },
    ];
    const recommendations = runtimeAvailable
      ? ['Session foundation ready for runtime handoff.']
      : ['Attach the actual game runtime/build before marking this game playable.'];
    session.aiPreflight = {
      status: checks.every((check) => check.ok) ? 'ready' : 'needs-preparation',
      checks,
      recommendations,
      at: new Date().toISOString(),
    };
    session.updatedAt = new Date().toISOString();
    io.emit('livingworld:preflight', publicSession(session));
    return publicSession(session);
  }

  return { create, get, update, preflight };
}

module.exports = { createPlaySessionManager };
