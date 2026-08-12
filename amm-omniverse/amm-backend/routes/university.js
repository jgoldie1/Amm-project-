const express = require('express')

function createUniversityRouter({ supabase }) {
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

  async function getAgeLane(userId) {
    const { data, error } = await supabase.from('holo_identity_profiles').select('age_lane').eq('user_id', userId).maybeSingle()
    if (error) throw error
    return data?.age_lane || null
  }

  router.get('/catalog', async (_req, res) => {
    const [p, c] = await Promise.all([
      supabase.from('university_programs').select('*').eq('active', true).order('level').order('name'),
      supabase.from('university_courses').select('*').eq('active', true).order('code')
    ])
    if (p.error || c.error) return res.status(500).json({ error: p.error?.message || c.error?.message })
    res.json({ programs: p.data || [], courses: c.data || [] })
  })

  router.get('/me', requireUser, async (req, res) => {
    const { data: student, error } = await supabase.from('university_students').select('*').eq('user_id', req.user.id).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    if (!student) return res.json({ student: null, enrollments: [], credentials: [], transcript: [], portfolio: [], guardians: [] })
    const [e, cr, tr, pf, g] = await Promise.all([
      supabase.from('university_enrollments').select('*, university_sections(*, university_courses(*))').eq('student_id', student.id),
      supabase.from('university_credentials').select('*').eq('student_id', student.id).order('issued_at', { ascending: false }),
      supabase.from('university_transcript_entries').select('*').eq('student_id', student.id).order('term', { ascending: false }),
      supabase.from('university_portfolio_items').select('*').eq('student_id', student.id).order('created_at', { ascending: false }),
      supabase.from('university_guardians').select('id,relationship,permissions,verified,guardian_user_id').eq('student_id', student.id),
    ])
    const err = [e.error, cr.error, tr.error, pf.error, g.error].find(Boolean)
    if (err) return res.status(500).json({ error: err.message })
    res.json({ student, enrollments: e.data || [], credentials: cr.data || [], transcript: tr.data || [], portfolio: pf.data || [], guardians: g.data || [] })
  })

  router.post('/me', requireUser, async (req, res) => {
    try {
      const ageLane = await getAgeLane(req.user.id)
      if (!ageLane) return res.status(409).json({ error: 'Holo Identity age lane must be verified before creating a student profile' })
      const requested = req.body?.educationStage
      const allowedByLane = {
        child: ['prek','k5','middle'],
        teen: ['middle','high','trade','certificate','associate'],
        adult: ['trade','certificate','associate','bachelor','master','doctorate','professional','continuing','adult'],
      }
      const allowed = allowedByLane[ageLane] || []
      const educationStage = allowed.includes(requested) ? requested : allowed[0]
      if (!educationStage) return res.status(403).json({ error: 'No education stage is available for this identity profile' })
      const { data, error } = await supabase.from('university_students').upsert({
        user_id: req.user.id,
        education_stage: educationStage,
        program_code: req.body?.programCode || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' }).select('*').single()
      if (error) return res.status(500).json({ error: error.message })
      res.json({ student: data, ageLane })
    } catch (err) { res.status(500).json({ error: err.message }) }
  })

  router.get('/hbcu-network', async (_req, res) => {
    const [p, b] = await Promise.all([
      supabase.from('university_hbcu_partners').select('*').in('partnership_status', ['active','signed','developing']).order('institution_name'),
      supabase.from('university_black_excellence_programs').select('*').eq('active', true).order('name')
    ])
    if (p.error || b.error) return res.status(500).json({ error: p.error?.message || b.error?.message })
    res.json({
      partners: p.data || [],
      blackExcellencePrograms: b.data || [],
      cultureModel: 'Hebrew-centered houses, tribes, service fellowships, mentorship circles, academic societies, arts groups and community-service organizations. No Greek-letter/fraternity-sorority system.',
      designationNote: 'All American University is not represented as a federally designated HBCU; formal designation remains with eligible institutions.'
    })
  })

  router.get('/opportunities', requireUser, async (_req, res) => {
    const { data, error } = await supabase.from('university_opportunities').select('*, university_employers(*)').eq('active', true).order('starts_on', { ascending: true })
    if (error) return res.status(500).json({ error: error.message })
    res.json({ opportunities: data || [] })
  })

  router.post('/support', requireUser, async (req, res) => {
    const { data: student } = await supabase.from('university_students').select('id').eq('user_id', req.user.id).maybeSingle()
    if (!student) return res.status(400).json({ error: 'Create a student profile first' })
    const allowed = ['tutoring','academic-advising','career-advising','financial-aid-guidance','mentoring','accessibility-support','counseling-referral']
    if (!allowed.includes(req.body?.serviceType)) return res.status(400).json({ error: 'Invalid support service' })
    const { data, error } = await supabase.from('university_support_sessions').insert({
      student_id: student.id,
      service_type: req.body.serviceType,
      scheduled_at: req.body?.scheduledAt || null,
      notes: req.body?.notes || {},
    }).select('*').single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ session: data })
  })

  router.get('/labs', requireUser, async (_req, res) => {
    const [l, e] = await Promise.all([
      supabase.from('university_labs').select('*').eq('active', true).order('name'),
      supabase.from('university_equipment').select('*').order('name')
    ])
    if (l.error || e.error) return res.status(500).json({ error: l.error?.message || e.error?.message })
    res.json({ labs: l.data || [], equipment: e.data || [] })
  })

  router.get('/library', requireUser, async (req, res) => {
    let q = supabase.from('university_library_items').select('*').order('title')
    if (req.query.q) q = q.ilike('title', `%${String(req.query.q).slice(0,100)}%`)
    const { data, error } = await q.limit(100)
    if (error) return res.status(500).json({ error: error.message })
    res.json({ items: data || [] })
  })

  return router
}

module.exports = { createUniversityRouter }
