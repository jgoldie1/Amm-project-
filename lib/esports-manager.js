const crypto = require('crypto');

function createEsportsManager({ io } = {}) {
  const tournaments = new Map();
  const registrations = new Map();
  const results = [];

  function seedDefaultTournament() {
    if (tournaments.size) return;
    const id = 'talon-lock-open-1';
    tournaments.set(id, {
      id,
      gameId: 'talon-lock',
      name: 'Talon Lock Open',
      mode: 'vault-score-attack',
      status: 'registration',
      rulesVersion: '1.0.0',
      ranked: true,
      prizeMode: 'non-cash',
      createdAt: new Date().toISOString()
    });
  }
  seedDefaultTournament();

  function listTournaments(gameId) {
    return [...tournaments.values()].filter(t => !gameId || t.gameId === gameId);
  }

  function register({ tournamentId, playerId, displayName = 'Player' }) {
    if (!tournaments.has(tournamentId)) throw new Error('TOURNAMENT_NOT_FOUND');
    if (!playerId) throw new Error('PLAYER_ID_REQUIRED');
    const key = `${tournamentId}:${playerId}`;
    const entry = registrations.get(key) || {
      id: crypto.randomUUID(), tournamentId, playerId, displayName: String(displayName).slice(0, 40),
      status: 'registered', checkedInAt: null, createdAt: new Date().toISOString()
    };
    registrations.set(key, entry);
    return entry;
  }

  function checkIn({ tournamentId, playerId }) {
    const key = `${tournamentId}:${playerId}`;
    const entry = registrations.get(key);
    if (!entry) throw new Error('REGISTRATION_REQUIRED');
    entry.status = 'checked-in';
    entry.checkedInAt = new Date().toISOString();
    entry.seed = crypto.randomBytes(8).toString('hex');
    io?.emit('esports:checkin', { tournamentId, playerId });
    return { ...entry };
  }

  function submitResult({ tournamentId, playerId, score = 0, durationMs = 0, vault = 1, runId = null, evidence = {} }) {
    const tournament = tournaments.get(tournamentId);
    if (!tournament) throw new Error('TOURNAMENT_NOT_FOUND');
    const reg = registrations.get(`${tournamentId}:${playerId}`);
    if (!reg || reg.status !== 'checked-in') throw new Error('CHECKIN_REQUIRED');
    const safeScore = Number(score);
    const safeDuration = Number(durationMs);
    const suspicious = !Number.isFinite(safeScore) || safeScore < 0 || safeScore > 1000000 || !Number.isFinite(safeDuration) || safeDuration < 0;
    const record = {
      id: crypto.randomUUID(), tournamentId, playerId, score: suspicious ? 0 : Math.floor(safeScore),
      durationMs: suspicious ? 0 : Math.floor(safeDuration), vault: Math.max(1, Number(vault) || 1),
      runId: runId || crypto.randomUUID(), evidence, verificationStatus: suspicious ? 'rejected' : 'provisional',
      submittedAt: new Date().toISOString()
    };
    results.push(record);
    io?.emit('esports:result', record);
    return record;
  }

  function verifyResult({ resultId, accepted, reason = null }) {
    const result = results.find(r => r.id === resultId);
    if (!result) throw new Error('RESULT_NOT_FOUND');
    result.verificationStatus = accepted ? 'verified' : 'rejected';
    result.verificationReason = reason;
    result.verifiedAt = new Date().toISOString();
    io?.emit('esports:verified', result);
    return result;
  }

  function leaderboard(tournamentId, limit = 100) {
    const rows = results.filter(r => r.tournamentId === tournamentId && r.verificationStatus === 'verified');
    rows.sort((a,b) => b.score - a.score || a.durationMs - b.durationMs || a.submittedAt.localeCompare(b.submittedAt));
    return rows.slice(0, Math.max(1, Math.min(500, Number(limit)||100))).map((r,i)=>({ rank:i+1, ...r }));
  }

  function getSpectatorSnapshot(tournamentId) {
    return { tournament: tournaments.get(tournamentId) || null, leaderboard: leaderboard(tournamentId, 25), liveResults: results.filter(r=>r.tournamentId===tournamentId).slice(-25) };
  }

  return { listTournaments, register, checkIn, submitResult, verifyResult, leaderboard, getSpectatorSnapshot };
}

module.exports = { createEsportsManager };