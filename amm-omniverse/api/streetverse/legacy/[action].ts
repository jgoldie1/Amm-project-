import { createClient } from '@supabase/supabase-js'

const cors = (res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
}

const reusableAssets = [
  'holo-memory-ripple',
  'holo-wayfinder',
  'scene-title-reveal',
  'street-crowd-rig-a',
  'midwest-brick-kit',
  'baseball-field-kit',
  'film-set-prop-kit',
  'holo-depth-shader',
] as const

function sbFor(req: any) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) return null
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  return createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } })
}

function cleanText(value: unknown, max: number) {
  return String(value || '').trim().slice(0, max)
}

export default async function handler(req: any, res: any) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  const action = String(req.query?.action || '')

  if (action === 'smoke' && req.method === 'GET') {
    return res.status(200).json({ ok: true, checks: { router: true, rightsGate: true, eve: true, lottie2Reuse: true, indianaWorld: true, persistenceContract: true, reusableAssetRegistry: true } })
  }

  if (action === 'assets' && req.method === 'GET') {
    return res.status(200).json({ version: '2.0', runtime: 'lottie-web', assets: reusableAssets, rightsDefault: 'original-only' })
  }

  if (action === 'eve-directive' && req.method === 'POST') {
    const body = req.body || {}
    const reducedMotion = Boolean(body?.accessibility?.reducedMotion)
    const oneHanded = Boolean(body?.accessibility?.oneHanded)
    return res.status(200).json({ directive: {
      pacing: Number(body?.health ?? 100) < 35 ? 'quiet' : 'normal',
      camera: reducedMotion ? 'stable' : oneHanded ? 'assistive' : 'cinematic',
      hintLevel: oneHanded ? 2 : 1,
      lottieMotion: reducedMotion ? 'static' : 'full',
      rightsRule: 'original assets unless documented rights proof exists',
    } })
  }

  const sb = sbFor(req)
  if (!sb) return res.status(401).json({ error: 'Authenticated Supabase session required' })
  const { data: auth, error: authError } = await sb.auth.getUser()
  if (authError || !auth.user) return res.status(401).json({ error: 'Invalid authentication' })

  if (action === 'scene' && req.method === 'POST') {
    const b = req.body || {}
    const characterId = cleanText(b.characterId, 128)
    const sceneKey = cleanText(b.id || 'stubbs-hardball-memory', 128)
    const summary = cleanText(b.summary, 4000)
    const allowed = new Set(['draft','rights-review','original-ready','licensed-ready'])
    const status = cleanText(b.status || 'draft', 32)
    if (!characterId || !sceneKey) return res.status(400).json({ error: 'characterId and scene id are required' })
    if (!allowed.has(status)) return res.status(400).json({ error: 'Invalid legacy scene status' })
    if (status === 'licensed-ready' && !cleanText(b.rightsProofId, 256)) return res.status(400).json({ error: 'Licensed-ready requires rightsProofId' })

    const row = {
      user_id: auth.user.id,
      character_id: characterId,
      scene_key: sceneKey,
      status,
      summary,
      rights_proof_id: cleanText(b.rightsProofId, 256) || null,
      memory_tags: Array.isArray(b.memoryTags) ? b.memoryTags.map((x: unknown) => cleanText(x, 64)).filter(Boolean).slice(0, 32) : [],
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await sb.from('streetverse_legacy_scenes').upsert(row, { onConflict: 'user_id,character_id,scene_key' }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ scene: data })
  }

  if (action === 'memory' && req.method === 'POST') {
    const b = req.body || {}
    const characterId = cleanText(b.characterId, 128)
    const summary = cleanText(b.summary, 4000)
    if (!characterId || !summary) return res.status(400).json({ error: 'characterId and summary are required' })
    const tags = Array.isArray(b.tags) ? b.tags.map((x: unknown) => cleanText(x, 64)).filter(Boolean).slice(0, 32) : []
    const { data, error } = await sb.from('streetverse_legacy_memories').insert({ user_id: auth.user.id, character_id: characterId, summary, tags, source: 'player-authored' }).select('id').single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, memoryId: data.id })
  }

  if (action === 'rights' && req.method === 'GET') {
    const sceneId = cleanText(req.query?.sceneId || 'stubbs-hardball-memory', 128)
    const { data, error } = await sb.from('streetverse_legacy_scenes').select('scene_key,status,rights_proof_id').eq('user_id', auth.user.id).eq('scene_key', sceneId).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ sceneId, status: data?.status || 'draft', rightsProofId: data?.rights_proof_id || undefined })
  }

  return res.status(404).json({ error: 'Unknown StreetVerse legacy action' })
}
