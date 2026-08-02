'use strict';

function configured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function baseUrl() {
  return String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
}

function headers(extra = {}) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
    ...extra
  };
}

async function request(table, options = {}) {
  if (!configured()) throw new Error('Supabase is not configured');
  const query = options.query ? `?${options.query}` : '';
  const response = await fetch(`${baseUrl()}/rest/v1/${table}${query}`, {
    method: options.method || 'GET',
    headers: headers(options.headers),
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok) {
    const error = new Error(`Supabase ${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function insert(table, row) {
  const result = await request(table, { method: 'POST', body: row });
  return Array.isArray(result) ? result[0] : result;
}

async function upsert(table, row, conflictColumns) {
  const headersOverride = { Prefer: 'resolution=merge-duplicates,return=representation' };
  const query = conflictColumns ? `on_conflict=${encodeURIComponent(conflictColumns)}` : '';
  const result = await request(table, { method: 'POST', body: row, query, headers: headersOverride });
  return Array.isArray(result) ? result[0] : result;
}

async function select(table, query = '') {
  return request(table, { query });
}

async function patch(table, query, changes) {
  return request(table, { method: 'PATCH', query, body: changes });
}

module.exports = { configured, request, insert, upsert, select, patch };
