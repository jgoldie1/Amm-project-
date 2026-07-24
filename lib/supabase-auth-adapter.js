"use strict";

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name}_NOT_CONFIGURED`);
  return value.replace(/\/$/, "");
}

async function verifyAccessToken(token) {
  const url = required("SUPABASE_URL");
  const anonKey = required("SUPABASE_ANON_KEY");
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`
    },
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) return null;
  const user = await response.json();
  return user?.id ? { id: user.id, email: user.email || null, sessionId: user.aud || null } : null;
}

async function loadRoles(userId, token) {
  const url = required("SUPABASE_URL");
  const anonKey = required("SUPABASE_ANON_KEY");
  const response = await fetch(`${url}/rest/v1/user_roles?user_id=eq.${encodeURIComponent(userId)}&select=role`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    },
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows.map((row) => row.role).filter(Boolean) : [];
}

function createSupabaseAuthAdapter() {
  return {
    async verifyAccessToken(token) {
      const identity = await verifyAccessToken(token);
      if (identity) identity.__token = token;
      return identity;
    },
    async loadRoles(userId, identity) {
      return loadRoles(userId, identity?.__token);
    }
  };
}

module.exports = { createSupabaseAuthAdapter, verifyAccessToken, loadRoles };
