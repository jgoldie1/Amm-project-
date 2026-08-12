const express = require('express')
const { createAdvancedWorldsRouter } = require('./advanced-worlds')

function createOmniverseRouter({ supabase }) {
  const router = express.Router()

  async function requireUser(req, res, next) {
    try {
      const auth = req.headers.authorization || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (!token) return res.status(401).json({ error: 'Authentication required' })
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data?.user) return res.status(401).json({ error: 'Invalid session' })
      req.user = data.user
      next()
    } catch (_error) {
      res.status(401).json({ error: 'Authentication failed' })
    }
  }

  router.get('/worlds', async (_req, res) => {
    const { data, error } = await supabase.from('worlds').select('*').order('name')
    if (error) return res.status(500).json({ error: error.message })
    res.json({ worlds: data || [] })
  })

  router.get('/profile', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('world_profiles').select('*').eq('user_id', req.user.id).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ profile: data || null })
  })

  router.post('/profile', requireUser, async (req, res) => {
    const allowed = ['avatar_name','home_world_slug','level','xp','reputation','skills','accessibility']
    const patch = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)))
    const { data, error } = await supabase.from('world_profiles').upsert({ user_id: req.user.id, ...patch, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ profile: data })
  })

  router.get('/session', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('world_sessions').select('*, worlds(*)').eq('user_id', req.user.id).is('ended_at', null).order('entered_at', { ascending: false }).limit(1).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ session: data || null })
  })

  router.post('/session', requireUser, async (req, res) => {
    const { worldId, worldSlug, state = {}, shard = 'global-1' } = req.body || {}
    let id = worldId
    if (!id && worldSlug) {
      const { data: world } = await supabase.from('worlds').select('id').eq('slug', worldSlug).maybeSingle()
      id = world?.id
    }
    if (!id) return res.status(400).json({ error: 'worldId or valid worldSlug required' })
    await supabase.from('world_sessions').update({ ended_at: new Date().toISOString() }).eq('user_id', req.user.id).is('ended_at', null)
    const { data, error } = await supabase.from('world_sessions').insert({ user_id: req.user.id, world_id: id, shard, state }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    await supabase.from('platform_events').insert({ user_id: req.user.id, world_id: id, event_type: 'WORLD_ENTERED', source: 'backend', payload: { state } })
    res.status(201).json({ session: data })
  })

  router.patch('/session/:id', requireUser, async (req, res) => {
    const { state, close } = req.body || {}
    const patch = {}
    if (state && typeof state === 'object') patch.state = state
    if (close === true) patch.ended_at = new Date().toISOString()
    const { data, error } = await supabase.from('world_sessions').update(patch).eq('id', req.params.id).eq('user_id', req.user.id).select('*').maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Session not found' })
    res.json({ session: data })
  })

  router.get('/projects', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('creator_projects').select('*').eq('owner_id', req.user.id).order('updated_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ projects: data || [] })
  })

  router.post('/projects', requireUser, async (req, res) => {
    const { title, projectType = 'other', data: projectData = {} } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title required' })
    const { data, error } = await supabase.from('creator_projects').insert({ owner_id: req.user.id, title, project_type: projectType, status: 'idea', current_stage: 'idea', data: projectData }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    await supabase.from('platform_events').insert({ user_id: req.user.id, event_type: 'PROJECT_CREATED', source: 'backend', payload: { projectId: data.id, projectType } })
    res.status(201).json({ project: data })
  })

  router.patch('/projects/:id', requireUser, async (req, res) => {
    const allowed = ['title','status','current_stage','data']
    const patch = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)))
    patch.updated_at = new Date().toISOString()
    const { data, error } = await supabase.from('creator_projects').update(patch).eq('id', req.params.id).eq('owner_id', req.user.id).select('*').maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Project not found' })
    res.json({ project: data })
  })

  router.get('/workforce', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('workforce_runs').select('*').eq('user_id', req.user.id).order('started_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ runs: data || [] })
  })

  router.post('/workforce', requireUser, async (req, res) => {
    const { simulationKey, state = {} } = req.body || {}
    if (!simulationKey) return res.status(400).json({ error: 'simulationKey required' })
    const { data, error } = await supabase.from('workforce_runs').insert({ user_id: req.user.id, simulation_key: simulationKey, status: 'started', state, feedback: {} }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    await supabase.from('platform_events').insert({ user_id: req.user.id, event_type: 'WORKFORCE_SIMULATION_STARTED', source: 'backend', payload: { runId: data.id, simulationKey } })
    res.status(201).json({ run: data })
  })

  router.patch('/workforce/:id', requireUser, async (req, res) => {
    const { state, status, score, feedback } = req.body || {}
    const patch = {}
    if (state && typeof state === 'object') patch.state = state
    if (feedback && typeof feedback === 'object') patch.feedback = feedback
    if (['started','paused','completed','failed'].includes(status)) patch.status = status
    if (typeof score === 'number') patch.score = score
    if (status === 'completed') patch.completed_at = new Date().toISOString()
    const { data, error } = await supabase.from('workforce_runs').update(patch).eq('id', req.params.id).eq('user_id', req.user.id).select('*').maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    if (!data) return res.status(404).json({ error: 'Workforce run not found' })
    if (status === 'completed') await supabase.from('platform_events').insert({ user_id: req.user.id, event_type: 'WORKFORCE_SIMULATION_COMPLETED', source: 'backend', payload: { runId: data.id, simulationKey: data.simulation_key, score: data.score } })
    res.json({ run: data })
  })

  router.get('/publications', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('publications').select('*').eq('owner_id', req.user.id).order('updated_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ publications: data || [] })
  })

  router.post('/publications', requireUser, async (req, res) => {
    const { title, projectId = null, format = 'ebook', metadata = {} } = req.body || {}
    if (!title) return res.status(400).json({ error: 'title required' })
    const { data, error } = await supabase.from('publications').insert({ owner_id: req.user.id, project_id: projectId, title, format, metadata }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    await supabase.from('platform_events').insert({ user_id: req.user.id, event_type: 'PUBLICATION_CREATED', source: 'backend', payload: { publicationId: data.id, title, format } })
    res.status(201).json({ publication: data })
  })

  router.get('/store/catalog', async (_req, res) => {
    const { data, error } = await supabase.from('app_store_assets').select('*').eq('status', 'approved').order('name')
    if (error) return res.status(500).json({ error: error.message })
    res.json({ assets: data || [] })
  })

  router.post('/store/acquire/:assetKey', requireUser, async (req, res) => {
    const { data: asset, error: assetError } = await supabase.from('app_store_assets').select('*').eq('asset_key', req.params.assetKey).eq('status', 'approved').maybeSingle()
    if (assetError) return res.status(500).json({ error: assetError.message })
    if (!asset) return res.status(404).json({ error: 'Asset not found' })
    if (asset.price_cents > 0) return res.status(402).json({ error: 'Paid assets must use the Stripe checkout flow', asset })
    const { data, error } = await supabase.from('entitlements').upsert({ user_id: req.user.id, asset_key: asset.asset_key, asset_type: asset.asset_type, source: 'grant', metadata: { catalog_asset_id: asset.id } }, { onConflict: 'user_id,asset_key' }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    await supabase.from('platform_events').insert({ user_id: req.user.id, event_type: 'ASSET_ACQUIRED', source: 'backend', payload: { assetKey: asset.asset_key, assetType: asset.asset_type } })
    res.json({ entitlement: data, asset })
  })

  router.get('/entitlements', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('entitlements').select('*').eq('user_id', req.user.id).order('starts_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ entitlements: data || [] })
  })

  router.get('/events', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('platform_events').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(100)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ events: data || [] })
  })

  // Space, Chrono, Biosphere, Global City, AI Cafe operations and Generations APIs.
  router.use('/advanced', createAdvancedWorldsRouter({ supabase }))

  return router
}

module.exports = { createOmniverseRouter }
