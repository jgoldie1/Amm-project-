require('dotenv').config()
const express = require('express')
const cors = require('cors')
const signLanguage = require('./signLanguageService')

const app = express()
const PORT = process.env.SIGN_LANGUAGE_PORT || 4100
const allowedOrigins = [
  'https://tryamm.online',
  'https://www.tryamm.online',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean)

app.disable('x-powered-by')
app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '1mb' }))
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Cache-Control', 'no-store')
  next()
})

const buckets = new Map()
app.use('/api/accessibility/sign', (req, res, next) => {
  const key = req.ip || 'unknown'
  const now = Date.now()
  const entry = buckets.get(key) || { start: now, count: 0 }
  if (now - entry.start > 60_000) {
    entry.start = now
    entry.count = 0
  }
  entry.count += 1
  buckets.set(key, entry)
  if (entry.count > 120) return res.status(429).json({ error: 'Too many sign-language requests. Try again shortly.' })
  next()
})

app.get('/health', (_req, res) => res.json({ ok: true, service: 'tryamm-sign-language', ts: Date.now() }))
app.get('/api/accessibility/sign/capabilities', (_req, res) => res.json(signLanguage.capabilities()))

app.post('/api/accessibility/sign/translate', async (req, res) => {
  try {
    const result = await signLanguage.translate(req.body || {})
    res.json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Sign translation failed' })
  }
})

app.post('/api/accessibility/sign/recognize', async (req, res) => {
  try {
    const result = await signLanguage.recognize(req.body || {})
    res.json(result)
  } catch (error) {
    res.status(error.statusCode || 500).json({ error: error.message || 'Sign recognition failed' })
  }
})

app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large' })
  res.status(500).json({ error: 'Unexpected sign-language service error' })
})

app.listen(PORT, () => {
  const caps = signLanguage.capabilities()
  console.log(`✅ TryAMM Sign Language service running on port ${PORT}`)
  console.log(`   Provider: ${caps.providerConfigured ? 'configured' : 'local fallback only'}`)
  console.log('   GET  /api/accessibility/sign/capabilities')
  console.log('   POST /api/accessibility/sign/translate')
  console.log('   POST /api/accessibility/sign/recognize')
})
