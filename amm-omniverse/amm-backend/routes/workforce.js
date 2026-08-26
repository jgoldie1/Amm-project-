const express = require('express')
const crypto = require('crypto')
const { answerWithTriBrain } = require('../lib/stubbs-tri-brain')

function createWorkforceRouter({ supabase }) {
  const router = express.Router()
  const githubRepo = process.env.GITHUB_WORKSTATION_REPO || 'jgoldie1/Amm-project-'
  const githubBranch = process.env.GITHUB_WORKSTATION_BRANCH || 'main'
  const repoCache = new Map()

  async function requireUser(req, res, next) {
    try {
      const auth = req.headers.authorization || ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
      if (!token) return res.status(401).json({ error: 'Authentication required' })
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data?.user) return res.status(401).json({ error: 'Invalid session' })
      req.user = data.user
      next()
    } catch (_) { return res.status(401).json({ error: 'Authentication failed' }) }
  }

  function contactHash(value) {
    const normalized = String(value || '').trim().toLowerCase().replace(/[^a-z0-9+@.]/g, '')
    if (!normalized) return null
    const pepper = process.env.CONTACT_CENTER_DNC_PEPPER || 'tryamm-contact-center-v1'
    return crypto.createHash('sha256').update(`${pepper}:${normalized}`).digest('hex')
  }

  async function githubJson(path) {
    const key = `${path}`
    const cached = repoCache.get(key)
    if (cached && Date.now() - cached.at < 60000) return cached.data
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'TRYAMM-Workstation/1.0' }
    if (process.env.GITHUB_WORKSTATION_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_WORKSTATION_TOKEN}`
    const response = await fetch(`https://api.github.com/repos/${githubRepo}${path}`, { headers })
    if (!response.ok) throw new Error(`GitHub request failed (${response.status})`)
    const data = await response.json()
    repoCache.set(key, { at: Date.now(), data })
    return data
  }

  async function githubTextFile(filePath) {
    const safe = String(filePath || '').replace(/^\/+/, '')
    if (!safe || safe.includes('..') || safe.length > 500) throw new Error('Invalid file path')
    const data = await githubJson(`/contents/${safe}?ref=${encodeURIComponent(githubBranch)}`)
    if (data.type !== 'file') throw new Error('Path is not a file')
    if (Number(data.size || 0) > 250000) throw new Error('File too large for workstation review')
    if (data.encoding !== 'base64') throw new Error('Unsupported GitHub file encoding')
    return { path: safe, sha: data.sha, size: data.size, content: Buffer.from(data.content, 'base64').toString('utf8') }
  }

  router.get('/status', requireUser, async (_req, res) => {
    res.json({
      ok: true,
      service: 'TRYAMM Workforce + AI Contact Center',
      capabilities: ['wfh-agent-workspace','approved-scripts','rebuttals','do-not-contact','interaction-log','escalation','qa','repo-workstation','stubbs-ai-code-review'],
      compliance: { consentRequired: true, doNotContactHonored: true, disclosuresRequired: true, highRiskClaimsBlocked: true },
      repo: { repository: githubRepo, branch: githubBranch, tokenExposedToBrowser: false },
    })
  })

  router.get('/scripts', requireUser, async (req, res) => {
    try {
      const campaignKey = String(req.query.campaign || '').slice(0, 120)
      let q = supabase.from('contact_center_scripts').select('id,name,campaign_key,channel,objective,opening,discovery,value_points,closing,required_disclosures,prohibited_claims,status,version').eq('status','approved').order('name')
      if (campaignKey) q = q.eq('campaign_key', campaignKey)
      const { data, error } = await q.limit(50)
      if (error) throw error
      const scripts = data || []
      const ids = scripts.map(s => s.id)
      let rebuttals = []
      if (ids.length) {
        const r = await supabase.from('contact_center_rebuttals').select('id,script_id,trigger_key,customer_phrase,approved_response,follow_up_question,escalation_required,risk_level').in('script_id', ids).order('trigger_key')
        if (r.error) throw r.error
        rebuttals = r.data || []
      }
      res.json({ scripts, rebuttals })
    } catch (error) { res.status(500).json({ error: error.message || 'Could not load scripts' }) }
  })

  router.post('/sessions/start', requireUser, async (req, res) => {
    try {
      const campaignKey = String(req.body?.campaignKey || '').slice(0, 120) || null
      const { data, error } = await supabase.from('contact_center_agent_sessions').insert({ agent_user_id:req.user.id, campaign_key:campaignKey, status:'available' }).select('*').single()
      if (error) throw error
      res.status(201).json({ session:data })
    } catch (error) { res.status(500).json({ error:error.message || 'Could not start shift' }) }
  })

  router.post('/sessions/:id/status', requireUser, async (req, res) => {
    try {
      const allowed = ['available','on_contact','wrap_up','break','training','offline']
      const status = String(req.body?.status || '')
      if (!allowed.includes(status)) return res.status(400).json({ error:'Invalid status' })
      const patch = { status }
      if (status === 'offline') patch.ended_at = new Date().toISOString()
      const { data, error } = await supabase.from('contact_center_agent_sessions').update(patch).eq('id',req.params.id).eq('agent_user_id',req.user.id).select('*').maybeSingle()
      if (error) throw error
      if (!data) return res.status(404).json({ error:'Session not found' })
      res.json({ session:data })
    } catch (error) { res.status(500).json({ error:error.message || 'Could not update shift' }) }
  })

  router.post('/suppression/check', requireUser, async (req, res) => {
    try {
      const hash = contactHash(req.body?.contact)
      if (!hash) return res.status(400).json({ error:'contact required' })
      const { data, error } = await supabase.from('contact_center_suppression').select('id,reason,source,created_at').eq('contact_hash',hash).maybeSingle()
      if (error) throw error
      res.json({ suppressed:Boolean(data), record:data || null })
    } catch (error) { res.status(500).json({ error:error.message || 'Suppression check failed' }) }
  })

  router.post('/suppression', requireUser, async (req, res) => {
    try {
      const hash = contactHash(req.body?.contact)
      if (!hash) return res.status(400).json({ error:'contact required' })
      const reason = String(req.body?.reason || 'do-not-contact').slice(0,200)
      const { data, error } = await supabase.from('contact_center_suppression').upsert({ contact_hash:hash, reason, source:'customer-request' },{onConflict:'contact_hash'}).select('id,reason,source,created_at').single()
      if (error) throw error
      res.status(201).json({ suppressed:true, record:data })
    } catch (error) { res.status(500).json({ error:error.message || 'Could not suppress contact' }) }
  })

  router.post('/interactions', requireUser, async (req, res) => {
    try {
      const { sessionId, campaignKey, channel='voice', contact, consentBasis, scriptId, summary, sentiment, objections=[], disclosuresGiven=[], metadata={} } = req.body || {}
      const allowedChannels = ['voice','sms','email','chat','social']
      if (!allowedChannels.includes(channel)) return res.status(400).json({ error:'Invalid channel' })
      const hash = contactHash(contact)
      if (!hash) return res.status(400).json({ error:'contact required' })
      const suppression = await supabase.from('contact_center_suppression').select('id').eq('contact_hash',hash).maybeSingle()
      if (suppression.error) throw suppression.error
      if (suppression.data) return res.status(409).json({ error:'Contact is on the do-not-contact suppression list', suppressed:true })
      if (!consentBasis && ['voice','sms'].includes(channel)) return res.status(400).json({ error:'consentBasis is required for voice/SMS interactions' })
      const { data, error } = await supabase.from('contact_center_interactions').insert({
        agent_user_id:req.user.id, session_id:sessionId || null, campaign_key:String(campaignKey || '').slice(0,120) || null,
        channel, contact_ref:hash, consent_basis:String(consentBasis || '').slice(0,300) || null, script_id:scriptId || null,
        summary:String(summary || '').slice(0,4000) || null, sentiment:String(sentiment || '').slice(0,80) || null,
        objections:Array.isArray(objections)?objections.slice(0,30):[], disclosures_given:Array.isArray(disclosuresGiven)?disclosuresGiven.slice(0,30):[],
        metadata:metadata && typeof metadata === 'object' ? metadata : {}
      }).select('*').single()
      if (error) throw error
      res.status(201).json({ interaction:data })
    } catch (error) { res.status(500).json({ error:error.message || 'Could not log interaction' }) }
  })

  router.post('/interactions/:id/escalate', requireUser, async (req, res) => {
    try {
      const allowedTypes = ['supervisor','compliance','safety','billing','technical','sales_closer','legal','accessibility','other']
      const type = String(req.body?.type || 'supervisor')
      const priority = ['normal','urgent','critical'].includes(req.body?.priority) ? req.body.priority : 'normal'
      const reason = String(req.body?.reason || '').trim().slice(0,4000)
      if (!allowedTypes.includes(type) || !reason) return res.status(400).json({ error:'Valid type and reason required' })
      const interaction = await supabase.from('contact_center_interactions').select('id').eq('id',req.params.id).eq('agent_user_id',req.user.id).maybeSingle()
      if (interaction.error) throw interaction.error
      if (!interaction.data) return res.status(404).json({ error:'Interaction not found' })
      const { data, error } = await supabase.from('contact_center_escalations').insert({ interaction_id:req.params.id, created_by_user_id:req.user.id, escalation_type:type, priority, reason, status:'open' }).select('*').single()
      if (error) throw error
      res.status(201).json({ escalation:data })
    } catch (error) { res.status(500).json({ error:error.message || 'Escalation failed' }) }
  })

  router.get('/workstation/repo', requireUser, async (_req, res) => {
    try {
      const branch = await githubJson(`/branches/${encodeURIComponent(githubBranch)}`)
      const treeSha = branch?.commit?.commit?.tree?.sha
      const tree = treeSha ? await githubJson(`/git/trees/${treeSha}?recursive=1`) : null
      const files = Array.isArray(tree?.tree) ? tree.tree.filter(x=>x.type==='blob').map(x=>({path:x.path,size:x.size,sha:x.sha})).slice(0,2000) : []
      const risky = files.filter(f => /(^|\/)(uploads\/|.*\.(exe|dll|scr|bat|cmd|ps1|sh)$)/i.test(f.path) || (Number(f.size||0)>10_000_000))
      res.json({ repository:githubRepo, branch:githubBranch, head:branch?.commit?.sha || null, files, securityReview:{opaqueOrExecutableCandidates:risky, note:'Candidates require review; presence alone does not mean malware.'} })
    } catch (error) { res.status(502).json({ error:error.message || 'Could not inspect GitHub repository' }) }
  })

  router.get('/workstation/file', requireUser, async (req, res) => {
    try {
      const file = await githubTextFile(req.query.path)
      res.json(file)
    } catch (error) { res.status(400).json({ error:error.message || 'Could not read file' }) }
  })

  router.post('/workstation/ai-review', requireUser, async (req, res) => {
    try {
      const question = String(req.body?.question || 'Review this file for correctness, security, integration gaps, and missing tests.').slice(0,2000)
      const file = await githubTextFile(req.body?.path)
      const excerpt = file.content.slice(0,14000)
      const prompt = `You are reviewing TRYAMM repository ${githubRepo} branch ${githubBranch}. File: ${file.path}\n\n${question}\n\nCODE:\n${excerpt}`
      const result = await answerWithTriBrain({ supabase, userId:req.user.id, question:prompt, ageLane:'adult', mode:'repository-review', context:{ projectId:githubRepo, highImpact:false, irreversible:false } })
      res.status(result.status === 'BLOCKED' ? 403 : 200).json({ file:{path:file.path,sha:file.sha,size:file.size}, review:result })
    } catch (error) { res.status(500).json({ error:error.message || 'AI repository review failed' }) }
  })

  return router
}

module.exports = { createWorkforceRouter }