const express = require('express')

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

  router.post('/answer', requireUser, rateLimit, async (req, res) => {
    try {
      const { question, mode = 'hybrid', context = {} } = req.body || {}
      if (!question || typeof question !== 'string') return res.status(400).json({ error: 'question required' })
      if (question.length > 8000) return res.status(400).json({ error: 'question too long' })

      const { data: identity } = await supabase.from('holo_identity_profiles').select('age_lane').eq('user_id', req.user.id).maybeSingle()
      const ageLane = identity?.age_lane || 'unverified'
      const safeContext = {
        screen: typeof context.screen === 'string' ? context.screen.slice(0,100) : undefined,
        worldId: typeof context.worldId === 'string' ? context.worldId.slice(0,120) : undefined,
        projectId: typeof context.projectId === 'string' ? context.projectId.slice(0,120) : undefined,
      }

      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        return res.json({
          answer: `Stubbs AI is online in local mode. I received: “${question.slice(0,300)}”. Connect GEMINI_API_KEY on the backend to enable model-powered answers.`,
          provider: 'local-fallback', mode, ageLane,
        })
      }

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const system = [
        'You are Stubbs AI, the orchestration intelligence for the AMM Omniverse.',
        'Holo C is the human-facing interface and Middleverse AI manages world context.',
        `The platform-verified age lane for this user is: ${ageLane}.`,
        'Be concise, useful, age-appropriate, and clear about uncertainty.',
        'For child or teen lanes, do not bypass guardian, youth-safety, spending, communication, or age-access rules.',
        'Never claim consciousness or self-awareness; describe self-modeling capabilities accurately.',
        'For consequential real-world business, financial, legal, employment, publishing, medical, or safety actions, require the appropriate human/provider confirmation before execution.',
        'Do not invent completed platform features; distinguish working, simulated, planned, and unavailable capabilities.',
      ].join(' ')

      const prompt = `${system}\n\nMode: ${String(mode).slice(0,50)}\nContext: ${JSON.stringify(safeContext)}\nUser: ${question}`
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
      const response = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.5, maxOutputTokens: 1200 } }),
      })
      const body = await response.json()
      if (!response.ok) {
        console.error('Gemini API error status:', response.status)
        return res.status(502).json({ error: 'AI provider unavailable', providerStatus: response.status })
      }
      const answer = body?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim()
      if (!answer) return res.status(502).json({ error: 'AI provider returned no answer' })
      res.json({ answer, provider: 'gemini', model, mode, ageLane })
    } catch (error) {
      console.error('AI answer error:', error)
      res.status(500).json({ error: 'Failed to generate answer' })
    }
  })

  return router
}

module.exports = { createAIRouter }
