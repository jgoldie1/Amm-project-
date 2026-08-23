const crypto = require('crypto')

const OPENAI_MODEL = process.env.OPENAI_STUBBS_CRITIC_MODEL || 'gpt-5.6-sol'
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const MAX_MEMORY = Math.max(1, Math.min(20, Number(process.env.STUBBS_MEMORY_LIMIT || 8)))

function clamp01(n){ return Math.max(0, Math.min(1, Number(n) || 0)) }
function uniq(xs){ return [...new Set((xs || []).filter(Boolean).map(String))] }
function normalizeConclusion(v){ return String(v || '').trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 300) }
function id(prefix){ return `${prefix}_${crypto.randomUUID()}` }

function classifyRisk(score){
  const s = Math.max(0, Math.min(100, Math.round(Number(score) || 0)))
  if (s >= 80) return 'RED'
  if (s >= 60) return 'ORANGE'
  if (s >= 30) return 'YELLOW'
  return 'GREEN'
}

function spiderSense(signals = {}){
  const weights = {
    promptInjection: 28,
    secretAccess: 30,
    privilegeEscalation: 30,
    unexpectedPermission: 22,
    failedAuthentication: 20,
    conflictingEvidence: 16,
    timeSensitiveWithoutEvidence: 18,
    confidenceGap: 12,
    highImpactAction: 22,
    irreversibleAction: 28,
    suspiciousPrompt: 20,
  }
  let score = 0
  const reasons = []
  for (const [key, weight] of Object.entries(weights)) {
    const raw = signals[key]
    const strength = raw === true ? 1 : raw === false || raw == null ? 0 : clamp01(raw)
    if (strength > 0) { score += weight * strength; reasons.push(key) }
  }
  score = Math.min(100, Math.round(score))
  const band = classifyRisk(score)
  return {
    score, band, reasons,
    action: band === 'GREEN' ? 'proceed' : band === 'YELLOW' ? 'verify' : band === 'ORANGE' ? 'double-pass' : 'block',
  }
}

function extractJson(text){
  const raw = String(text || '').trim()
  if (!raw) return null
  try { return JSON.parse(raw) } catch (_) {}
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) { try { return JSON.parse(fenced[1]) } catch (_) {} }
  const start = raw.indexOf('{'), end = raw.lastIndexOf('}')
  if (start >= 0 && end > start) { try { return JSON.parse(raw.slice(start, end + 1)) } catch (_) {} }
  return null
}

function normalizeBrain(raw, fallbackAnswer = ''){
  const obj = typeof raw === 'string' ? (extractJson(raw) || { answer: raw }) : (raw || {})
  const answer = String(obj.answer || fallbackAnswer || '').trim()
  return {
    answer,
    conclusionKey: normalizeConclusion(obj.conclusionKey || obj.conclusion_key || answer),
    confidence: clamp01(obj.confidence),
    evidenceIds: uniq(obj.evidenceIds || obj.evidence_ids),
    uncertainties: uniq(obj.uncertainties),
    assumptions: uniq(obj.assumptions),
  }
}

async function readMemory(supabase, userId){
  try {
    const { data, error } = await supabase
      .from('stubbs_ai_memory')
      .select('scope,summary,source_ids,confidence,updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(MAX_MEMORY)
    if (error) return []
    return data || []
  } catch (_) { return [] }
}

async function writeMemory(supabase, userId, brain, sourceIds = []){
  if (!brain?.answer) return
  try {
    await supabase.from('stubbs_ai_memory').insert({
      id: id('mem'), user_id: userId, scope: 'episodic', summary: brain.answer.slice(0, 6000),
      source_ids: uniq([...brain.evidenceIds, ...sourceIds]), confidence: clamp01(brain.confidence),
      permissions: { owner: userId }, updated_at: new Date().toISOString(),
    })
  } catch (_) {}
}

async function audit(supabase, userId, details){
  try {
    await supabase.from('stubbs_ai_audit').insert({
      id: id('aud'), user_id: userId, task_id: details.taskId || null,
      event_type: details.eventType || 'answer', status: details.status || 'unknown',
      risk_band: details.riskBand || null, evidence_ids: uniq(details.evidenceIds), details,
    })
  } catch (_) {}
}

async function geminiExecutive({ apiKey, question, ageLane, mode, context, memory }){
  if (!apiKey) return null
  const system = [
    'You are Brain 1, Executive Stubbs AI for the AMM Omniverse.',
    'Solve the request, but do not invent completed actions, sources, deployments, or platform state.',
    'For factual claims, distinguish VERIFIED, MODEL_KNOWLEDGE, ESTIMATE, SIMULATION, and UNKNOWN.',
    'When evidence is insufficient, say UNKNOWN instead of guessing.',
    `The verified age lane is ${ageLane}. Respect youth/guardian controls.`,
    'Return ONLY JSON with: answer, conclusionKey, confidence (0-1), evidenceIds (array), uncertainties (array), assumptions (array).',
  ].join(' ')
  const prompt = `${system}\nMode:${mode}\nContext:${JSON.stringify(context).slice(0,8000)}\nMemory:${JSON.stringify(memory).slice(0,8000)}\nUser:${question}`
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`
  const response = await fetch(url, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.25, maxOutputTokens: 1800, responseMimeType: 'application/json' } }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(`Executive provider failed (${response.status})`)
  const text = body?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('').trim()
  if (!text) throw new Error('Executive provider returned no output')
  return normalizeBrain(text)
}

async function openAICritic({ apiKey, question, ageLane, mode, context, memory }){
  if (!apiKey) return null
  const instructions = [
    'You are Brain 2, an independent adversarial verifier for Stubbs AI.',
    'Solve the user request independently. Do not see or assume Brain 1 output.',
    'Actively look for unsupported claims, stale facts, hidden assumptions, permission problems, and safer alternatives.',
    'Never claim an external action occurred unless evidence supplied to you proves it.',
    `The verified age lane is ${ageLane}. Respect youth/guardian controls.`,
    'Output only JSON with answer, conclusionKey, confidence, evidenceIds, uncertainties, assumptions.',
  ].join(' ')
  const input = `Mode:${mode}\nContext:${JSON.stringify(context).slice(0,8000)}\nMemory:${JSON.stringify(memory).slice(0,8000)}\nUser:${question}`
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OPENAI_MODEL, instructions, input, max_output_tokens: 1800, reasoning: { effort: 'medium' } }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body?.error?.message || `Critic provider failed (${response.status})`)
  const text = (body.output || []).flatMap(i => i.content || []).filter(c => c.type === 'output_text').map(c => c.text || '').join('\n').trim()
  if (!text) throw new Error('Critic provider returned no output')
  return normalizeBrain(text)
}

function compareBrains(primary, critic){
  if (!primary || !critic) return { agree: false, reason: 'missing-brain' }
  const conclusionAgree = primary.conclusionKey && primary.conclusionKey === critic.conclusionKey
  const confidenceGap = Math.abs(primary.confidence - critic.confidence)
  const evidenceA = new Set(primary.evidenceIds), evidenceB = new Set(critic.evidenceIds)
  const shared = [...evidenceA].filter(x => evidenceB.has(x))
  return { agree: Boolean(conclusionAgree), confidenceGap, sharedEvidence: shared }
}

function inferSignals({ question, context, primary, critic }){
  const q = String(question || '').toLowerCase()
  const cmp = compareBrains(primary, critic)
  return {
    promptInjection: /ignore (all|previous)|system prompt|developer message|reveal.*prompt/.test(q),
    secretAccess: /api key|password|secret key|private key|service role/.test(q),
    privilegeEscalation: /bypass|disable.*security|admin access|elevate privilege/.test(q),
    highImpactAction: Boolean(context?.highImpact) || /send money|payment|delete production|deploy production|sign contract/.test(q),
    irreversibleAction: Boolean(context?.irreversible),
    conflictingEvidence: primary && critic && !cmp.agree ? 1 : 0,
    confidenceGap: primary && critic ? Math.min(1, cmp.confidenceGap) : .5,
    timeSensitiveWithoutEvidence: Boolean(context?.timeSensitive) && uniq([...(primary?.evidenceIds||[]), ...(critic?.evidenceIds||[])]).length === 0,
  }
}

async function answerWithTriBrain({ supabase, userId, question, ageLane, mode = 'hybrid', context = {} }){
  const memory = await readMemory(supabase, userId)
  const geminiKey = process.env.GEMINI_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY
  const taskId = id('task')

  if (!geminiKey && !openaiKey) {
    const result = { status: 'BLOCKED', verified: false, answer: null, reason: 'AI_PROVIDERS_NOT_CONFIGURED', taskId }
    await audit(supabase, userId, { taskId, eventType:'provider-block', status:'blocked', riskBand:'YELLOW', evidenceIds:[], reason:result.reason })
    return result
  }

  let primary = null, critic = null, providerErrors = []
  try {
    primary = geminiKey ? await geminiExecutive({ apiKey: geminiKey, question, ageLane, mode, context, memory }) : await openAICritic({ apiKey: openaiKey, question, ageLane, mode, context, memory })
  } catch (e) { providerErrors.push(`executive:${e.message}`) }
  try {
    critic = openaiKey ? await openAICritic({ apiKey: openaiKey, question, ageLane, mode, context, memory }) : await geminiExecutive({ apiKey: geminiKey, question, ageLane, mode, context, memory })
  } catch (e) { providerErrors.push(`critic:${e.message}`) }

  if (!primary || !critic) {
    const surviving = primary || critic
    const sense = spiderSense({ conflictingEvidence:.7, confidenceGap:.7 })
    const result = {
      taskId, status:'VERIFY', verified:false, answer:surviving?.answer || null,
      verification:'SINGLE_PROVIDER_ONLY', spiderSense:sense, providerErrors,
      providers:{ executive:geminiKey?'gemini':'openai', critic:openaiKey?'openai':'gemini' },
    }
    await audit(supabase, userId, { taskId, eventType:'single-provider', status:'verify', riskBand:sense.band, evidenceIds:surviving?.evidenceIds||[], providerErrors })
    return result
  }

  const comparison = compareBrains(primary, critic)
  const sense = spiderSense(inferSignals({ question, context, primary, critic }))
  const highRisk = sense.band === 'RED' || Boolean(context?.highImpact)
  const evidenceIds = uniq([...primary.evidenceIds, ...critic.evidenceIds])

  let status = 'VERIFIED'
  let verified = comparison.agree && !highRisk
  if (sense.band === 'RED') { status = 'BLOCKED'; verified = false }
  else if (!comparison.agree || sense.band === 'ORANGE') { status = 'REVIEW'; verified = false }
  else if (sense.band === 'YELLOW') { status = 'VERIFY'; verified = false }

  // Agreement is not proof for a time-sensitive factual answer with no evidence.
  if (context?.timeSensitive && evidenceIds.length === 0) { status = 'VERIFY'; verified = false }

  const result = {
    taskId, status, verified, answer: status === 'BLOCKED' ? null : primary.answer,
    verification: verified ? 'DOUBLE_PASS_VERIFIED' : 'NOT_FULLY_VERIFIED',
    primary, critic, comparison, spiderSense:sense, evidenceIds,
    providers:{ executive:geminiKey?'gemini':'openai', critic:openaiKey?'openai':'gemini' },
    providerErrors,
  }
  if (verified) await writeMemory(supabase, userId, primary, evidenceIds)
  await audit(supabase, userId, { taskId, eventType:'tri-brain-answer', status:status.toLowerCase(), riskBand:sense.band, evidenceIds, comparison, providerErrors })
  return result
}

module.exports = { classifyRisk, spiderSense, normalizeBrain, compareBrains, answerWithTriBrain }
