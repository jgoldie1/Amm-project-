'use strict';

const crypto = require('crypto');
const supabase = require('./supabase-rest');

const VEHICLES = new Set(['rail','car','motorcycle','boat','jetski','trainer','airplane','jet','horse','spacecraft']);
const EVENT_TYPES = new Set(['qualifier_start','checkpoint','finish','boss_step','mobility_arrival']);
const MIN_FINISH_MS = { car:8000, motorcycle:7500, boat:9000, jetski:8000, trainer:12000, airplane:14000, jet:10000, horse:12000, spacecraft:10000 };

function cleanText(value, max = 120) {
  return String(value ?? '').trim().slice(0, max);
}

function playerCode(userId) {
  return `P-${crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0, 8).toUpperCase()}`;
}

module.exports = function registerStreetVerseCompetitionRoutes({ app, auth }) {
  app.post('/api/streetverse/competition/event', auth, async (req, res) => {
    try {
      if (!supabase.configured()) return res.status(503).json({ error: 'Durable competition storage unavailable' });
      const userId = req.user?.id;
      const eventType = cleanText(req.body?.eventType, 40);
      const vehicleType = cleanText(req.body?.vehicleType, 40);
      const raceId = cleanText(req.body?.raceId, 120) || null;
      const idempotencyKey = cleanText(req.body?.idempotencyKey, 180);
      const cityId = cleanText(req.body?.cityId, 80) || 'chicago';
      const districtId = cleanText(req.body?.districtId, 120) || null;
      const elapsedMs = req.body?.elapsedMs == null ? null : Math.max(0, Math.floor(Number(req.body.elapsedMs) || 0));
      const checkpointCount = Math.max(0, Math.min(100, Math.floor(Number(req.body?.checkpointCount) || 0)));
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      if (!idempotencyKey) return res.status(400).json({ error: 'idempotencyKey required' });
      if (!EVENT_TYPES.has(eventType)) return res.status(400).json({ error: 'Unsupported competition event' });
      if (!VEHICLES.has(vehicleType)) return res.status(400).json({ error: 'Unsupported vehicle type' });

      const existing = await supabase.select('streetverse_competition_events', `select=*&idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&limit=1`);
      if (existing?.[0]) return res.json({ event: existing[0], idempotent: true });

      let antiCheatStatus = 'pending';
      let payoutStatus = 'not_eligible';
      if (eventType === 'finish') {
        const minimum = MIN_FINISH_MS[vehicleType] || 10000;
        antiCheatStatus = elapsedMs >= minimum && checkpointCount >= 4 ? 'review' : 'rejected';
      }
      const [event] = await supabase.insert('streetverse_competition_events', [{
        user_id: userId,
        idempotency_key: idempotencyKey,
        event_type: eventType,
        race_id: raceId,
        vehicle_type: vehicleType,
        city_id: cityId,
        district_id: districtId,
        elapsed_ms: elapsedMs,
        checkpoint_count: checkpointCount,
        anti_cheat_status: antiCheatStatus,
        sponsor_prize_minor: 0,
        currency: 'USD',
        payout_status: payoutStatus,
        metadata: { source: 'streetverse-competition-os', clientCashAwarded: false }
      }]);

      let result = null;
      if (eventType === 'finish' && raceId && vehicleType !== 'rail') {
        const resultKey = `finish:${userId}:${raceId}`;
        const prior = await supabase.select('streetverse_tournament_results', `select=*&idempotency_key=eq.${encodeURIComponent(resultKey)}&limit=1`);
        if (prior?.[0]) result = prior[0];
        else {
          const score = antiCheatStatus === 'rejected' ? 0 : Math.max(1, 1000000 - elapsedMs);
          [result] = await supabase.insert('streetverse_tournament_results', [{
            user_id: userId,
            race_id: raceId,
            vehicle_type: vehicleType,
            city_id: cityId,
            season: 'founder-alpha',
            elapsed_ms: Math.max(1, elapsedMs || 1),
            score,
            anti_cheat_status: antiCheatStatus,
            sponsor_prize_minor: 0,
            payout_status: 'not_eligible',
            idempotency_key: resultKey,
            metadata: { checkpointCount, clientCashAwarded: false }
          }]);
        }
      }
      res.status(201).json({ event, result, authoritative: true, cashAwarded: false, requiresHumanPrizeApproval: true });
    } catch (error) {
      if (error?.status === 409) return res.status(409).json({ error: 'Duplicate competition event' });
      res.status(500).json({ error: error?.message || 'Competition event failed' });
    }
  });

  app.get('/api/streetverse/competition/leaderboard', auth, async (req, res) => {
    try {
      if (!supabase.configured()) return res.status(503).json({ error: 'Durable competition storage unavailable' });
      const vehicle = cleanText(req.query?.vehicle, 40) || 'car';
      if (!VEHICLES.has(vehicle) || vehicle === 'rail') return res.status(400).json({ error: 'Unsupported leaderboard vehicle' });
      const rows = await supabase.select('streetverse_tournament_results', `select=user_id,race_id,vehicle_type,season,elapsed_ms,score,anti_cheat_status,created_at&vehicle_type=eq.${encodeURIComponent(vehicle)}&anti_cheat_status=eq.verified&order=elapsed_ms.asc&limit=25`);
      res.json({ vehicle, season: 'founder-alpha', entries: (rows || []).map((row, index) => ({ rank: index + 1, player: playerCode(row.user_id), raceId: row.race_id, elapsedMs: Number(row.elapsed_ms), score: Number(row.score), verified: true })) });
    } catch (error) {
      res.status(500).json({ error: error?.message || 'Leaderboard unavailable' });
    }
  });
};
