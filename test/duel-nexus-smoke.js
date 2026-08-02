'use strict';

const assert = require('assert');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config/duel-nexus.json', 'utf8'));
const runtime = fs.readFileSync('duel-nexus.js', 'utf8');
const moat = fs.readFileSync('competitive-moat.js', 'utf8');

assert.strictEqual(config.originalIpOnly, true, 'original IP boundary missing');
assert(config.deckRules.serverValidated, 'server deck validation missing');
assert(config.matchIntegrity.serverAuthoritative, 'server-authoritative match state missing');
assert(config.matchIntegrity.deterministicReplay, 'deterministic replay missing');
assert(config.matchIntegrity.turnNonceRequired, 'turn nonce protection missing');
assert(config.matchIntegrity.duplicateActionRejected, 'duplicate action protection missing');
assert(config.matchIntegrity.rankedRewardsNonWithdrawable, 'ranked cash protection missing');
assert(config.economy.payToWinProhibited, 'pay-to-win prohibition missing');
assert(config.accessibility.includes('one-hand') && config.accessibility.includes('screen-reader'), 'duel accessibility missing');
assert(runtime.includes('/api/duel/decks'), 'deck APIs missing');
assert(runtime.includes('/api/duel/matchmaking'), 'matchmaking API missing');
assert(runtime.includes('/api/duel/matches/:matchId/actions'), 'authoritative action API missing');
assert(runtime.includes('/api/duel/matches/:matchId/replay'), 'replay API missing');
assert(runtime.includes('Stale or invalid turn nonce'), 'stale turn rejection missing');
assert(runtime.includes('Duplicate or missing action ID'), 'duplicate action rejection missing');
assert(moat.includes("require('./duel-nexus')"), 'Duel Nexus not wired into platform');
assert(moat.includes('Duel Nexus Global Battle Pack'), 'Duel pack missing');

console.log('Duel Nexus global battle integrity smoke checks passed');
