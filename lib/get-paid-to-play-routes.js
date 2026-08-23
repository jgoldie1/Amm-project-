'use strict';

const crypto = require('crypto');
const supabase = require('./supabase-rest');

const REAL_PAYOUTS_ENABLED = String(process.env.ENABLE_REAL_GAME_PAYOUTS || '').toLowerCase() === 'true';
const MAX_DAILY_CASH_CENTS = Math.max(0, Number(process.env.GAME_REWARD_DAILY_CASH_CAP_CENTS || 2500));

const PROGRAMS = Object.freeze({
  streetverse_first_drop: {
    id: 'streetverse_first_drop',
    type: 'mission',
    title: 'StreetVerse: First Drop',
    game: 'streetverse',
    evidence: 'streetverse_mission_run',
    missionId: 'm1',
    reward: { xp: 200, holoCredits: 500, cashCents: 0 },
    funded: true,
    cashEligible: false,
    repeatable: false,
    skillBased: true,
    chanceBased: false
  },
  sponsored_mission_pool: {
    id: 'sponsored_mission_pool',
    type: 'sponsored_mission',
    title: 'Sponsored Mission Pool',
    evidence: 'sponsor_verified_event',
    reward: { xp: 250, holoCredits: 750, cashCents: 500 },
    funded: false,
    cashEligible: true,
    repeatable: true,
    skillBased: true,
    chanceBased: false
  },
  verified_skill_tournament: {
    id: 'verified_skill_tournament',
    type: 'skill_tournament',
    title: 'Verified Skill Tournament',
    evidence: 'server_tournament_result',
    reward: { xp: 1000, holoCredits: 2500, cashCents: 2500 },
    funded: false,
    cashEligible: true,
    repeatable: true,
    skillBased: true,
    chanceBased: false,
    allowedGames: ['bowling','pool','basketball','racing','fighting','football']
  },
  creator_challenge_pool: {
    id: 'creator_challenge_pool',
    type: 'creator_challenge',
    title: 'Creator Challenge Pool',
    evidence: 'server_creator_challenge_result',
    reward: { xp: 500, holoCredits: 1500, cashCents: 1000 },
    funded: false,
    cashEligible: true,
    repeatable: true,
    skillBased: true,
    chanceBased: false
  },
  advertising_reward_pool: {
    id: 'advertising_reward_pool',
    type: 'advertising_reward',
    title: 'Advertising Reward Pool',
    evidence: 'server_ad_event',
    reward: { xp: 100, holoCredits: 250, cashCents: 250 },
    funded: false,
    cashEligible: true,
    repeatable: true,
    skillBased: false,
    chanceBased: false
  },
  promotional_prize_pool: {
    id: 'promotional_prize_pool',
    type: 'promotional_prize',
    title: 'Promotional Prize Pool',
    evidence: 'server_promotion_result',
    reward: { xp: 750, holoCredits: 2000, cashCents: 1500 },
    funded: false,
    cashEligible: true,
    repeatable: false,
    skillBased: true,
    chanceBased: false
  }
});

function bearer(req) {
  const value = String(req.headers.authorization || '');
  return value.startsWith('Bearer ') ? value.slice(7) : '';
}

function clean(value, max = 160) {
  return String(value || '').trim().slice(0, max);
}

function nowIso() { return new Date().toISOString(); }

module.exports = function registerGetPaidToPlayRoutes({ app, getStore, saveStore }) {
  async function rewardAuth(req, res, next) {
    const token = bearer(req);
    if (!token) return res.status(401).json({ error: 'Sign in required' });

    const store = getStore();
    const session = store.sessions?.find(item => item.token === token && Number(item.expiresAt) > Date.now());
    if (session) {
      const rootUser = store.users?.find(item => item.id === session.userId);
      if (rootUser) { req.user = rootUser; return next(); }
    }

    if (!supabase.configured()) return res.status(401).json({ error: 'Session is not valid' });
    try {
      const authUser = await supabase.auth.getUser(token);
      if (!authUser?.id) return res.status(401).json({ error: 'Session is not valid' });
      req.user = { id: authUser.id, supabaseUserId: authUser.id, email: authUser.email || '', role: 'member' };
      return next();
    } catch (error) {
      if (error.status === 401 || error.status === 403) return res.status(401).json({ error: 'Session is not valid' });
      next(error);
    }
  }

  async function resolveUserId(user) {
    if (user.supabaseUserId) return user.supabaseUserId;
    if (String(user.id || '').match(/^[0-9a-f-]{36}$/i)) return user.id;
    const store = getStore();
    const rootUser = store.users?.find(item => item.id === user.id);
    if (rootUser?.supabaseUserId) return rootUser.supabaseUserId;
    const error = new Error('Durable player identity is required before rewards can be claimed');
    error.status = 409;
    error.code = 'DURABLE_IDENTITY_REQUIRED';
    throw error;
  }

  async function verifyEvidence(program, userId, body) {
    if (program.evidence === 'streetverse_mission_run') {
      const runId = clean(body?.evidence?.missionRunId, 80);
      if (!runId) return { ok: false, reason: 'MISSION_RUN_REQUIRED' };
      const rows = await supabase.select('streetverse_mission_runs', `id=eq.${encodeURIComponent(runId)}&user_id=eq.${encodeURIComponent(userId)}&select=*`);
      const run = Array.isArray(rows) ? rows[0] : null;
      if (!run) return { ok: false, reason: 'MISSION_RUN_NOT_FOUND' };
      if (run.mission_id !== program.missionId || run.status !== 'completed') return { ok: false, reason: 'MISSION_NOT_COMPLETED' };
      const runtime = run.runtime_state || {};
      const visited = Array.isArray(runtime.visited) ? runtime.visited : [];
      if (visited.length < 3 || Number(runtime.progress || 0) < 100) return { ok: false, reason: 'MISSION_PROOF_INCOMPLETE' };
      return { ok: true, evidenceRef: run.id, evidenceType: 'streetverse_mission_run' };
    }

    // These program types require a server-created evidence record from the tournament,
    // sponsor, creator challenge, advertising, or promotion engine. Browser assertions
    // are intentionally never accepted as proof.
    return { ok: false, reason: 'SERVER_EVIDENCE_NOT_AVAILABLE' };
  }

  function ensureRewardCollections(store) {
    store.gameRewardClaims = Array.isArray(store.gameRewardClaims) ? store.gameRewardClaims : [];
    store.gameRewardLedger = Array.isArray(store.gameRewardLedger) ? store.gameRewardLedger : [];
  }

  function cashEarnedToday(store, userId) {
    const day = new Date().toISOString().slice(0, 10);
    return store.gameRewardLedger
      .filter(row => row.userId === userId && row.kind === 'cash_earning' && String(row.createdAt).slice(0, 10) === day)
      .reduce((sum, row) => sum + Math.max(0, Number(row.amountCents || 0)), 0);
  }

  async function applyGameStateReward(userId, reward, reference) {
    const rows = await supabase.select('player_state', `user_id=eq.${encodeURIComponent(userId)}&select=*`);
    const state = Array.isArray(rows) ? rows[0] : null;
    if (!state) throw Object.assign(new Error('Player state not found'), { status: 404 });
    const nextXp = Number(state.xp || 0) + Math.max(0, Number(reward.xp || 0));
    const nextTokens = Number(state.tokens || 0) + Math.max(0, Number(reward.holoCredits || 0));
    const nextLevel = Math.floor(nextXp / 1000) + 1;
    const inventory = Array.isArray(state.inventory) ? state.inventory : [];
    const receipt = { type: 'reward_receipt', reference, xp: reward.xp || 0, holo_credits: reward.holoCredits || 0, created_at: nowIso() };
    const updated = await supabase.update('player_state', `user_id=eq.${encodeURIComponent(userId)}`, {
      xp: nextXp,
      tokens: nextTokens,
      level: nextLevel,
      inventory: [...inventory, receipt].slice(-250),
      revision: Number(state.revision || 0) + 1,
      updated_at: nowIso()
    });
    return Array.isArray(updated) ? updated[0] : updated;
  }

  app.get('/api/get-paid-to-play/status', rewardAuth, (_req, res) => {
    res.json({
      ok: true,
      mode: REAL_PAYOUTS_ENABLED ? 'cash-gated' : 'holo-credits-only',
      realPayoutsEnabled: REAL_PAYOUTS_ENABLED,
      dailyCashCapCents: MAX_DAILY_CASH_CENTS,
      browserControlsRewardAmount: false,
      chanceGamesCashEligible: false,
      payoutStatus: 'ledger-gated'
    });
  });

  app.get('/api/get-paid-to-play/programs', rewardAuth, (_req, res) => {
    const programs = Object.values(PROGRAMS).map(program => ({
      ...program,
      reward: { ...program.reward, cashCents: program.cashEligible && REAL_PAYOUTS_ENABLED && program.funded ? program.reward.cashCents : 0 },
      cashStatus: !program.cashEligible ? 'not-eligible' : !program.funded ? 'unfunded' : !REAL_PAYOUTS_ENABLED ? 'disabled' : 'eligible'
    }));
    res.json({ programs });
  });

  app.post('/api/get-paid-to-play/claim', rewardAuth, async (req, res, next) => {
    try {
      if (!supabase.configured()) return res.status(503).json({ error: 'Durable reward state is not configured' });
      const programId = clean(req.body?.programId, 100);
      const program = PROGRAMS[programId];
      if (!program) return res.status(404).json({ error: 'Reward program not found' });
      if (program.chanceBased) return res.status(422).json({ error: 'Chance-based games cannot produce cash rewards' });
      const requestedGame = clean(req.body?.game, 80).toLowerCase();
      if (requestedGame === 'poker' || requestedGame === 'crown-poker-night') {
        return res.status(422).json({ error: 'Poker is excluded from Get Paid to Play cash rewards' });
      }
      if (program.allowedGames && requestedGame && !program.allowedGames.includes(requestedGame)) {
        return res.status(422).json({ error: 'Game is not eligible for this reward program' });
      }

      const userId = await resolveUserId(req.user);
      const proof = await verifyEvidence(program, userId, req.body || {});
      if (!proof.ok) return res.status(422).json({ error: 'Reward evidence was not accepted', code: proof.reason });

      const store = getStore();
      ensureRewardCollections(store);
      const idempotencyKey = `${program.id}:${userId}:${proof.evidenceType}:${proof.evidenceRef}`;
      const existing = store.gameRewardClaims.find(row => row.idempotencyKey === idempotencyKey);
      if (existing) return res.json({ ok: true, applied: false, reason: 'ALREADY_CLAIMED', claim: existing });

      const claimId = `gptp_${crypto.randomUUID()}`;
      const gameReward = { xp: program.reward.xp, holoCredits: program.reward.holoCredits };
      const playerState = await applyGameStateReward(userId, gameReward, claimId);

      let cashCents = 0;
      let cashStatus = 'not-applicable';
      if (program.cashEligible) {
        if (!program.funded) cashStatus = 'unfunded';
        else if (!REAL_PAYOUTS_ENABLED) cashStatus = 'disabled';
        else {
          const remaining = Math.max(0, MAX_DAILY_CASH_CENTS - cashEarnedToday(store, userId));
          cashCents = Math.min(Math.max(0, Number(program.reward.cashCents || 0)), remaining);
          cashStatus = cashCents > 0 ? 'pending-payout-eligibility' : 'daily-cap-reached';
        }
      }

      const claim = {
        id: claimId,
        idempotencyKey,
        programId: program.id,
        programType: program.type,
        userId,
        evidenceType: proof.evidenceType,
        evidenceRef: proof.evidenceRef,
        xp: gameReward.xp,
        holoCredits: gameReward.holoCredits,
        cashCents,
        cashStatus,
        status: 'verified',
        serverDetermined: true,
        createdAt: nowIso()
      };
      store.gameRewardClaims.push(claim);
      store.gameRewardLedger.push({ id: `reward_${claimId}`, userId, kind: 'game_reward', amount: gameReward.holoCredits, currency: 'HOLO', reference: claimId, createdAt: claim.createdAt });
      if (cashCents > 0) {
        store.gameRewardLedger.push({ id: `cash_${claimId}`, userId, kind: 'cash_earning', amountCents: cashCents, currency: 'usd', reference: claimId, status: 'pending-payout-eligibility', createdAt: claim.createdAt });
      }
      await saveStore();
      res.status(201).json({ ok: true, applied: true, claim, playerState, notice: cashCents > 0 ? 'Cash earning is pending payout eligibility and is not yet withdrawable.' : 'Gameplay reward issued as XP/Holo Credits only.' });
    } catch (error) { next(error); }
  });

  app.get('/api/get-paid-to-play/history', rewardAuth, async (req, res, next) => {
    try {
      const userId = await resolveUserId(req.user);
      const store = getStore();
      ensureRewardCollections(store);
      const claims = store.gameRewardClaims.filter(row => row.userId === userId).slice(-100).reverse();
      res.json({ claims });
    } catch (error) { next(error); }
  });
};

module.exports.PROGRAMS = PROGRAMS;
