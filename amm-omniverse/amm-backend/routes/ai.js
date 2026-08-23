const express = require('express')
const { answerWithTriBrain } = require('../lib/stubbs-tri-brain')

function createAIRouter({ supabase }) {
  const router = express.Router()
  const buckets = new Map()

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

  function rateLimit(req, res, next) {
    const key = `${req.user?.id || 'anon'}:${req.ip || req.socket?.remoteAddress || 'unknown'}`
    const now = Date.now()
    const windowMs = 60_000
    const max = Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 30)
    const bucket = buckets.get(key) || { start: now, count: 0 }
    if (now - bucket.start > windowMs) { bucket.start = now; bucket.count = 0 }
    bucket.count += 1
    buckets.set(key, bucket)
    if (bucket.count > max) return res.status(429).json({ error: 'AI rate limit reached. Try again shortly.' })
    next()
  }

  router.get('/health', requireUser, async (req, res) => {
    const { data: identity } = await supabase.from('holo_identity_profiles').select('age_lane').eq('user_id', req.user.id).maybeSingle()
    res.json({
      ok: true,
      service: 'Stubbs AI Tri-Brain Runtime',
      ageLane: identity?.age_lane || 'unverified',
      providers: { gemini: Boolean(process.env.GEMINI_API_KEY), openai: Boolean(process.env.OPENAI_API_KEY) },
      memory: true,
      audit: true,
      verification: 'executive -> independent critic -> Spider Sense -> Guardian decision',
      trueAgiQualified: false,
      label: 'General Intelligence Runtime / AGI candidate',
    })
  })

  router.post('/answer', requireUser, rateLimit, async (req, res) => {
    try {
      const { question, mode = 'hybrid', context = {} } = req.body || {}
      if (!question || typeof question !== 'string') return res.status(400).json({ error: 'question required' })
      if (question.length > 8000) return res.status(400).json({ error: 'question too long' })

      const { data: identity } = await supabase.from('holo_identity_profiles').select('age_lane').eq('user_id', req.user.id).maybeSingle()
      const ageLane = identity?.age_lane || 'unverified'
      const safeContext = {
        screen: typeof context.screen === 'string' ? context.screen.slice(0, 100) : undefined,
        worldId: typeof context.worldId === 'string' ? context.worldId.slice(0, 120) : undefined,
        projectId: typeof context.projectId === 'string' ? context.projectId.slice(0, 120) : undefined,
        timeSensitive: context.timeSensitive === true,
        highImpact: context.highImpact === true,
        irreversible: context.irreversible === true,
      }

      const result = await answerWithTriBrain({
        supabase,
        userId: req.user.id,
        question,
        ageLane,
        mode: String(mode).slice(0, 50),
        context: safeContext,
      })

      if (result.reason === 'AI_PROVIDERS_NOT_CONFIGURED') {
        return res.status(503).json({ error: 'Stubbs AI model providers are not configured', ...result, ageLane, mode })
      }

      const provider = result.providers?.executive || 'unavailable'
      res.status(result.status === 'BLOCKED' ? 403 : 200).json({
        ...result,
        provider,
        model: provider === 'gemini' ? (process.env.GEMINI_MODEL || 'gemini-2.5-flash') : (process.env.OPENAI_STUBBS_CRITIC_MODEL || 'gpt-5.6-sol'),
        mode,
        ageLane,
      })
    } catch (error) {
      console.error('AI answer error:', error)
      res.status(500).json({ error: 'Failed to generate verified Stubbs AI answer' })
    }
  })

  return router
}

module.exports = { createAIRouter }
