const crypto = require('crypto');

function createEsportsManager({ io } = {}) {
  const tournaments = new Map();
  const registrations = new Map();
  const results = [];
  const ratings = new Map();
  const brackets = new Map();
  const teams = new Map();

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

  function ratingKey(gameId, playerId) { return `${gameId}:${playerId}`; }
  function getRating(gameId, playerId) {
    const key = ratingKey(gameId, playerId);
    if (!ratings.has(key)) ratings.set(key, { gameId, playerId, rating: 1000, tier: 'Bronze', wins: 0, losses: 0, updatedAt: new Date().toISOString() });
    return ratings.get(key);
  }
  function tierFor(rating) {
    if (rating >= 2200) return 'Talon Elite';
    if (rating >= 1900) return 'Master';
    if (rating >= 1650) return 'Diamond';
    if (rating >= 1450) return 'Platinum';
    if (rating >= 1250) return 'Gold';
    if (rating >= 1100) return 'Silver';
    return 'Bronze';
  }
  function applyMatchRating(gameId, winnerId, loserId) {
    const winner = getRating(gameId, winnerId);
    const loser = getRating(gameId, loserId);
    const expectedWinner = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
    const delta = Math.max(8, Math.round(32 * (1 - expectedWinner)));
    winner.rating += delta; loser.rating = Math.max(0, loser.rating - delta);
    winner.wins++; loser.losses++;
    winner.tier = tierFor(winner.rating); loser.tier = tierFor(loser.rating);
    winner.updatedAt = loser.updatedAt = new Date().toISOString();
    io?.emit('esports:rating', { winner, loser, delta });
    return { winner, loser, delta };
  }

  function register({ tournamentId, playerId, displayName = 'Player', teamId = null }) {
    if (!tournaments.has(tournamentId)) throw new Error('TOURNAMENT_NOT_FOUND');
    if (!playerId) throw new Error('PLAYER_ID_REQUIRED');
    const key = `${tournamentId}:${playerId}`;
    const entry = registrations.get(key) || {
      id: crypto.randomUUID(), tournamentId, playerId, displayName: String(displayName).slice(0, 40), teamId,
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

  function createTeam({ name, ownerPlayerId }) {
    if (!name || !ownerPlayerId) throw new Error('TEAM_NAME_AND_OWNER_REQUIRED');
    const team = { id: crypto.randomUUID(), name: String(name).slice(0, 50), ownerPlayerId, members: [ownerPlayerId], createdAt: new Date().toISOString() };
    teams.set(team.id, team); return team;
  }
  function joinTeam({ teamId, playerId }) {
    const team = teams.get(teamId); if (!team) throw new Error('TEAM_NOT_FOUND');
    if (!team.members.includes(playerId)) team.members.push(playerId); return team;
  }
  function listTeams() { return [...teams.values()]; }

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
    return rows.slice(0, Math.max(1, Math.min(500, Number(limit)||100))).map((r,i)=>({ rank:i+1, ...r, rating: getRating(tournaments.get(tournamentId)?.gameId || 'unknown', r.playerId) }));
  }

  function createBracket(tournamentId) {
    const tournament = tournaments.get(tournamentId); if (!tournament) throw new Error('TOURNAMENT_NOT_FOUND');
    const players = [...registrations.values()].filter(r => r.tournamentId === tournamentId && r.status === 'checked-in').map(r => r.playerId);
    if (players.length < 2) throw new Error('NOT_ENOUGH_CHECKED_IN_PLAYERS');
    const matches = [];
    for (let i = 0; i < players.length; i += 2) matches.push({ id: crypto.randomUUID(), round: 1, player1: players[i], player2: players[i+1] || null, winnerId: players[i+1] ? null : players[i], status: players[i+1] ? 'pending' : 'bye' });
    const bracket = { tournamentId, status: 'active', round: 1, matches, createdAt: new Date().toISOString() };
    brackets.set(tournamentId, bracket); io?.emit('esports:bracket', bracket); return bracket;
  }
  function reportMatch({ tournamentId, matchId, winnerId }) {
    const bracket = brackets.get(tournamentId); if (!bracket) throw new Error('BRACKET_NOT_FOUND');
    const match = bracket.matches.find(m => m.id === matchId); if (!match) throw new Error('MATCH_NOT_FOUND');
    if (![match.player1, match.player2].includes(winnerId)) throw new Error('INVALID_WINNER');
    match.winnerId = winnerId; match.status = 'complete'; match.completedAt = new Date().toISOString();
    const loserId = match.player1 === winnerId ? match.player2 : match.player1;
    const tournament = tournaments.get(tournamentId);
    const rating = loserId ? applyMatchRating(tournament.gameId, winnerId, loserId) : null;
    io?.emit('esports:match-complete', { tournamentId, match, rating }); return { match, rating };
  }
  function getBracket(tournamentId) { return brackets.get(tournamentId) || null; }

  function getSpectatorSnapshot(tournamentId) {
    return { tournament: tournaments.get(tournamentId) || null, bracket: getBracket(tournamentId), leaderboard: leaderboard(tournamentId, 25), liveResults: results.filter(r=>r.tournamentId===tournamentId).slice(-25) };
  }

  return { listTournaments, register, checkIn, submitResult, verifyResult, leaderboard, getSpectatorSnapshot, getRating, createBracket, reportMatch, getBracket, createTeam, joinTeam, listTeams };
}

module.exports = { createEsportsManager };