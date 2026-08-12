const express = require('express')

function createAIRouter() {
  const router = express.Router()
  const buckets = new Map()

  function rateLimit(req, res, next) {
    const key = req.ip || req.socket?.remoteAddress || 'unknown'
    const now = Date.now()
    const windowMs = 60_000
    const max = Number(process.env.AI_RATE_LIMIT_PER_MINUTE || 30)
    const bucket = buckets.get(key) || { start: now, count: 0 }
    if (now - bucket.start > windowMs) {
      bucket.start = now
      bucket.count = 0
    }
    bucket.count += 1
    buckets.set(key, bucket)
    if (bucket.count > max) return res.status(429).json({ error: 'AI rate limit reached. Try again shortly.' })
    next()
  }

  router.post('/answer', rateLimit, async (req, res) => {
    try {
      const { question, mode = 'hybrid', context = {} } = req.body || {}
      if (!question || typeof question !== 'string') return res.status(400).json({ error: 'question required' })
      if (question.length > 8000) return res.status(400).json({ error: 'question too long' })

      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        return res.json({
          answer: `Stubbs AI is online in local mode. I received: “${question.slice(0, 300)}”. Connect GEMINI_API_KEY on the backend to enable model-powered answers.`,
          provider: 'local-fallback',
          mode,
        })
      }

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const system = [
        'You are Stubbs AI, the orchestration intelligence for the AMM Omniverse.',
        'Holo C is the human-facing interface and Middleverse AI manages world context.',
        'Be concise, useful, age-appropriate, and clear about uncertainty.',
        'Never claim consciousness or self-awareness; describe self-modeling capabilities accurately.',
        'For consequential real-world business, financial, legal, employment, publishing, or safety actions, explain the next step and require explicit human confirmation before execution.',
        'Do not invent completed platform features; distinguish working, simulated, planned, and unavailable capabilities.',
      ].join(' ')

      const prompt = `${system}\n\nMode: ${mode}\nContext: ${JSON.stringify(context).slice(0, 4000)}\nUser: ${question}`
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 1200 },
        }),
      })
      const body = await response.json()
      if (!response.ok) {
        console.error('Gemini API error:', body)
        return res.status(502).json({ error: 'AI provider unavailable', providerStatus: response.status })
      }
      const answer = body?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim()
      if (!answer) return res.status(502).json({ error: 'AI provider returned no answer' })
      res.json({ answer, provider: 'gemini', model, mode })
    } catch (error) {
      console.error('AI answer error:', error)
      res.status(500).json({ error: 'Failed to generate answer' })
    }
  })

  return router
}

module.exports = { createAIRouter }
