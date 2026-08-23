'use strict';

const crypto = require('crypto');
const supabase = require('./supabase-rest');

function cleanText(value, max = 160) {
  return String(value || '').trim().slice(0, max);
}

module.exports = function registerDurableStateRoutes({ app, auth, getStore, saveStore }) {
  async function ensureSupabaseIdentity(user) {
    if (!supabase.configured()) {
      const error = new Error('Durable Supabase state is not configured');
      error.status = 503;
      error.code = 'SUPABASE_NOT_CONFIGURED';
      throw error;
    }

    if (user.supabaseUserId) return user.supabaseUserId;

    const password = `${crypto.randomBytes(24).toString('base64url')}Aa1!`;
    const created = await supabase.auth.createUser({
      email: user.email,
      password,
      displayName: user.displayName
    });
    const supabaseUserId = created?.id || created?.user?.id;
    if (!supabaseUserId) {
      const error = new Error('Supabase identity creation returned no user id');
      error.status = 502;
      throw error;
    }

    user.supabaseUserId = supabaseUserId;
    await saveStore();
    return supabaseUserId;
  }

  app.get('/api/durable/status', auth, async (req, res, next) => {
    try {
      const supabaseUserId = supabase.configured() ? await ensureSupabaseIdentity(req.user) : null;
      res.json({
        ok: true,
        configured: supabase.configured(),
        identityReady: Boolean(supabaseUserId),
        supabaseUserId
      });
    } catch (error) { next(error); }
  });

  app.get('/api/player/state', auth, async (req, res, next) => {
    try {
      const userId = await ensureSupabaseIdentity(req.user);
      const rows = await supabase.select('player_state', `user_id=eq.${encodeURIComponent(userId)}&select=*`);
      const state = Array.isArray(rows) ? rows[0] : null;
      if (!state) return res.status(404).json({ error: 'Player state not found' });
      res.json({ state });
    } catch (error) { next(error); }
  });

  app.patch('/api/player/state', auth, async (req, res, next) => {
    try {
      const userId = await ensureSupabaseIdentity(req.user);
      const rows = await supabase.select('player_state', `user_id=eq.${encodeURIComponent(userId)}&select=*`);
      const current = Array.isArray(rows) ? rows[0] : null;
      if (!current) return res.status(404).json({ error: 'Player state not found' });

      const allowed = ['avatar', 'avatar_id', 'current_world_id', 'current_verse', 'checkpoint', 'accessibility_profile'];
      const patch = {};
      for (const key of allowed) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) patch[key] = req.body[key];
      }
      if (!Object.keys(patch).length) return res.status(400).json({ error: 'No permitted player-state fields supplied' });
      patch.revision = Number(current.revision || 0) + 1;
      patch.updated_at = new Date().toISOString();

      const updated = await supabase.update(
        'player_state',
        `user_id=eq.${encodeURIComponent(userId)}&revision=eq.${encodeURIComponent(current.revision || 0)}`,
        patch
      );
      if (!Array.isArray(updated) || !updated.length) {
        return res.status(409).json({ error: 'Player state changed on another device; reload and try again', code: 'REVISION_CONFLICT' });
      }
      res.json({ state: updated[0] });
    } catch (error) { next(error); }
  });

  app.get('/api/streetverse/missions', auth, async (req, res, next) => {
    try {
      const userId = await ensureSupabaseIdentity(req.user);
      const rows = await supabase.select(
        'streetverse_mission_runs',
        `user_id=eq.${encodeURIComponent(userId)}&select=*&order=updated_at.desc&limit=100`
      );
      res.json({ missions: Array.isArray(rows) ? rows : [] });
    } catch (error) { next(error); }
  });

  app.post('/api/streetverse/missions', auth, async (req, res, next) => {
    try {
      const userId = await ensureSupabaseIdentity(req.user);
      const missionId = cleanText(req.body?.mission_id, 120);
      const characterId = cleanText(req.body?.character_id || 'player', 120);
      const beatId = cleanText(req.body?.beat_id || 'start', 120);
      if (!missionId) return res.status(400).json({ error: 'mission_id is required' });

      const inserted = await supabase.insert('streetverse_mission_runs', {
        user_id: userId,
        character_id: characterId,
        mission_id: missionId,
        beat_id: beatId,
        status: 'active',
        choice: req.body?.choice && typeof req.body.choice === 'object' ? req.body.choice : {},
        runtime_state: req.body?.runtime_state && typeof req.body.runtime_state === 'object' ? req.body.runtime_state : {}
      });
      res.status(201).json({ mission: Array.isArray(inserted) ? inserted[0] : inserted });
    } catch (error) { next(error); }
  });

  app.patch('/api/streetverse/missions/:id', auth, async (req, res, next) => {
    try {
      const userId = await ensureSupabaseIdentity(req.user);
      const patch = { updated_at: new Date().toISOString() };
      if (req.body?.beat_id !== undefined) patch.beat_id = cleanText(req.body.beat_id, 120);
      if (req.body?.status !== undefined) {
        const status = cleanText(req.body.status, 32);
        if (!['active', 'paused', 'completed', 'failed'].includes(status)) return res.status(400).json({ error: 'Invalid mission status' });
        patch.status = status;
      }
      if (req.body?.choice && typeof req.body.choice === 'object') patch.choice = req.body.choice;
      if (req.body?.runtime_state && typeof req.body.runtime_state === 'object') patch.runtime_state = req.body.runtime_state;

      const updated = await supabase.update(
        'streetverse_mission_runs',
        `id=eq.${encodeURIComponent(req.params.id)}&user_id=eq.${encodeURIComponent(userId)}`,
        patch
      );
      if (!Array.isArray(updated) || !updated.length) return res.status(404).json({ error: 'Mission run not found' });
      res.json({ mission: updated[0] });
    } catch (error) { next(error); }
  });

  app.get('/api/media/catalog', auth, async (req, res, next) => {
    try {
      const userId = await ensureSupabaseIdentity(req.user);
      const rows = await supabase.select('media_catalog', `owner_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=100`);
      res.json({ media: Array.isArray(rows) ? rows : [] });
    } catch (error) { next(error); }
  });

  app.post('/api/media/catalog', auth, async (req, res, next) => {
    try {
      const userId = await ensureSupabaseIdentity(req.user);
      const title = cleanText(req.body?.title, 160);
      const mediaType = cleanText(req.body?.media_type || 'video', 40);
      if (!title) return res.status(400).json({ error: 'title is required' });
      if (!['video', 'image', 'gif', 'audio', 'reel', 'movie', 'episode', 'live-replay'].includes(mediaType)) {
        return res.status(400).json({ error: 'Unsupported media_type' });
      }

      const visibility = ['private', 'unlisted', 'public'].includes(req.body?.visibility) ? req.body.visibility : 'private';
      const manifest = {
        caption: cleanText(req.body?.caption, 2000),
        destinations: Array.isArray(req.body?.destinations) ? req.body.destinations.map(x => cleanText(x, 80)).filter(Boolean).slice(0, 12) : [],
        source: cleanText(req.body?.source || 'tryamm-media-studio', 120),
        upload_status: 'awaiting-upload',
        client_draft_id: cleanText(req.body?.client_draft_id, 120)
      };

      const inserted = await supabase.insert('media_catalog', {
        owner_id: userId,
        brand: 'TRYAMM',
        title,
        media_type: mediaType,
        rights_status: 'original',
        visibility,
        manifest
      });
      res.status(201).json({ media: Array.isArray(inserted) ? inserted[0] : inserted, uploadRequired: true });
    } catch (error) { next(error); }
  });
};
