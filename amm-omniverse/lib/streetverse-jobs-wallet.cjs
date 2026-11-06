'use strict';
const VENUES = Object.freeze({
  'kevon-capital-nights': { owner: 'Kevon', jobs: { bartender: 120, dj: 180, security: 140 } },
  'lateasia-monroe-after-dark': { owner: 'LaTeasia', jobs: { bartender: 120, promoter: 130, stylist: 150 } },
  'nikki-frances-skyline': { owner: 'Nikki', jobs: { bartender: 120, dj: 180, dispatcher: 160 } }
});
function createEngine() {
  const players = new Map(), jobs = new Map(), completed = new Map(), ledger = [];
  const ensure = id => { if (typeof id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) throw Error('INVALID_PLAYER'); if (!players.has(id)) players.set(id, 0); return id; };
  return Object.freeze({
    venues: () => JSON.parse(JSON.stringify(VENUES)),
    balance: playerId => players.get(ensure(playerId)),
    acceptJob({ playerId, venueId, role, jobId }) {
      ensure(playerId);
      if (!VENUES[venueId]?.jobs[role]) throw Error('INVALID_JOB');
      if (typeof jobId !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(jobId)) throw Error('INVALID_JOB_ID');
      if (jobs.has(jobId)) throw Error('DUPLICATE_JOB_ID');
      const job = { id: jobId, playerId, venueId, role, reward: VENUES[venueId].jobs[role], status: 'accepted' };
      jobs.set(jobId, job); return { ...job };
    },
    // Internal prototype only. Never expose verifiedByServer as a client-supplied HTTP field.
    completeJob({ jobId, playerId, verifiedByServer }) {
      ensure(playerId);
      const job = jobs.get(jobId);
      if (!job) throw Error('JOB_NOT_FOUND');
      if (job.playerId !== playerId) throw Error('NOT_JOB_OWNER');
      if (verifiedByServer !== true) throw Error('SERVER_VERIFICATION_REQUIRED');
      if (completed.has(jobId)) return { ...completed.get(jobId), duplicate: true };
      const next = players.get(playerId) + job.reward;
      if (!Number.isSafeInteger(next)) throw Error('BALANCE_OVERFLOW');
      players.set(playerId, next); job.status = 'completed';
      const record = { jobId, playerId, amount: job.reward, balance: next, currency: 'STREETVERSE_GAME_CREDITS' };
      ledger.push(Object.freeze(record)); completed.set(jobId, record);
      return { ...record, duplicate: false };
    },
    history: playerId => ledger.filter(row => row.playerId === ensure(playerId)).map(row => ({ ...row })),
    snapshot: () => ({ balances: Object.fromEntries(players), jobs: [...jobs.values()].map(j => ({ ...j })), ledger: ledger.map(e => ({ ...e })) })
  });
}
module.exports = { createEngine, VENUES };
