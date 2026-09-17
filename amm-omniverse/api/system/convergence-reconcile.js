const DEFAULT_TIMEOUT_MS = 8000

function timeoutSignal(ms = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

async function probe(name, url) {
  if (!url) return { name, status: 'unverified', reason: 'not configured' }
  const t = timeoutSignal()
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: t.signal,
      headers: { 'user-agent': 'TRYAMM-Convergence-Reconcile/1.0' },
    })
    return { name, status: response.ok ? 'healthy' : 'degraded', httpStatus: response.status, url }
  } catch (error) {
    return { name, status: 'down', url, reason: error?.name === 'AbortError' ? 'timeout' : 'request failed' }
  } finally {
    t.clear()
  }
}

function authorized(req) {
  const expected = process.env.CONVERGENCE_RECONCILE_TOKEN
  if (!expected) return false
  const supplied = String(req.headers?.authorization || '')
  return supplied === `Bearer ${expected}`
}

async function updateRegistry(base, serviceKey, rows) {
  const response = await fetch(`${base}/rest/v1/system_convergence_status?on_conflict=service`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(rows),
  })
  if (!response.ok) throw new Error(`registry write returned ${response.status}`)
  return response.json()
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  if (!authorized(req)) return res.status(401).json({ ok: false, error: 'unauthorized' })

  const base = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!base || !serviceKey) return res.status(503).json({ ok: false, error: 'server_registry_credentials_unavailable' })

  const publicUrl = process.env.PUBLIC_APP_URL || 'https://tryamm.online/'
  const renderUrl = process.env.RENDER_HEALTH_URL || 'https://amm-project-d3zu.onrender.com/api/health'
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || null
  const checkedAt = new Date().toISOString()

  const probes = await Promise.all([
    probe('tryamm-web', publicUrl),
    probe('render', renderUrl),
  ])

  // Reconcile only services for which this invocation generated direct evidence.
  // A refresh never promotes an unhealthy service and never touches unrelated gated/degraded rows.
  const rows = probes.map(item => ({
    service: item.name,
    status: item.status,
    environment: 'production',
    public_url: item.url,
    commit_sha: item.name === 'tryamm-web' ? commitSha : null,
    details: {
      source: 'server-reconciliation',
      httpStatus: item.httpStatus || null,
      reason: item.reason || null,
    },
    checked_at: checkedAt,
  }))

  try {
    const written = await updateRegistry(base, serviceKey, rows)
    return res.status(200).json({
      ok: true,
      reconciled: written.map(row => row.service),
      checkedAt,
      commitSha,
      probes,
      untouchedServicesPreserved: true,
    })
  } catch (error) {
    return res.status(503).json({ ok: false, error: 'registry_write_failed', reason: error?.message || 'unknown' })
  }
}
