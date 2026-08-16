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

  async function retrieveOmniNet(question, count=6) {
    try {
      const { data, error } = await supabase.rpc('omninet_search', { q: question, max_results: count })
      if (error) return []
      return (data || []).map((x, i) => ({ id:`omninet-${i}`, title:x.title, url:x.url || null, snippet:x.summary || '', source:'omninet', publishedAt:x.published_at || null }))
    } catch (_) { return [] }
  }

  async function retrievePublicWeb(question, count=6) {
    const key = process.env.BRAVE_SEARCH_API_KEY
    if (!key) return []
    try {
      const params = new URLSearchParams({ q: question.slice(0,400), count:String(Math.max(1,Math.min(count,10))), country:'US', search_lang:'en' })
      const response = await fetch(`https://api.search.brave.com/res/v1/web/search?${params}`, { headers:{ Accept:'application/json', 'X-Subscription-Token':key } })
      if (!response.ok) return []
      const body = await response.json()
      return (body.web?.results || []).map((x, i) => ({ id:`web-${i}`, title:x.title || 'Untitled', url:x.url || null, snippet:x.description || '', source:'public-web', publishedAt:x.page_age || null }))
    } catch (_) { return [] }
  }

  function evidenceText(sources) {
    return sources.map((s,i)=>`[${i+1}] ${s.title}\nSource: ${s.source}${s.url?` | ${s.url}`:''}\n${String(s.snippet||'').slice(0,900)}`).join('\n\n')
  }

  router.post('/answer', requireUser, rateLimit, async (req, res) => {
    try {
      const { question, mode = 'hybrid', context = {}, retrieval = 'hybrid' } = req.body || {}
      if (!question || typeof question !== 'string') return res.status(400).json({ error: 'question required' })
      if (question.length > 8000) return res.status(400).json({ error: 'question too long' })

      const { data: identity } = await supabase.from('holo_identity_profiles').select('age_lane').eq('user_id', req.user.id).maybeSingle()
      const ageLane = identity?.age_lane || 'unverified'
      const safeContext = {
        screen: typeof context.screen === 'string' ? context.screen.slice(0,100) : undefined,
        worldId: typeof context.worldId === 'string' ? context.worldId.slice(0,120) : undefined,
        projectId: typeof context.projectId === 'string' ? context.projectId.slice(0,120) : undefined,
      }

      let sources=[]
      if (retrieval !== 'none') {
        const [own, web] = await Promise.all([
          ['omninet','hybrid'].includes(retrieval) ? retrieveOmniNet(question,6) : Promise.resolve([]),
          ['web','hybrid'].includes(retrieval) ? retrievePublicWeb(question,6) : Promise.resolve([]),
        ])
        const seen=new Set()
        sources=[...own,...web].filter(s=>{const k=(s.url||`${s.source}:${s.title}`).toLowerCase();if(seen.has(k))return false;seen.add(k);return true}).slice(0,10)
      }

      const apiKey = process.env.GEMINI_API_KEY
      if (!apiKey) {
        return res.json({
          answer: sources.length
            ? `Stubbs AI model generation is in local fallback mode, but OmniNet retrieval returned ${sources.length} source${sources.length===1?'':'s'}. Review the source results directly.`
            : `Stubbs AI is online in local mode. I received: “${question.slice(0,300)}”. Connect GEMINI_API_KEY for model-powered synthesis and BRAVE_SEARCH_API_KEY for public-web retrieval.`,
          provider: 'local-fallback', mode, retrieval, ageLane, sources,
        })
      }

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const system = [
        'You are Stubbs AI, the orchestration intelligence for the AMM Omniverse.',
        'OmniNet is the retrieval layer. Holo Search exposes raw sources directly to users. Holo C is the human-facing interface and Middleverse AI manages world context.',
        `The platform-verified age lane for this user is: ${ageLane}.`,
        'Prefer retrieved evidence over model memory when evidence is present.',
        'Do not hide disagreement between sources. Separate verified facts, source claims, and your synthesis.',
        'Never invent a source, URL, quote, completion status, or current fact.',
        'Always preserve user choice: source results remain useful even if your synthesis is ignored.',
        'Be concise, useful, age-appropriate, and clear about uncertainty.',
        'For child or teen lanes, do not bypass guardian, youth-safety, spending, communication, or age-access rules.',
        'Never claim consciousness or self-awareness; describe self-modeling capabilities accurately.',
        'For consequential real-world business, financial, legal, employment, publishing, medical, or safety actions, require the appropriate human/provider confirmation before execution.',
        'Do not invent completed platform features; distinguish working, simulated, planned, and unavailable capabilities.',
      ].join(' ')

      const evidence = sources.length ? `\n\nRetrieved evidence:\n${evidenceText(sources)}` : '\n\nNo retrieval evidence was available for this request.'
      const prompt = `${system}\n\nMode: ${String(mode).slice(0,50)}\nRetrieval: ${String(retrieval).slice(0,30)}\nContext: ${JSON.stringify(safeContext)}${evidence}\n\nUser: ${question}`
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`
      const response = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 1600 } }),
      })
      const body = await response.json()
      if (!response.ok) {
        console.error('Gemini API error status:', response.status)
        return res.status(502).json({ error: 'AI provider unavailable', providerStatus: response.status, sources })
      }
      const answer = body?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim()
      if (!answer) return res.status(502).json({ error: 'AI provider returned no answer', sources })
      res.json({ answer, provider: 'gemini', model, mode, retrieval, ageLane, sources, sourceChoice:true })
    } catch (error) {
      console.error('AI answer error:', error)
      res.status(500).json({ error: 'Failed to generate answer' })
    }
  })

  return router
}

module.exports = { createAIRouter }
