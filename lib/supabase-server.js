"use strict";

const { createClient } = require("@supabase/supabase-js");

function createSupabaseServerClient(env = process.env) {
  const url = env.SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("SUPABASE_SERVER_CONFIG_MISSING");

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "tryamm-production-integration" } }
  });
}

module.exports = { createSupabaseServerClient };
