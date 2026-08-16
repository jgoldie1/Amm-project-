const express = require('express')

function createAccessibilityRouter({ supabase }) {
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
    } catch (_) {
      res.status(401).json({ error: 'Authentication failed' })
    }
  }

  const defaults = {
    preferredLanguage: 'en', captions: true, textScale: 'normal', highContrast: false,
    reducedMotion: false, oneHandMode: false, screenReaderOptimized: false,
    speechToText: false, textToSpeech: false, plainLanguage: false,
    voiceNavigation: false, switchNavigation: false, largeTargets: true,
    audioDescriptions: false, vibrationFeedback: true, remoteMode: 'standard'
  }

  router.get('/capabilities', (_req, res) => res.json({
    accessibility: {
      supportedNeeds: ['blind','low-vision','deaf','hard-of-hearing','speech-disabled','non-speaking','limited-mobility','one-hand','cognitive','learning','neurodivergent','older-adult','temporary-injury','low-literacy','low-bandwidth'],
      features: ['screen-reader-semantics','keyboard-navigation','switch-navigation','voice-navigation','large-touch-targets','high-contrast','scalable-text','reduced-motion','captions','transcripts','text-to-speech','speech-to-text','one-hand-mode','plain-language','audio-descriptions','sign-language-hub','adaptive-remote']
    },
    translation: {
      sourceLanguage: 'auto-detect',
      targetLanguageFormat: 'BCP-47 language tag',
      scope: ['interface','chat','captions','creator-posts','marketplace-listings','rideshare','delivery','live','podcasts','games','customer-support'],
      providerConfigured: Boolean(process.env.GEMINI_API_KEY),
      originalTextPreserved: true
    },
    omniRemote: {
      modes: ['standard','one-hand-left','one-hand-right','switch','voice','large-target'],
      inputs: ['touch','keyboard','bluetooth-gamepad','usb-gamepad','voice','switch','phone-second-screen'],
      targets: ['tryamm-web','omni-box','volcano','tv-receiver','gameverse','living-worlds','ott-player']
    }
  }))

  router.get('/profile', requireUser, async (req, res) => {
    const { data, error } = await supabase.from('world_profiles').select('accessibility').eq('user_id', req.user.id).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ profile: { ...defaults, ...(data?.accessibility || {}) } })
  })

  router.put('/profile', requireUser, async (req, res) => {
    const input = req.body || {}
    const profile = {
      ...defaults,
      preferredLanguage: String(input.preferredLanguage || 'en').slice(0, 35),
      captions: input.captions !== false,
      textScale: ['normal','large','extra-large'].includes(input.textScale) ? input.textScale : 'normal',
      highContrast: input.highContrast === true,
      reducedMotion: input.reducedMotion === true,
      oneHandMode: input.oneHandMode === true,
      screenReaderOptimized: input.screenReaderOptimized === true,
      speechToText: input.speechToText === true,
      textToSpeech: input.textToSpeech === true,
      plainLanguage: input.plainLanguage === true,
      voiceNavigation: input.voiceNavigation === true,
      switchNavigation: input.switchNavigation === true,
      largeTargets: input.largeTargets !== false,
      audioDescriptions: input.audioDescriptions === true,
      vibrationFeedback: input.vibrationFeedback !== false,
      remoteMode: ['standard','one-hand-left','one-hand-right','switch','voice','large-target'].includes(input.remoteMode) ? input.remoteMode : 'standard'
    }
    const { data, error } = await supabase.from('world_profiles').upsert({ user_id: req.user.id, accessibility: profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' }).select('accessibility').single()
    if (error) return res.status(500).json({ error: error.message })
    res.json({ profile: data.accessibility })
  })

  router.post('/translate', requireUser, async (req, res) => {
    try {
      const text = String(req.body?.text || '').trim().slice(0, 6000)
      const sourceLanguage = String(req.body?.sourceLanguage || 'auto').slice(0, 35)
      const targetLanguage = String(req.body?.targetLanguage || '').slice(0, 35)
      const criticality = ['normal','financial','legal','medical','safety'].includes(req.body?.criticality) ? req.body.criticality : 'normal'
      if (!text || !targetLanguage) return res.status(400).json({ error: 'text and targetLanguage are required' })
      if (criticality !== 'normal') return res.json({ originalText: text, translatedText: null, sourceLanguage, targetLanguage, criticality, humanReviewRequired: true, warning: 'Safety-critical, legal, medical and financial translations require qualified human review before action.' })
      if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'Translation provider is not configured', originalText: text })

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const prompt = `Translate the following text faithfully from ${sourceLanguage === 'auto' ? 'the detected source language' : sourceLanguage} into ${targetLanguage}. Preserve names, numbers, URLs, formatting intent, and tone. Return only the translated text.\n\n${text}`
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 1800 } }) })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) return res.status(502).json({ error: 'Translation provider unavailable', originalText: text })
      const translatedText = body?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim()
      if (!translatedText) return res.status(502).json({ error: 'Translation provider returned no translation', originalText: text })
      res.json({ originalText: text, translatedText, sourceLanguage, targetLanguage, criticality, humanReviewRequired: false, provider: 'gemini' })
    } catch (error) {
      res.status(500).json({ error: 'Translation failed' })
    }
  })

  return router
}

module.exports = { createAccessibilityRouter }
