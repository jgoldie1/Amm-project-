'use strict';

module.exports = function registerMusicApi({ app, auth, clean, id, getStore, saveStore, io }) {
  const store = getStore();
  for (const key of ['tracks','streamEvents','creatorLedger','chartSnapshots']) if (!Array.isArray(store[key])) store[key] = [];

  const publicTrack = (track) => ({
    id: track.id, creatorId: track.creatorId, artistName: track.artistName, title: track.title,
    album: track.album, genre: track.genre, explicit: track.explicit, coverUrl: track.coverUrl,
    audioUrl: track.audioUrl, videoUrl: track.videoUrl, immersive: track.immersive,
    rightsStatus: track.rightsStatus, status: track.status, releaseDate: track.releaseDate,
    qualifiedStreams: track.qualifiedStreams || 0, uniqueListeners: track.uniqueListeners || 0,
    saves: track.saves || 0, shares: track.shares || 0, videoViews: track.videoViews || 0,
    immersiveSessions: track.immersiveSessions || 0, createdAt: track.createdAt
  });

  const ensureCreator = (req, res) => {
    if (!req.user.isCreator && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Activate creator tools first' }); return false;
    }
    return true;
  };

  app.get('/api/music/tracks', (req, res) => {
    const q = clean(req.query.q, 120).toLowerCase();
    const genre = clean(req.query.genre, 60).toLowerCase();
    const tracks = store.tracks.filter((t) => t.status === 'published')
      .filter((t) => !q || `${t.title} ${t.artistName} ${t.album} ${t.genre}`.toLowerCase().includes(q))
      .filter((t) => !genre || t.genre.toLowerCase() === genre)
      .sort((a,b) => new Date(b.releaseDate || b.createdAt) - new Date(a.releaseDate || a.createdAt));
    res.json({ tracks: tracks.map(publicTrack) });
  });

  app.get('/api/music/tracks/:trackId', (req, res) => {
    const track = store.tracks.find((t) => t.id === req.params.trackId && t.status === 'published');
    if (!track) return res.status(404).json({ error: 'Track not found' });
    res.json({ track: publicTrack(track) });
  });

  app.post('/api/music/tracks', auth, async (req, res) => {
    if (!ensureCreator(req, res)) return;
    const rightsConfirmed = Boolean(req.body.rightsConfirmed);
    if (!rightsConfirmed) return res.status(400).json({ error: 'Confirm that you own or control the required rights' });
    const title = clean(req.body.title, 120); const artistName = clean(req.body.artistName, 100) || req.user.displayName;
    if (!title) return res.status(400).json({ error: 'Song title is required' });
    const track = {
      id: id('trk'), creatorId: req.user.id, artistName, title, album: clean(req.body.album, 120),
      genre: clean(req.body.genre, 60) || 'Independent', explicit: Boolean(req.body.explicit),
      coverUrl: clean(req.body.coverUrl, 500), audioUrl: clean(req.body.audioUrl, 500), videoUrl: clean(req.body.videoUrl, 500),
      immersive: {
        arUrl: clean(req.body.arUrl, 500), vrUrl: clean(req.body.vrUrl, 500), mrUrl: clean(req.body.mrUrl, 500),
        holographicUrl: clean(req.body.holographicUrl, 500), spatialAudioUrl: clean(req.body.spatialAudioUrl, 500)
      },
      rightsStatus: 'creator-confirmed', status: req.body.publishNow === false ? 'draft' : 'published',
      releaseDate: clean(req.body.releaseDate, 30) || new Date().toISOString(),
      qualifiedStreams: 0, uniqueListeners: 0, saves: 0, shares: 0, videoViews: 0, immersiveSessions: 0,
      listenerIds: [], createdAt: new Date().toISOString()
    };
    store.tracks.push(track); await saveStore(); io.emit('music:changed');
    res.status(201).json({ track: publicTrack(track) });
  });

  app.post('/api/music/tracks/:trackId/stream', auth, async (req, res) => {
    const track = store.tracks.find((t) => t.id === req.params.trackId && t.status === 'published');
    if (!track) return res.status(404).json({ error: 'Track not found' });
    const seconds = Math.max(0, Math.min(86400, Number(req.body.seconds || 0)));
    const completed = Boolean(req.body.completed); const qualified = seconds >= 30 || completed;
    const recentDuplicate = store.streamEvents.some((e) => e.trackId === track.id && e.listenerId === req.user.id && Date.now() - new Date(e.createdAt).getTime() < 30000);
    const payable = qualified && !recentDuplicate && req.user.id !== track.creatorId;
    const event = { id: id('str'), trackId: track.id, creatorId: track.creatorId, listenerId: req.user.id, seconds, completed, qualified, payable, createdAt: new Date().toISOString() };
    store.streamEvents.push(event);
    if (qualified) {
      track.qualifiedStreams += 1;
      if (!track.listenerIds.includes(req.user.id)) { track.listenerIds.push(req.user.id); track.uniqueListeners += 1; }
    }
    if (payable) {
      const poolCreditCents = Math.max(1, Number(process.env.MUSIC_STREAM_RESERVE_CENTS || 1));
      store.creatorLedger.push({ id: id('led'), creatorId: track.creatorId, trackId: track.id, kind: 'qualified-stream-reserve', amountCents: poolCreditCents, status: 'pending', createdAt: new Date().toISOString() });
    }
    await saveStore(); res.status(201).json({ qualified, payable, qualifiedStreams: track.qualifiedStreams });
  });

  app.post('/api/music/tracks/:trackId/engagement', auth, async (req, res) => {
    const track = store.tracks.find((t) => t.id === req.params.trackId && t.status === 'published');
    if (!track) return res.status(404).json({ error: 'Track not found' });
    const type = clean(req.body.type, 30);
    if (!['save','share','video-view','immersive-session'].includes(type)) return res.status(400).json({ error: 'Unknown engagement type' });
    if (type === 'save') track.saves += 1;
    if (type === 'share') track.shares += 1;
    if (type === 'video-view') track.videoViews += 1;
    if (type === 'immersive-session') track.immersiveSessions += 1;
    await saveStore(); res.json({ track: publicTrack(track) });
  });

  function chartScore(t) {
    return Math.round((t.qualifiedStreams * 35) + (t.videoViews * 20) + (t.uniqueListeners * 15) + (t.saves * 10) + (t.shares * 5) + (t.immersiveSessions * 15));
  }
  app.get('/api/music/charts/global-creators', (_req, res) => {
    const byCreator = new Map();
    for (const track of store.tracks.filter((t) => t.status === 'published')) {
      const row = byCreator.get(track.creatorId) || { creatorId: track.creatorId, artistName: track.artistName, score: 0, qualifiedStreams: 0, videoViews: 0, immersiveSessions: 0, tracks: 0 };
      row.score += chartScore(track); row.qualifiedStreams += track.qualifiedStreams; row.videoViews += track.videoViews; row.immersiveSessions += track.immersiveSessions; row.tracks += 1;
      byCreator.set(track.creatorId, row);
    }
    const chart = [...byCreator.values()].sort((a,b) => b.score - a.score).slice(0,100).map((r,i) => ({ rank: i + 1, ...r }));
    res.json({ name: 'AMM Global Creator Chart', methodology: 'Qualified listening, unique listeners, video, saves, shares and immersive engagement. Fraud-filtered activity only.', chart });
  });

  app.get('/api/music/creator/ledger', auth, (req, res) => {
    const entries = store.creatorLedger.filter((e) => e.creatorId === req.user.id);
    const totals = entries.reduce((a,e) => { a[e.status] = (a[e.status] || 0) + e.amountCents; return a; }, {});
    res.json({ entries: entries.slice(-200).reverse(), totals });
  });

  app.post('/api/rooms/:roomId/status', auth, async (req, res) => {
    const room = store.rooms.find((r) => r.id === req.params.roomId && r.status === 'live');
    if (!room) return res.status(404).json({ error: 'Live room not found' });
    if (room.hostId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Only the host can change room status' });
    const status = clean(req.body.status, 30).toLowerCase();
    if (!['live','brb','bathroom-break','intermission','backstage','ending-soon'].includes(status)) return res.status(400).json({ error: 'Invalid room status' });
    room.hostStatus = status; room.breakEndsAt = status === 'live' ? null : new Date(Date.now() + Math.max(30, Math.min(3600, Number(req.body.seconds || 300))) * 1000).toISOString();
    await saveStore(); io.to(`room:${room.id}`).emit('room:status', { status: room.hostStatus, breakEndsAt: room.breakEndsAt });
    res.json({ status: room.hostStatus, breakEndsAt: room.breakEndsAt });
  });

  if (!app.locals.tryammPaymentRoutesRegistered) {
    require('./lib/payment-routes')({ app, auth, getStore, saveStore });
    app.locals.tryammPaymentRoutesRegistered = true;
  }
};
