'use strict';

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function configured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function request(table, { method = 'GET', query = '', body, prefer = 'return=representation' } = {}) {
  if (!configured()) {
    const error = new Error('Supabase is not configured');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`, {
    method,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: prefer
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(data?.message || data?.hint || `Supabase request failed (${response.status})`);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

module.exports = {
  configured,
  select: (table, query) => request(table, { query }),
  insert: (table, rows) => request(table, { method: 'POST', body: rows }),
  update: (table, query, patch) => request(table, { method: 'PATCH', query, body: patch }),
  remove: (table, query) => request(table, { method: 'DELETE', query, prefer: 'return=representation' })
};
