const express = require('express')

function createCommerceRouter({ supabase }) {
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
    } catch (_error) { return res.status(401).json({ error: 'Authentication failed' }) }
  }

  router.get('/orders', requireUser, async (req, res) => {
    try {
      const limit = Math.max(1, Math.min(100, Number(req.query.limit || 50)))
      const { data, error } = await supabase.from('commerce_orders')
        .select('id,order_type,status,currency,gross_amount,platform_amount,creator_amount,refunded_amount,creator_reversed_amount,dispute_amount,metadata,provider_session_id,created_at,updated_at')
        .eq('user_id', req.user.id).order('created_at', { ascending: false }).limit(limit)
      if (error) throw error
      res.json({ orders: data || [] })
    } catch (err) { res.status(500).json({ error: err.message || 'Could not load order history' }) }
  })

  router.get('/creator/earnings', requireUser, async (req, res) => {
    try {
      const { data, error } = await supabase.from('commerce_orders')
        .select('id,status,currency,gross_amount,creator_amount,creator_reversed_amount,refunded_amount,dispute_amount,metadata,created_at')
        .eq('creator_user_id', req.user.id).order('created_at', { ascending: false }).limit(500)
      if (error) throw error
      const rows = data || []
      const byCurrency = {}
      for (const row of rows) {
        const currency = String(row.currency || 'USD').toUpperCase()
        const earned = Number(row.creator_amount || 0)
        const reversed = Number(row.creator_reversed_amount || 0)
        byCurrency[currency] = Number(byCurrency[currency] || 0) + Math.max(0, earned - reversed)
      }
      res.json({
        creatorUserId: req.user.id,
        totals: Object.fromEntries(Object.entries(byCurrency).map(([k,v]) => [k, Number(Number(v).toFixed(2))])),
        recent: rows.slice(0, 100).map(row => ({...row, net_creator_amount: Math.max(0, Number(row.creator_amount||0)-Number(row.creator_reversed_amount||0))})),
        note: 'Net accounting view after recorded reversals. Payout availability depends on connected provider and payout-status records.'
      })
    } catch (err) { res.status(500).json({ error: err.message || 'Could not load creator earnings' }) }
  })

  router.get('/receipt/:orderId', requireUser, async (req, res) => {
    try {
      const { data, error } = await supabase.from('commerce_orders').select('*').eq('id', req.params.orderId).eq('user_id', req.user.id).maybeSingle()
      if (error) throw error
      if (!data) return res.status(404).json({ error: 'Order not found' })
      res.json({ receipt: data })
    } catch (err) { res.status(500).json({ error: err.message || 'Could not load receipt' }) }
  })

  return router
}

module.exports = { createCommerceRouter }
