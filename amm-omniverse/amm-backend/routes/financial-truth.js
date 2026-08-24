'use strict'

const express = require('express')
const { recordReconciliation, createCapitalAllocation } = require('../lib/financial-truth')

function bearer(req) {
  const header = String(req.headers.authorization || '')
  return header.startsWith('Bearer ') ? header.slice(7) : null
}

function hasFinanceRole(user) {
  const role = String(user?.app_metadata?.role || user?.user_metadata?.role || '').toLowerCase()
  return ['owner','admin','finance'].includes(role)
}

function createFinancialTruthRouter({ supabase }) {
  const router = express.Router()

  router.get('/health', async (_req, res) => {
    const checks = {}
    for (const table of ['finance_reconciliation_events','finance_capital_allocations','finance_treasury_snapshots']) {
      const { error } = await supabase.from(table).select('id', { head:true, count:'exact' }).limit(1)
      checks[table] = !error
    }
    res.json({ ok:Object.values(checks).every(Boolean), checks, mode:'server-authoritative', publicBalances:false })
  })

  async function requireFinanceOperator(req, res, next) {
    const token = bearer(req)
    if (!token) return res.status(401).json({ error:'Authentication required' })
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error:'Invalid session' })
    if (!hasFinanceRole(data.user)) return res.status(403).json({ error:'Finance operator role required' })
    req.user = data.user
    next()
  }

  router.use(requireFinanceOperator)

  router.get('/reconciliation', async (req, res) => {
    const status = req.query.status ? String(req.query.status) : null
    let query = supabase.from('finance_reconciliation_events')
      .select('id,canonical_event_id,provider,provider_event_id,currency,gross_minor,fee_minor,refund_minor,net_settlement_minor,expected_settlement_minor,variance_minor,status,provider_settled_at,reconciled_at,created_at')
      .order('created_at', { ascending:false })
      .limit(100)
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) return res.status(500).json({ error:'Reconciliation data unavailable' })
    res.json({ events:data || [] })
  })

  router.post('/reconciliation', async (req, res) => {
    try {
      const event = await recordReconciliation({ supabase, event:req.body || {} })
      res.status(201).json({ event })
    } catch (error) {
      res.status(400).json({ error:error.message || 'Could not reconcile event' })
    }
  })

  router.post('/capital-allocation', async (req, res) => {
    try {
      const allocationEventId = String(req.body?.allocationEventId || '').trim()
      const input = req.body?.input || {}
      const allocation = await createCapitalAllocation({ supabase, allocationEventId, input, requestedBy:req.user.id })
      res.status(201).json({
        allocation,
        execution:'Proposal only. No funds are moved and 12D capital cannot bypass protected liabilities/reserves.'
      })
    } catch (error) {
      res.status(400).json({ error:error.message || 'Could not create capital allocation' })
    }
  })

  router.get('/treasury/latest', async (req, res) => {
    const currency = String(req.query.currency || 'USD').toUpperCase().slice(0,3)
    const { data, error } = await supabase.from('finance_treasury_snapshots')
      .select('*').eq('currency',currency).order('created_at',{ascending:false}).limit(1).maybeSingle()
    if (error) return res.status(500).json({ error:'Treasury snapshot unavailable' })
    res.json({ snapshot:data || null })
  })

  return router
}

module.exports = { createFinancialTruthRouter, hasFinanceRole }
