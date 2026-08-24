'use strict'

const express = require('express')

function bearer(req) {
  const header = String(req.headers.authorization || '')
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

function hasReleaseRole(user) {
  const role = String(user?.app_metadata?.role || user?.user_metadata?.role || '').toLowerCase()
  return ['owner','admin','ops','release','finance'].includes(role)
}

function createReleaseControlRouter({ supabase }) {
  const router = express.Router()

  router.get('/health', async (_req,res) => {
    const checks = {}
    for (const table of ['release_registry','release_health_samples']) {
      const { error } = await supabase.from(table).select('id', { head:true, count:'exact' }).limit(1)
      checks[table] = !error
    }
    res.json({ ok:Object.values(checks).every(Boolean), checks, mode:'server-authoritative-release-truth' })
  })

  router.get('/latest', async (_req,res) => {
    const { data, error } = await supabase.from('release_registry')
      .select('commit_sha,environment,deployment_url,production_green,device_green,full_green,gate_results,device_proof,rollback_of_commit_sha,released_at,verified_at')
      .eq('environment','production')
      .order('released_at',{ascending:false})
      .limit(1)
      .maybeSingle()
    if (error) return res.status(500).json({ error:'Release registry unavailable' })
    res.json({ release:data || null })
  })

  async function requireReleaseOperator(req,res,next) {
    const token = bearer(req)
    if (!token) return res.status(401).json({ error:'Authentication required' })
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error:'Invalid session' })
    if (!hasReleaseRole(data.user)) return res.status(403).json({ error:'Release operator role required' })
    req.user = data.user
    next()
  }

  router.use(requireReleaseOperator)

  router.post('/register', async (req,res) => {
    const body = req.body || {}
    const commitSha = String(body.commitSha || '').trim()
    const environment = String(body.environment || 'production').trim()
    if (!commitSha) return res.status(400).json({ error:'commitSha required' })
    if (!['preview','production'].includes(environment)) return res.status(400).json({ error:'invalid environment' })

    const payload = {
      commit_sha: commitSha,
      environment,
      deployment_url: body.deploymentUrl || null,
      production_green: Boolean(body.productionGreen),
      device_green: Boolean(body.deviceGreen),
      gate_results: body.gateResults || {},
      device_proof: body.deviceProof || {},
      rollback_of_commit_sha: body.rollbackOfCommitSha || null,
      verified_at: body.verifiedAt || new Date().toISOString(),
    }
    const { data, error } = await supabase.from('release_registry').upsert(payload,{onConflict:'commit_sha,environment'}).select('*').single()
    if (error) return res.status(500).json({ error:'Could not register release' })
    res.status(201).json({ release:data })
  })

  router.post('/health-sample', async (req,res) => {
    const body = req.body || {}
    const commitSha = String(body.commitSha || '').trim()
    const service = String(body.service || '').trim()
    if (!commitSha || !service) return res.status(400).json({ error:'commitSha and service required' })
    const row = {
      commit_sha: commitSha,
      service,
      route: body.route || null,
      device_class: body.deviceClass || null,
      ok: Boolean(body.ok),
      status_code: Number.isFinite(body.statusCode) ? body.statusCode : null,
      latency_ms: Number.isFinite(body.latencyMs) ? body.latencyMs : null,
      error_code: body.errorCode || null,
      metadata: body.metadata || {},
    }
    const { data, error } = await supabase.from('release_health_samples').insert(row).select('*').single()
    if (error) return res.status(500).json({ error:'Could not record health sample' })
    res.status(201).json({ sample:data })
  })

  router.get('/scale-readiness', async (req,res) => {
    const commitSha = String(req.query.commitSha || '').trim()
    let releaseQuery = supabase.from('release_registry').select('*').eq('environment','production').order('released_at',{ascending:false}).limit(1)
    if (commitSha) releaseQuery = supabase.from('release_registry').select('*').eq('environment','production').eq('commit_sha',commitSha).limit(1)
    const { data:releases, error:releaseError } = await releaseQuery
    if (releaseError) return res.status(500).json({ error:'Release registry unavailable' })
    const release = releases?.[0] || null
    if (!release) return res.json({ ready:false, reason:'no-production-release-record' })

    const since = new Date(Date.now()-60*60*1000).toISOString()
    const { data:samples, error:sampleError } = await supabase.from('release_health_samples')
      .select('service,ok,status_code,latency_ms,sampled_at')
      .eq('commit_sha',release.commit_sha)
      .gte('sampled_at',since)
    if (sampleError) return res.status(500).json({ error:'Health samples unavailable' })

    const rows = samples || []
    const failures = rows.filter(x=>!x.ok)
    const latencies = rows.map(x=>Number(x.latency_ms)).filter(Number.isFinite)
    const avgLatencyMs = latencies.length ? Math.round(latencies.reduce((a,b)=>a+b,0)/latencies.length) : null
    const required = ['home','streetverse','financial-truth','backend-health']
    const seen = new Set(rows.filter(x=>x.ok).map(x=>x.service))
    const missing = required.filter(x=>!seen.has(x))
    const ready = Boolean(release.full_green) && failures.length===0 && missing.length===0

    res.json({
      ready,
      commitSha:release.commit_sha,
      fullGreen:Boolean(release.full_green),
      productionGreen:Boolean(release.production_green),
      deviceGreen:Boolean(release.device_green),
      sampleCount:rows.length,
      failures:failures.length,
      missingRequiredServices:missing,
      averageLatencyMs:avgLatencyMs,
      decision:ready?'scale-allowed':'hold-scale',
    })
  })

  return router
}

module.exports = { createReleaseControlRouter, hasReleaseRole }
