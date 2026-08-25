const DEFAULT_TIMEOUT_MS = 8000
const REGISTRY_STALE_AFTER_MS = 6 * 60 * 60 * 1000

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
      headers: { 'user-agent': 'TRYAMM-Convergence-Probe/1.0' },
    })
    return {
      name,
      status: response.ok ? 'healthy' : 'degraded',
      httpStatus: response.status,
      url,
    }
  } catch (error) {
    return {
      name,
      status: 'down',
      url,
      reason: error?.name === 'AbortError' ? 'timeout' : 'request failed',
    }
  } finally {
    t.clear()
  }
}

function annotateRegistryRows(rows, now = Date.now()) {
  return rows.map(row => {
    const checkedAtMs = Date.parse(row.checked_at || '')
    const ageMs = Number.isFinite(checkedAtMs) ? Math.max(0, now - checkedAtMs) : null
    return {
      ...row,
      evidence: {
        stale: ageMs === null || ageMs > REGISTRY_STALE_AFTER_MS,
        ageHours: ageMs === null ? null : Math.round((ageMs / 36e5) * 10) / 10,
      },
    }
  })
}

async function readRegistry() {
  const base = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) return { status: 'unverified', rows: [], reason: 'Supabase public client env not configured' }

  const t = timeoutSignal()
  try {
    const response = await fetch(`${base}/rest/v1/system_convergence_status?select=service,status,environment,public_url,commit_sha,details,checked_at&order=service.asc`, {
      signal: t.signal,
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    if (!response.ok) return { status: 'degraded', rows: [], reason: `registry returned ${response.status}` }
    const rows = annotateRegistryRows(await response.json())
    return {
      status: 'healthy',
      rows,
      freshness: {
        staleAfterHours: REGISTRY_STALE_AFTER_MS / 36e5,
        staleCount: rows.filter(row => row.evidence.stale).length,
      },
    }
  } catch (error) {
    return { status: 'down', rows: [], reason: error?.name === 'AbortError' ? 'registry timeout' : 'registry request failed' }
  } finally {
    t.clear()
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'method_not_allowed' })

  const renderUrl = process.env.RENDER_HEALTH_URL || 'https://amm-project-1-rpz9.onrender.com/'
  const publicUrl = process.env.PUBLIC_APP_URL || 'https://tryamm.online/'

  const [registry, publicWeb, render] = await Promise.all([
    readRegistry(),
    probe('tryamm-web', publicUrl),
    probe('render', renderUrl),
  ])

  const services = [publicWeb, render]
  const hasDown = services.some(item => item.status === 'down') || registry.status === 'down'
  const hasDegraded = services.some(item => item.status === 'degraded') || ['degraded','unverified'].includes(registry.status)
  const overall = hasDown ? 'down' : hasDegraded ? 'degraded' : 'healthy'

  return res.status(hasDown ? 503 : 200).json({
    ok: !hasDown,
    controlPlane: 'TRYAMM Quantum Convergence v1',
    meaning: 'systems convergence and release verification; not a claim of quantum-computing execution',
    overall,
    deployment: {
      provider: 'vercel',
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
      project: process.env.VERCEL_PROJECT_PRODUCTION_URL || null,
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    },
    probes: services,
    registry,
    safety: {
      autoRepairAllowedFor: ['retry','provider-failover','low-risk-disable','rollback-to-known-good'],
      humanGateRequiredFor: ['payments','wallet-ledger','payouts','identity','permissions','moderation','player-inventory'],
    },
    checkedAt: new Date().toISOString(),
  })
}
