'use strict';

const SUPABASE_URL = String(process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function configured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function headers(extra = {}) {
  return {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

async function parseResponse(response) {
  const text = await response.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  if (!response.ok) {
    const error = new Error(data?.message || data?.msg || data?.error_description || data?.hint || `Supabase request failed (${response.status})`);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

async function request(table, { method = 'GET', query = '', body, prefer = 'return=representation' } = {}) {
  if (!configured()) {
    const error = new Error('Supabase is not configured');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ''}`, {
    method,
    headers: headers({ Prefer: prefer }),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return parseResponse(response);
}

async function authAdminRequest(path, { method = 'GET', body } = {}) {
  if (!configured()) {
    const error = new Error('Supabase is not configured');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }
  const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/${path.replace(/^\//, '')}`, {
    method,
    headers: headers(),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return parseResponse(response);
}

async function getUser(accessToken) {
  if (!configured()) {
    const error = new Error('Supabase is not configured');
    error.code = 'SUPABASE_NOT_CONFIGURED';
    throw error;
  }
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  return parseResponse(response);
}

module.exports = {
  configured,
  select: (table, query) => request(table, { query }),
  insert: (table, rows) => request(table, { method: 'POST', body: rows }),
  update: (table, query, patch) => request(table, { method: 'PATCH', query, body: patch }),
  remove: (table, query) => request(table, { method: 'DELETE', query, prefer: 'return=representation' }),
  auth: {
    createUser: ({ email, password, displayName }) => authAdminRequest('users', {
      method: 'POST',
      body: {
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: displayName || '' }
      }
    }),
    getUser
  }
};
