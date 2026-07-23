const assert = require('assert');
const { createEsportsManager } = require('../lib/esports-manager');

const manager = createEsportsManager();
const tournament = manager.listTournaments('talon-lock')[0];
assert(tournament, 'default Talon Lock tournament should exist');

const playerId = 'player-test-1';
manager.register({ tournamentId: tournament.id, playerId, displayName: 'Tester' });
const checkin = manager.checkIn({ tournamentId: tournament.id, playerId });
assert(checkin.seed, 'check-in should assign a seed');

const submitted = manager.submitResult({ tournamentId: tournament.id, playerId, score: 1200, durationMs: 45000, vault: 3, runId: 'run-1' });
assert.equal(submitted.verificationStatus, 'provisional');

manager.verifyResult({ resultId: submitted.id, accepted: true });
const board = manager.leaderboard(tournament.id);
assert.equal(board.length, 1);
assert.equal(board[0].score, 1200);
assert.equal(board[0].rank, 1);

console.log('esports-manager smoke test passed');