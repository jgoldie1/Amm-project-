const express = require('express')

function bearer(req) {
  const h = String(req.headers.authorization || '')
  return h.startsWith('Bearer ') ? h.slice(7) : null
}

function createTreasuryRouter({ supabase }) {
  const router = express.Router()

  async function requireUser(req, res, next) {
    const token = bearer(req)
    if (!token) return res.status(401).json({ error: 'Authentication required' })
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return res.status(401).json({ error: 'Invalid session' })
    req.user = data.user
    next()
  }

  router.use(requireUser)

  // Read-only treasury snapshot. Financial execution remains provider/human-authorized.
  router.get('/summary', async (req, res) => {
    const entityKey = String(req.query.entity || 'tryamm')
    const now = new Date().toISOString()
    const horizon = new Date(Date.now() + 30 * 86400000).toISOString()
    const [bills, reserves, forecast] = await Promise.all([
      supabase.from('omni_bills').select('id,vendor_name,category,amount,currency,due_at,priority,status,legal_or_contractual').eq('entity_key', entityKey).in('status',['scheduled','approved','processing']).gte('due_at',now).lte('due_at',horizon).order('due_at'),
      supabase.from('omni_reserve_buckets').select('bucket_key,name,currency,target_type,target_value,current_amount,minimum_amount,protected').eq('entity_key',entityKey).eq('active',true),
      supabase.from('omni_cash_forecasts').select('*').eq('entity_key',entityKey).order('as_of',{ascending:false}).limit(1).maybeSingle(),
    ])
    if (bills.error || reserves.error || forecast.error) return res.status(500).json({ error: 'Treasury data unavailable' })
    res.json({ bills: bills.data || [], reserves: reserves.data || [], forecast: forecast.data || null })
  })

  router.post('/bills', async (req, res) => {
    const { vendorName, category, description='', amount, currency='USD', dueAt, priority=50, legalOrContractual=false, recurringRule=null } = req.body || {}
    if (!vendorName || !category || !dueAt || !Number.isFinite(Number(amount)) || Number(amount) < 0) return res.status(400).json({ error: 'Valid vendor, category, amount and due date are required' })
    const { data, error } = await supabase.from('omni_bills').insert({
      entity_key:'tryamm', vendor_name:String(vendorName).slice(0,160), category:String(category).slice(0,80), description:String(description).slice(0,1000),
      amount:Number(amount), currency:String(currency).toUpperCase().slice(0,3), due_at:dueAt, priority:Math.max(0,Math.min(100,Number(priority)||50)),
      legal_or_contractual:Boolean(legalOrContractual), recurring_rule:recurringRule, status:'scheduled', metadata:{ createdBy:req.user.id }
    }).select().single()
    if (error) return res.status(500).json({ error:'Could not create bill' })
    res.status(201).json(data)
  })

  router.post('/bills/:id/request-approval', async (req, res) => {
    const { data: bill, error } = await supabase.from('omni_bills').select('*').eq('id',req.params.id).eq('entity_key','tryamm').maybeSingle()
    if (error || !bill) return res.status(404).json({ error:'Bill not found' })
    const { data, error: insertError } = await supabase.from('omni_payment_approvals').insert({
      entity_key:'tryamm', bill_id:bill.id, requested_by:req.user.id, amount:bill.amount, currency:bill.currency,
      expires_at:new Date(Date.now()+48*3600000).toISOString(), status:'pending'
    }).select().single()
    if (insertError) return res.status(500).json({ error:'Could not request approval' })
    res.status(201).json({ ...data, execution:'Requires authorized human/provider approval; no payment was sent.' })
  })

  router.post('/forecast', async (req, res) => {
    const cash = Math.max(0,Number(req.body?.cashAvailable)||0)
    const [bills, reserves] = await Promise.all([
      supabase.from('omni_bills').select('amount').eq('entity_key','tryamm').in('status',['scheduled','approved','processing']),
      supabase.from('omni_reserve_buckets').select('target_type,target_value,current_amount,minimum_amount').eq('entity_key','tryamm').eq('active',true),
    ])
    if (bills.error || reserves.error) return res.status(500).json({ error:'Forecast inputs unavailable' })
    const billsDue = (bills.data||[]).reduce((s,b)=>s+Number(b.amount||0),0)
    const reserveFloor = (reserves.data||[]).reduce((s,r)=>s+Math.max(Number(r.minimum_amount||0),0),0)
    const reserveShortfall = (reserves.data||[]).reduce((s,r)=>s+Math.max(0,Number(r.minimum_amount||0)-Number(r.current_amount||0)),0)
    const safe = Math.max(0,cash-billsDue-reserveShortfall)
    const payload = { entity_key:'tryamm', cash_available:cash, bills_due:billsDue, reserve_shortfall:reserveShortfall, safe_to_spend:safe, assumptions:{ reserveFloor, note:'Taxes, refunds and contractual payables must be supplied by accounting integrations before production use.' } }
    const { data, error } = await supabase.from('omni_cash_forecasts').insert(payload).select().single()
    if (error) return res.status(500).json({ error:'Could not save forecast' })
    res.json(data)
  })

  return router
}

module.exports = { createTreasuryRouter }
