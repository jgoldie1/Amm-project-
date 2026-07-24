"use strict";

function config() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error("SUPABASE_PRODUCTION_STORE_NOT_CONFIGURED");
  return { url, serviceKey };
}

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const { url, serviceKey } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10_000)
  });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const error = new Error("SUPABASE_STORE_REQUEST_FAILED");
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

function createSupabaseProductionStore() {
  return {
    async upsertGameProfile(profile) {
      const row = {
        user_id: profile.id || profile.playerId,
        display_name: profile.displayName || null,
        xp: Number(profile.xp || 0),
        beans: Number(profile.beans || 0),
        level: Number(profile.level || 1),
        metadata: profile.metadata || {}
      };
      return request("gameverse_profiles?on_conflict=user_id", { method: "POST", body: row, headers: { Prefer: "resolution=merge-duplicates,return=representation" } });
    },

    async recordGameResult({ playerId, gameId, matchId, result, idempotencyKey }) {
      return request("gameverse_results", {
        method: "POST",
        body: {
          user_id: playerId,
          game_id: gameId,
          match_id: matchId || null,
          idempotency_key: idempotencyKey,
          result: result || {}
        },
        headers: { Prefer: "return=representation" }
      });
    },

    async upsertLivingSession(session) {
      return request("living_world_sessions?on_conflict=id", {
        method: "POST",
        body: {
          id: session.id,
          user_id: session.playerId || session.userId,
          game_id: session.gameId,
          state: session.state,
          display_mode: session.displayMode || null,
          cast_target: session.castTarget || null,
          metadata: session
        },
        headers: { Prefer: "resolution=merge-duplicates,return=representation" }
      });
    },

    async securityAudit({ actorUserId, eventType, requestId, metadata = {} }) {
      return request("security_audit_events", {
        method: "POST",
        body: {
          actor_user_id: actorUserId || null,
          event_type: eventType,
          request_id: requestId || null,
          metadata
        },
        headers: { Prefer: "return=minimal" }
      });
    }
  };
}

module.exports = { createSupabaseProductionStore };
