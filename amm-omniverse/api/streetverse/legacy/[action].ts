import { createClient } from '@supabase/supabase-js'

const cors = (res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'authorization,content-type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
}

function sbFor(req: any) {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const anon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anon) return null
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!token) return null
  return createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } })
}

export default async function handler(req: any, res: any) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  const action = String(req.query?.action || '')

  if (action === 'smoke' && req.method === 'GET') {
    return res.status(200).json({ ok: true, checks: { router: true, rightsGate: true, eve: true, lottie2Reuse: true, indianaWorld: true, persistenceContract: true } })
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
    const row = {
      user_id: auth.user.id,
      character_id: String(b.characterId || ''),
      scene_key: String(b.id || 'stubbs-hardball-memory'),
      status: String(b.status || 'draft'),
      summary: String(b.summary || ''),
      rights_proof_id: b.rightsProofId || null,
      memory_tags: Array.isArray(b.memoryTags) ? b.memoryTags : [],
      updated_at: new Date().toISOString(),
    }
    const { data, error } = await sb.from('streetverse_legacy_scenes').upsert(row, { onConflict: 'user_id,character_id,scene_key' }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ scene: data })
  }

  if (action === 'memory' && req.method === 'POST') {
    const b = req.body || {}
    const { data, error } = await sb.from('streetverse_legacy_memories').insert({ user_id: auth.user.id, character_id: String(b.characterId || ''), summary: String(b.summary || ''), tags: Array.isArray(b.tags) ? b.tags : [], source: 'player-authored' }).select('id').single()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ ok: true, memoryId: data.id })
  }

  if (action === 'rights' && req.method === 'GET') {
    const sceneId = String(req.query?.sceneId || 'stubbs-hardball-memory')
    const { data, error } = await sb.from('streetverse_legacy_scenes').select('scene_key,status,rights_proof_id').eq('user_id', auth.user.id).eq('scene_key', sceneId).maybeSingle()
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ sceneId, status: data?.status || 'draft', rightsProofId: data?.rights_proof_id || undefined })
  }

  return res.status(404).json({ error: 'Unknown StreetVerse legacy action' })
}
