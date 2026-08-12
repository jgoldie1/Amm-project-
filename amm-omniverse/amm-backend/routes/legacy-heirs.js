const express = require('express')

function createLegacyHeirsRouter({ supabase }) {
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

  router.get('/overview', requireUser, async (req, res) => {
    const [plans, vault] = await Promise.all([
      supabase.from('legacy_succession_plans').select('*').eq('owner_user_id', req.user.id).order('updated_at', { ascending: false }),
      supabase.from('legacy_vault_items').select('*').eq('owner_user_id', req.user.id).order('updated_at', { ascending: false }),
    ])
    if (plans.error || vault.error) return res.status(500).json({ error: plans.error?.message || vault.error?.message })
    res.json({
      plans: plans.data || [],
      vault: vault.data || [],
      legalBoundary: 'Platform records intentions and digital permissions only. Legal ownership, trusts, estates, real estate, securities and regulated assets require valid external legal instruments and human/legal review.',
    })
  })

  router.post('/plans', requireUser, async (req, res) => {
    const types = ['digital-legacy','business-continuity','ip-succession','education-fund','family-governance','trust-reference','estate-reference']
    if (!req.body?.title || !types.includes(req.body?.planType)) return res.status(400).json({ error: 'Valid title and planType required' })
    const { data, error } = await supabase.from('legacy_succession_plans').insert({
      owner_user_id: req.user.id,
      title: String(req.body.title).slice(0,180),
      plan_type: req.body.planType,
      legal_document_reference: req.body?.legalDocumentReference || null,
      requires_external_legal_validation: true,
      instructions: req.body?.instructions || {},
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ plan: data })
  })

  router.post('/vault', requireUser, async (req, res) => {
    const types = ['letter','video','audio','book','business-plan','ip-record','credential','family-history','instruction','other']
    if (!req.body?.title || !types.includes(req.body?.itemType)) return res.status(400).json({ error: 'Valid title and itemType required' })
    const { data, error } = await supabase.from('legacy_vault_items').insert({
      owner_user_id: req.user.id,
      title: String(req.body.title).slice(0,180),
      item_type: req.body.itemType,
      storage_reference: req.body?.storageReference || null,
      visibility: ['private','family','heir-specific','public'].includes(req.body?.visibility) ? req.body.visibility : 'private',
      intended_heir_ids: Array.isArray(req.body?.intendedHeirIds) ? req.body.intendedHeirIds : [],
      release_conditions: req.body?.releaseConditions || {},
      checksum: req.body?.checksum || null,
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ item: data })
  })

  router.get('/family-profiles', requireUser, async (_req, res) => {
    const { data, error } = await supabase.from('family_legacy_profiles').select('*').eq('active', true).order('display_name')
    if (error) return res.status(500).json({ error: error.message })
    res.json({ profiles: data || [] })
  })

  return router
}

module.exports = { createLegacyHeirsRouter }
