const express = require('express')
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk')

const BREAK_REASONS = new Set(['brb','bathroom','accessibility','meal','technical','emergency','backstage','ai-host','phone-call','background-interruption'])

function createLiveRouter({ supabase }) {
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

  function cleanRoomName(value) {
    return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80)
  }

  function livekitConfigured() {
    return Boolean(process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && process.env.LIVEKIT_URL)
  }

  function roomService() {
    if (!livekitConfigured()) throw new Error('LiveKit is not fully configured on the server')
    const host = String(process.env.LIVEKIT_URL).replace(/^wss:/i, 'https:').replace(/^ws:/i, 'http:')
    return new RoomServiceClient(host, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET)
  }

  async function getOwnedSession(userId, roomName) {
    const { data, error } = await supabase.from('live_stream_sessions').select('*').eq('user_id', userId).eq('room_name', roomName).maybeSingle()
    if (error) throw error
    return data
  }

  async function getActiveRoomSession(roomName) {
    const { data, error } = await supabase
      .from('live_stream_sessions')
      .select('*')
      .eq('room_name', roomName)
      .in('status', ['live', 'paused'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    return data
  }

  router.get('/status', (_req, res) => {
    res.json({
      configured: livekitConfigured(),
      urlConfigured: Boolean(process.env.LIVEKIT_URL),
      features: ['audio','video','screen-share','chat-data','multi-participant','recording-provider-ready','protected-pause','phone-call-safe','bathroom-break','qualified-time-accounting'],
      protectedBreakReasons: [...BREAK_REASONS],
    })
  })

  router.post('/token', requireUser, async (req, res) => {
    try {
      if (!livekitConfigured()) {
        return res.status(503).json({ error: 'LiveKit is not fully configured on the server' })
      }
      const roomName = cleanRoomName(req.body?.roomName)
      if (!roomName) return res.status(400).json({ error: 'roomName is required' })
      const displayName = String(req.body?.displayName || req.user.user_metadata?.display_name || req.user.email || 'TryAMM User').slice(0, 80)
      const role = req.body?.role === 'viewer' ? 'viewer' : 'host'
      const canPublish = role === 'host'
      const activeSession = await getActiveRoomSession(roomName)

      if (canPublish && activeSession && activeSession.user_id !== req.user.id) {
        return res.status(409).json({ error: 'LIVE room name is already in use' })
      }
      if (!canPublish && !activeSession) {
        return res.status(404).json({ error: 'LIVE room is not active' })
      }

      const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
        identity: req.user.id,
        name: displayName,
        ttl: '15m',
        metadata: JSON.stringify({ tryammUserId: req.user.id, role }),
      })
      token.addGrant({ roomJoin: true, room: roomName, canPublish, canSubscribe: true, canPublishData: true })
      const jwt = await token.toJwt()

      if (canPublish) {
        const now = new Date().toISOString()
        const { error } = await supabase.from('live_stream_sessions').upsert({
          user_id: req.user.id,
          room_name: roomName,
          status: 'live',
          pause_reason: null,
          ended_at: null,
          resumed_at: now,
          updated_at: now,
        }, { onConflict: 'user_id,room_name' })
        if (error) throw error
      }

      try {
        await supabase.from('platform_events').insert({
          user_id: req.user.id,
          event_type: 'LIVE_TOKEN_ISSUED',
          source: 'livekit',
          payload: { roomName, role },
        })
      } catch (_) {}

      res.json({ token: jwt, url: process.env.LIVEKIT_URL, roomName, identity: req.user.id, role })
    } catch (error) {
      res.status(500).json({ error: error.message || 'Could not issue LIVE token' })
    }
  })

  router.get('/session/:roomName', requireUser, async (req, res) => {
    try {
      const roomName = cleanRoomName(req.params.roomName)
      const session = await getOwnedSession(req.user.id, roomName)
      if (!session) return res.status(404).json({ error: 'LIVE session not found' })
      const { data: activeBreak } = await supabase.from('live_stream_breaks').select('*').eq('session_id', session.id).is('ended_at', null).order('started_at', { ascending: false }).limit(1).maybeSingle()
      res.json({ session, activeBreak: activeBreak || null })
    } catch (error) {
      res.status(500).json({ error: error.message || 'Could not load LIVE session' })
    }
  })

  router.post('/session/:roomName/pause', requireUser, async (req, res) => {
    try {
      const roomName = cleanRoomName(req.params.roomName)
      let reason = String(req.body?.reason || 'brb').trim().toLowerCase()
      if (!BREAK_REASONS.has(reason)) reason = 'brb'
      const source = String(req.body?.source || 'manual').slice(0, 80)
      const now = new Date().toISOString()
      let session = await getOwnedSession(req.user.id, roomName)
      if (!session) return res.status(404).json({ error: 'LIVE session not found' })
      if (session.status === 'ended') return res.status(409).json({ error: 'LIVE session already ended' })
      if (session.status === 'paused') {
        const { data: existing } = await supabase.from('live_stream_breaks').select('*').eq('session_id', session.id).is('ended_at', null).order('started_at', { ascending: false }).limit(1).maybeSingle()
        return res.json({ ok: true, alreadyPaused: true, session, break: existing || null })
      }
      const { data: breakRow, error: breakError } = await supabase.from('live_stream_breaks').insert({
        session_id: session.id,
        user_id: req.user.id,
        reason,
        source,
        protected: true,
        metadata: { privacyShield: true, muteMic: true, disableCamera: true, preserveChat: true, preserveRoom: true },
      }).select('*').single()
      if (breakError) throw breakError
      const { data: updated, error: updateError } = await supabase.from('live_stream_sessions').update({ status: 'paused', pause_reason: reason, paused_at: now, updated_at: now }).eq('id', session.id).select('*').single()
      if (updateError) throw updateError
      try { await supabase.from('platform_events').insert({ user_id: req.user.id, event_type: 'LIVE_PROTECTED_PAUSE', source, payload: { roomName, reason } }) } catch (_) {}
      res.json({ ok: true, session: updated, break: breakRow, privacy: { muteMic: true, disableCamera: true, preserveChat: true, preserveRoom: true } })
    } catch (error) {
      res.status(500).json({ error: error.message || 'Could not pause LIVE session' })
    }
  })

  router.post('/session/:roomName/resume', requireUser, async (req, res) => {
    try {
      const roomName = cleanRoomName(req.params.roomName)
      const session = await getOwnedSession(req.user.id, roomName)
      if (!session) return res.status(404).json({ error: 'LIVE session not found' })
      if (session.status === 'ended') return res.status(409).json({ error: 'LIVE session already ended' })
      if (session.status !== 'paused') return res.json({ ok: true, alreadyLive: true, session, resumeCountdownSeconds: 0 })
      const now = new Date()
      const { data: activeBreak, error: breakError } = await supabase.from('live_stream_breaks').select('*').eq('session_id', session.id).is('ended_at', null).order('started_at', { ascending: false }).limit(1).maybeSingle()
      if (breakError) throw breakError
      const breakSeconds = activeBreak ? Math.max(0, Math.floor((now.getTime() - new Date(activeBreak.started_at).getTime()) / 1000)) : 0
      if (activeBreak) {
        const { error } = await supabase.from('live_stream_breaks').update({ ended_at: now.toISOString(), duration_seconds: breakSeconds }).eq('id', activeBreak.id)
        if (error) throw error
      }
      const totalPause = Number(session.total_pause_seconds || 0) + breakSeconds
      const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(session.started_at).getTime()) / 1000))
      const qualified = Math.max(0, elapsed - totalPause)
      const { data: updated, error: updateError } = await supabase.from('live_stream_sessions').update({
        status: 'live',
        pause_reason: null,
        resumed_at: now.toISOString(),
        total_pause_seconds: totalPause,
        qualified_live_seconds: qualified,
        updated_at: now.toISOString(),
      }).eq('id', session.id).select('*').single()
      if (updateError) throw updateError
      try { await supabase.from('platform_events').insert({ user_id: req.user.id, event_type: 'LIVE_PROTECTED_RESUME', source: 'livekit', payload: { roomName, breakSeconds, qualifiedLiveSeconds: qualified } }) } catch (_) {}
      res.json({ ok: true, session: updated, breakSeconds, resumeCountdownSeconds: 3, restore: { camera: 'after-countdown', mic: 'after-countdown', chat: 'preserved', room: 'preserved' } })
    } catch (error) {
      res.status(500).json({ error: error.message || 'Could not resume LIVE session' })
    }
  })

  router.post('/session/:roomName/end', requireUser, async (req, res) => {
    try {
      const roomName = cleanRoomName(req.params.roomName)
      const session = await getOwnedSession(req.user.id, roomName)
      if (!session) return res.status(404).json({ error: 'LIVE session not found' })
      if (session.status === 'ended') return res.json({ ok: true, alreadyEnded: true, session })

      if (!livekitConfigured()) return res.status(503).json({ error: 'LiveKit is not fully configured on the server' })
      try {
        await roomService().deleteRoom(roomName)
      } catch (error) {
        return res.status(502).json({ error: 'Could not close the LiveKit room safely', detail: String(error?.message || error) })
      }

      const now = new Date()
      let totalPause = Number(session.total_pause_seconds || 0)
      const { data: activeBreak } = await supabase.from('live_stream_breaks').select('*').eq('session_id', session.id).is('ended_at', null).order('started_at', { ascending: false }).limit(1).maybeSingle()
      if (activeBreak) {
        const seconds = Math.max(0, Math.floor((now.getTime() - new Date(activeBreak.started_at).getTime()) / 1000))
        totalPause += seconds
        await supabase.from('live_stream_breaks').update({ ended_at: now.toISOString(), duration_seconds: seconds }).eq('id', activeBreak.id)
      }
      const elapsed = Math.max(0, Math.floor((now.getTime() - new Date(session.started_at).getTime()) / 1000))
      const qualified = Math.max(0, elapsed - totalPause)
      const { data: updated, error } = await supabase.from('live_stream_sessions').update({ status: 'ended', ended_at: now.toISOString(), total_pause_seconds: totalPause, qualified_live_seconds: qualified, updated_at: now.toISOString() }).eq('id', session.id).select('*').single()
      if (error) throw error
      try { await supabase.from('platform_events').insert({ user_id: req.user.id, event_type: 'LIVE_ROOM_ENDED', source: 'livekit', payload: { roomName, qualifiedLiveSeconds: qualified } }) } catch (_) {}
      res.json({ ok: true, session: updated })
    } catch (error) {
      res.status(500).json({ error: error.message || 'Could not end LIVE session' })
    }
  })

  return router
}

module.exports = { createLiveRouter }
