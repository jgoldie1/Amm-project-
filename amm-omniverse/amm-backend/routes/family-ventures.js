const express = require('express')

function createFamilyVenturesRouter({ supabase }) {
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
    } catch (_) { res.status(401).json({ error: 'Authentication failed' }) }
  }

  router.get('/plugins', requireUser, async (_req, res) => {
    const { data, error } = await supabase.from('plugin_registry')
      .select('plugin_key,name,category,runtime,status,version,permissions,capabilities,requires_human_confirmation,youth_allowed,config_schema')
      .in('status', ['sandbox','enabled']).order('category').order('name')
    if (error) return res.status(500).json({ error: error.message })
    res.json({ plugins: data || [] })
  })

  router.get('/jacobie/cyber', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('jacobie_cyber_projects').select('*').eq('owner_user_id', req.user.id).order('updated_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ projects: data || [] })
  })

  router.post('/jacobie/cyber', requireUser, async (req, res) => {
    const types = ['security-audit','training-lab','threat-model','incident-simulation','privacy-review','compliance-readiness','cyber-range']
    if (!types.includes(req.body?.projectType) || !req.body?.title) return res.status(400).json({ error: 'Valid title and projectType required' })
    const { data, error } = await supabase.from('jacobie_cyber_projects').insert({
      owner_user_id: req.user.id,
      title: String(req.body.title).slice(0,160),
      project_type: req.body.projectType,
      scope: req.body?.scope || {},
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ project: data })
  })

  router.get('/jacobie/real-estate', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('jacobie_real_estate_projects').select('*').eq('owner_user_id', req.user.id).order('updated_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ projects: data || [] })
  })

  router.post('/jacobie/real-estate', requireUser, async (req, res) => {
    const types = ['land','single-family','multi-family','commercial','flip','rental','development','wholesale-simulation']
    if (!types.includes(req.body?.projectType) || !req.body?.title) return res.status(400).json({ error: 'Valid title and projectType required' })
    const n = v => (v == null || v === '') ? null : Number(v)
    const { data, error } = await supabase.from('jacobie_real_estate_projects').insert({
      owner_user_id: req.user.id, project_type: req.body.projectType,
      title: String(req.body.title).slice(0,160), market: req.body?.market || null,
      purchase_price: n(req.body?.purchasePrice), rehab_budget: n(req.body?.rehabBudget),
      after_repair_value: n(req.body?.afterRepairValue), carrying_cost: n(req.body?.carryingCost),
      projected_rent: n(req.body?.projectedRent), assumptions: req.body?.assumptions || {},
      due_diligence: req.body?.dueDiligence || {},
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ project: data })
  })

  router.get('/isaiah/starverse', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('starverse_links').select('*').eq('user_id', req.user.id).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ link: data || null, app: 'isaiah-starverse', brand: 'Isaiah AI TV — Anyone Can Be A Star' })
  })

  router.get('/aniyah/audio', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('aniyah_audio_projects').select('*, aniyah_audio_tracks(*)').eq('owner_user_id', req.user.id).order('updated_at', { ascending: false })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ projects: data || [] })
  })

  router.post('/aniyah/audio', requireUser, async (req, res) => {
    if (!req.body?.title) return res.status(400).json({ error: 'title required' })
    const { data, error } = await supabase.from('aniyah_audio_projects').insert({
      owner_user_id: req.user.id, title: String(req.body.title).slice(0,160), tempo: req.body?.tempo || null,
      project_state: { engine: '64-track', features: ['pitch-correction','vocal-coach','mix-assist','master-assist','universal-daw-export'] },
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ project: data })
  })

  router.post('/aniyah/audio/:projectId/tracks', requireUser, async (req, res) => {
    const { data: project } = await supabase.from('aniyah_audio_projects').select('id').eq('id', req.params.projectId).eq('owner_user_id', req.user.id).maybeSingle()
    if (!project) return res.status(404).json({ error: 'Project not found' })
    const trackNumber = Number(req.body?.trackNumber)
    if (!Number.isInteger(trackNumber) || trackNumber < 1 || trackNumber > 64 || !req.body?.name) return res.status(400).json({ error: 'trackNumber 1-64 and name required' })
    const { data, error } = await supabase.from('aniyah_audio_tracks').upsert({
      project_id: project.id, track_number: trackNumber, name: String(req.body.name).slice(0,120),
      track_type: req.body?.trackType || 'audio', audio_url: req.body?.audioUrl || null,
    }, { onConflict: 'project_id,track_number' }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ track: data })
  })

  router.post('/aniyah/vocal-coach', requireUser, async (req, res) => {
    const allowed = ['pitch','timing','breath','tone','range','delivery','harmony','performance','mix-feedback','mastering-feedback']
    if (!allowed.includes(req.body?.sessionType)) return res.status(400).json({ error: 'Invalid sessionType' })
    const guidance = {
      pitch: ['Set the intended key/scale before correction.','Use correction strength musically; preserve intentional slides and expression.'],
      timing: ['Align phrase starts first, then micro-edit only where the groove suffers.'],
      breath: ['Plan natural breath points; stop if singing causes pain or strain.'],
      tone: ['Compare takes at matched loudness and fix mic technique before excessive EQ.'],
      range: ['Work gradually inside a comfortable range; do not force painful notes.'],
      delivery: ['Choose emotional intent first and comp the strongest performances.'],
      harmony: ['Check harmony notes against the chord progression and lead melody.'],
      performance: ['Record multiple complete takes, then comp the best phrases.'],
      'mix-feedback': ['Gain stage first, then EQ/dynamics/space/automation; reference at matched loudness.'],
      'mastering-feedback': ['Preserve headroom, check loudness/true peak/dynamics and test translation on multiple playback systems.'],
    }
    const { data, error } = await supabase.from('aniyah_vocal_coach_sessions').insert({
      user_id: req.user.id, project_id: req.body?.projectId || null, session_type: req.body.sessionType,
      source_audio_url: req.body?.sourceAudioUrl || null,
      analysis: { mode: 'assistive-coach', automated: true }, recommendations: guidance[req.body.sessionType] || [],
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ session: data })
  })

  router.get('/aniyah/crossborder', requireUser, async (req, res) => {
    const [q, t] = await Promise.all([
      supabase.from('aniyah_crossborder_quotes').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(25),
      supabase.from('aniyah_crossborder_transfers').select('*').eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(25),
    ])
    if (q.error || t.error) return res.status(500).json({ error: q.error?.message || t.error?.message })
    res.json({ quotes: q.data || [], transfers: t.data || [], liveTransfersEnabled: false, reason: 'Requires licensed payment-provider adapter, KYC/AML/sanctions controls and approved corridors.' })
  })

  router.post('/aniyah/crossborder/quote', requireUser, async (req, res) => {
    const amount = Number(req.body?.sourceAmount)
    const source = String(req.body?.sourceCurrency || '').toUpperCase()
    const dest = String(req.body?.destinationCurrency || '').toUpperCase()
    if (!Number.isFinite(amount) || amount <= 0 || !/^[A-Z]{3}$/.test(source) || !/^[A-Z]{3}$/.test(dest)) return res.status(400).json({ error: 'Valid amount and ISO currency codes required' })
    // Deliberately not inventing an FX rate. A licensed provider adapter supplies real quotes.
    const { data, error } = await supabase.from('aniyah_crossborder_quotes').insert({
      user_id: req.user.id, provider: 'provider-not-connected', source_currency: source,
      destination_currency: dest, source_amount: amount, status: 'quoted',
      metadata: { simulation: true, note: 'No live FX rate until an approved provider is connected.' },
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ quote: data, executable: false })
  })

  return router
}

module.exports = { createFamilyVenturesRouter }
