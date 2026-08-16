const express = require('express')

function bearer(req) {
  const h = String(req.headers.authorization || '')
  return h.startsWith('Bearer ') ? h.slice(7) : null
}

const money = v => Math.max(0, Number(v || 0))

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
    const entityKey = 'tryamm'
    const cash = money(req.body?.cashAvailable)
    const currency = String(req.body?.currency || 'USD').toUpperCase().slice(0,3)
    const taxRate = Math.max(0, Math.min(1, Number(req.body?.estimatedTaxRate ?? 0.25)))

    const [bills, reserves, ledger] = await Promise.all([
      supabase.from('omni_bills').select('amount,currency,status,due_at').eq('entity_key',entityKey).in('status',['scheduled','approved','processing']),
      supabase.from('omni_reserve_buckets').select('bucket_key,target_type,target_value,current_amount,minimum_amount').eq('entity_key',entityKey).eq('active',true),
      supabase.from('omni_treasury_ledger').select('entry_type,debit,credit,gross_amount,currency,occurred_at').eq('entity_key',entityKey),
    ])
    if (bills.error || reserves.error || ledger.error) return res.status(500).json({ error:'Forecast inputs unavailable' })

    const compatibleBills = (bills.data || []).filter(b => String(b.currency || currency).toUpperCase() === currency)
    const compatibleLedger = (ledger.data || []).filter(e => String(e.currency || currency).toUpperCase() === currency)

    const billsDue = compatibleBills.reduce((s,b)=>s+money(b.amount),0)
    const sumDebit = types => compatibleLedger.filter(e=>types.includes(e.entry_type)).reduce((s,e)=>s+money(e.debit || e.gross_amount),0)
    const sumCredit = types => compatibleLedger.filter(e=>types.includes(e.entry_type)).reduce((s,e)=>s+money(e.credit || e.gross_amount),0)

    const recognizedRevenue = sumCredit(['revenue'])
    const explicitTaxes = sumDebit(['tax'])
    const explicitRefunds = sumDebit(['refund','chargeback'])
    const contractualPayables = sumDebit(['creator_payable','talent_payable','royalty_payable'])
    const providerFees = sumDebit(['provider_fee'])
    const productionAndLabor = sumDebit(['production_cost','payroll','contractor'])

    const estimatedTaxes = explicitTaxes > 0 ? explicitTaxes : recognizedRevenue * taxRate
    const reserveShortfall = (reserves.data||[]).reduce((s,r)=>s+Math.max(0,money(r.minimum_amount)-money(r.current_amount)),0)

    const obligations = estimatedTaxes + explicitRefunds + contractualPayables + providerFees + productionAndLabor + billsDue + reserveShortfall
    const safe = Math.max(0,cash-obligations)

    const sourceCoverage = {
      revenueLedger: recognizedRevenue > 0,
      taxes: explicitTaxes > 0 ? 'ledger' : (recognizedRevenue > 0 ? 'estimated-from-revenue' : 'missing'),
      refundsChargebacks: compatibleLedger.some(e=>['refund','chargeback'].includes(e.entry_type)) ? 'ledger' : 'none-recorded',
      contractualPayables: compatibleLedger.some(e=>['creator_payable','talent_payable','royalty_payable'].includes(e.entry_type)) ? 'ledger' : 'none-recorded',
      providerFees: compatibleLedger.some(e=>e.entry_type==='provider_fee') ? 'ledger' : 'none-recorded',
      operatingBills: compatibleBills.length > 0 ? 'bills-engine' : 'none-recorded',
      reserveBuckets: (reserves.data||[]).length > 0 ? 'reserve-engine' : 'missing',
    }

    const missingCritical = []
    if (!recognizedRevenue) missingCritical.push('recognized-revenue-ledger')
    if (!(reserves.data||[]).length) missingCritical.push('reserve-buckets')
    const confidence = missingCritical.length ? 'low' : (sourceCoverage.taxes === 'ledger' ? 'high' : 'medium')

    const payload = {
      entity_key:entityKey,
      currency,
      cash_available:cash,
      taxes_due:estimatedTaxes,
      refunds_chargebacks:explicitRefunds,
      contractual_payables:contractualPayables,
      bills_due:billsDue + providerFees + productionAndLabor,
      reserve_shortfall:reserveShortfall,
      safe_to_spend:safe,
      assumptions:{
        recognizedRevenue,
        providerFees,
        productionAndLabor,
        taxRateUsed: explicitTaxes > 0 ? null : taxRate,
        sourceCoverage,
        confidence,
        missingCritical,
        conservativeRule:'Safe-to-spend never includes cash already allocated to known obligations or reserve shortfalls.',
      }
    }
    const { data, error } = await supabase.from('omni_cash_forecasts').insert(payload).select().single()
    if (error) return res.status(500).json({ error:'Could not save forecast' })
    res.json(data)
  })

  return router
}

module.exports = { createTreasuryRouter }
