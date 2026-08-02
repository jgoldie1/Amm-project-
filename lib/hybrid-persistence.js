'use strict';

const { createSupabaseRest } = require('./supabase-rest');
const { createPersistenceRetryQueue } = require('./persistence-retry-queue');

function createHybridPersistence({ getStore, saveStore, id }) {
  const supabase = createSupabaseRest();
  const retryQueue = createPersistenceRetryQueue({ getStore, saveStore, id });

  async function persist(table, record, { onConflict } = {}) {
    if (!supabase.configured()) return { mode: 'local', record };
    try {
      const rows = onConflict
        ? await supabase.upsert(table, record, onConflict)
        : await supabase.insert(table, record);
      return { mode: 'supabase', record: rows?.[0] || record };
    } catch (error) {
      const queued = await retryQueue.enqueue({ table, record, onConflict, error: error.message });
      const store = getStore();
      store.events = store.events || [];
      store.events.push({
        id: id('persist'), type: 'persistence.fallback', table,
        retryId: queued.id, message: error.message, createdAt: new Date().toISOString()
      });
      await saveStore();
      return { mode: 'local-fallback', record, retryId: queued.id, error: error.message };
    }
  }

  async function retryPending({ limit = 25 } = {}) {
    if (!supabase.configured()) return { configured: false, attempted: 0, resolved: 0, failed: 0 };
    const queue = retryQueue.ensureQueue();
    const pending = queue.filter(item => item.status === 'pending').slice(0, Math.max(1, Math.min(100, limit)));
    let resolved = 0;
    let failed = 0;
    for (const item of pending) {
      item.status = 'processing'; item.updatedAt = new Date().toISOString();
      try {
        if (item.onConflict) await supabase.upsert(item.table, item.record, item.onConflict);
        else await supabase.insert(item.table, item.record);
        item.status = 'resolved'; item.resolvedAt = new Date().toISOString(); resolved += 1;
      } catch (error) {
        item.status = item.attempts >= 10 ? 'failed' : 'pending';
        item.attempts += 1; item.lastError = error.message; failed += 1;
      }
      item.updatedAt = new Date().toISOString();
    }
    await saveStore();
    return { configured: true, attempted: pending.length, resolved, failed, summary: retryQueue.summary() };
  }

  return {
    configured: supabase.configured,
    retryPending,
    retrySummary: retryQueue.summary,
    async experienceProfile(user) {
      return persist('experience_profiles', {
        user_id: user.id,
        age_lane: user.ageLane || 'adult',
        country_code: user.countryCode || 'US',
        accessibility: user.accessibility || {},
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    },
    async teleport(session) {
      return persist('teleport_sessions', {
        id: session.id,
        user_id: session.userId,
        world_id: session.worldId,
        world_name: session.worldName,
        mode: session.mode,
        age_lane: session.ageLane,
        state: session.state,
        checks: session.checks,
        created_at: session.createdAt
      }, { onConflict: 'id' });
    },
    async paymentIntent(intent) {
      return persist('payment_intents', {
        id: intent.id,
        user_id: intent.userId,
        provider: intent.provider,
        amount_minor: intent.amountMinor,
        currency: intent.currency,
        purpose: intent.purpose,
        status: intent.status,
        idempotency_key: intent.idempotencyKey,
        provider_reference: intent.providerReference,
        production: intent.production,
        created_at: intent.createdAt,
        updated_at: intent.updatedAt
      }, { onConflict: 'id' });
    },
    async webhook(event) {
      return persist('webhook_events', {
        id: event.id,
        provider: event.provider,
        signature_valid: event.signatureValid,
        provider_event_id: event.providerEventId || null,
        payload: event.payload || {},
        received_at: event.createdAt
      }, { onConflict: 'id' });
    },
    async payout(payout) {
      return persist('payouts', {
        id: payout.id,
        user_id: payout.userId,
        provider: payout.provider,
        amount_minor: payout.amountMinor,
        currency: payout.currency,
        status: payout.status,
        idempotency_key: payout.idempotencyKey,
        production: payout.production,
        created_at: payout.createdAt
      }, { onConflict: 'id' });
    },
    async ledgerEntries(reference, entries) {
      const results = [];
      for (const entry of entries) {
        results.push(await persist('ledger_entries', {
          id: entry.id,
          reference,
          account: entry.account,
          direction: entry.direction,
          amount_minor: entry.amountMinor,
          currency: entry.currency,
          created_at: entry.createdAt
        }, { onConflict: 'id' }));
      }
      return results;
    },
    async audit(event) {
      return persist('audit_events', {
        id: event.id || id('audit'),
        actor_user_id: event.actorUserId || null,
        event_type: event.type,
        target_type: event.targetType || null,
        target_id: event.targetId || null,
        metadata: event.metadata || {},
        created_at: event.createdAt || new Date().toISOString()
      }, { onConflict: 'id' });
    }
  };
}

module.exports = { createHybridPersistence };
