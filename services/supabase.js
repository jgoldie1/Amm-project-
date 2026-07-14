const { createClient } = require('@supabase/supabase-js');

function configured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let serviceClient;
function getServiceClient() {
  if (!configured()) return null;
  if (!serviceClient) {
    serviceClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { 'X-Client-Info': 'tryamm-server' } }
    });
  }
  return serviceClient;
}

async function userFromRequest(req) {
  const header = String(req.headers.authorization || '');
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) return null;
  const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data, error } = await client.auth.getUser(token);
  if (error) return null;
  return data.user || null;
}

function requireUser() {
  return async (req, res, next) => {
    try {
      const user = await userFromRequest(req);
      if (!user) return res.status(401).json({ error: 'Authentication required.' });
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { configured, getServiceClient, userFromRequest, requireUser };
