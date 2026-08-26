'use strict'

const express = require('express')
const crypto = require('crypto')
const { createCTVProvider } = require('../lib/ctv/providers')

function createCTVRouter() {
  const router = express.Router()
  const vibe = createCTVProvider('vibe')

  router.get('/capabilities', (_req, res) => {
    res.json({ providers: [vibe.capabilities()] })
  })

  router.get('/vibe/connect', (req, res) => {
    try {
      const state = crypto.randomBytes(24).toString('hex')
      const authorizationUrl = vibe.getAuthorizationUrl({ state, scope: req.query.scope })
      res.setHeader('Cache-Control', 'no-store')
      res.json({ provider: 'vibe', authorizationUrl, state, note: 'Persist and validate state in the authenticated user session before production use.' })
    } catch (error) {
      res.status(503).json({ error: error.message })
    }
  })

  router.post('/vibe/token', async (req, res) => {
    try {
      const result = await vibe.exchangeAuthorizationCode({ code: req.body?.code })
      res.setHeader('Cache-Control', 'no-store')
      res.json(result)
    } catch (error) {
      res.status(502).json({ error: error.message })
    }
  })

  return router
}

module.exports = { createCTVRouter }
