'use strict';

const SET_APART_STATIONS = [
  { slug: 'set-apart-rap', name: 'Set Apart Rap', genre: 'Christian Rap', mode: 'radio' },
  { slug: 'set-apart-rnb', name: 'Set Apart R&B', genre: 'Christian R&B', mode: 'radio' },
  { slug: 'worship-radio', name: 'Worship Radio', genre: 'Worship', mode: 'radio' },
  { slug: 'gospel-classics', name: 'Gospel Classics', genre: 'Gospel', mode: 'radio' },
  { slug: 'new-artist-spotlight', name: 'New Artist Spotlight', genre: 'Faith & Inspirational', mode: 'creator' },
  { slug: 'set-apart-youth', name: 'Set Apart Youth', genre: 'Clean Faith Music', mode: 'creator' },
  { slug: 'sabbath-reflection', name: 'Sabbath & Reflection Radio', genre: 'Reflection', mode: 'talk' },
  { slug: 'live-testimony', name: 'Live Testimony Radio', genre: 'Testimony', mode: 'talk' }
];

module.exports = function registerOmniverseRadioRoutes({ app, auth, clean, id, getStore, saveStore, io }) {
  const store = getStore();
  for (const key of ['radioStations','radioRequests','radioCalls','radioAds','radioPlayEvents','musicLicenses']) {
    if (!Array.isArray(store[key])) store[key] = [];
  }

  const adminOrCreator = (req, res) => {
    if (req.user.role !== 'admin' && !req.user.isCreator) {
      res.status(403).json({ error: 'Creator or admin access required' });
      return false;
    }
    return true;
  };

  app.get('/api/radio/presets/set-apart', (_req, res) => {
    res.json({ vertical: 'Set Apart Music', stations: SET_APART_STATIONS });
  });

  app.get('/api/radio/stations', (req, res) => {
    const lane = clean(req.query.lane, 40).toLowerCase();
    const stations = store.radioStations
      .filter((s) => s.status === 'live' || s.status === 'scheduled')
      .filter((s) => !lane || String(s.lane || '').toLowerCase() === lane);
    res.json({ stations });
  });

  app.post('/api/radio/stations', auth, async (req, res) => {
    if (!adminOrCreator(req, res)) return;
    const station = {
      id: id('station'), ownerId: req.user.id,
      name: clean(req.body.name, 100) || 'Omniverse Radio',
      genre: clean(req.body.genre, 60) || 'Mixed',
      description: clean(req.body.description, 500),
      lane: clean(req.body.lane, 40).toLowerCase() === 'set-apart' ? 'set-apart' : 'general',
      audience: clean(req.body.audience, 30) || 'general',
      mode: ['radio','talk','business','creator','emergency'].includes(req.body.mode) ? req.body.mode : 'radio',
      status: req.body.status === 'scheduled' ? 'scheduled' : 'live',
      currentTrackId: null, sponsorId: null, listeners: 0,
      createdAt: new Date().toISOString()
    };
    store.radioStations.push(station); await saveStore(); io.emit('radio:stations-changed');
    res.status(201).json({ station });
  });

  app.post('/api/radio/stations/:stationId/requests', auth, async (req, res) => {
    const station = store.radioStations.find((s) => s.id === req.params.stationId);
    if (!station) return res.status(404).json({ error: 'Station not found' });
    const request = { id: id('req'), stationId: station.id, listenerId: req.user.id, trackId: clean(req.body.trackId, 100), message: clean(req.body.message, 300), status: 'queued', createdAt: new Date().toISOString() };
    store.radioRequests.push(request); await saveStore(); io.emit('radio:request', request); res.status(201).json({ request });
  });

  app.post('/api/radio/stations/:stationId/calls', auth, async (req, res) => {
    const station = store.radioStations.find((s) => s.id === req.params.stationId);
    if (!station) return res.status(404).json({ error: 'Station not found' });
    const call = { id: id('call'), stationId: station.id, callerId: req.user.id, topic: clean(req.body.topic, 200), consentToBroadcastAndRecord: Boolean(req.body.consentToBroadcastAndRecord), status: 'waiting', createdAt: new Date().toISOString() };
    if (!call.consentToBroadcastAndRecord) return res.status(400).json({ error: 'Broadcast/recording consent is required before entering the on-air queue' });
    store.radioCalls.push(call); await saveStore(); io.emit('radio:call-waiting', { ...call, callerName: req.user.displayName }); res.status(201).json({ call });
  });

  app.post('/api/music/tracks/:trackId/license', auth, async (req, res) => {
    const track = store.tracks.find((t) => t.id === req.params.trackId && t.creatorId === req.user.id);
    if (!track) return res.status(404).json({ error: 'Creator-owned track not found' });
    if (!req.body.certifyAuthority) return res.status(400).json({ error: 'You must certify that you control the rights being licensed' });
    const permissions = ['radio','streetverse','vehicle-radio','business-radio','live-dj','live-concert','reels','games','movies','ads','podcasts'].filter((p) => Array.isArray(req.body.permissions) && req.body.permissions.includes(p));
    const license = { id: id('lic'), trackId: track.id, licensorId: req.user.id, nonExclusive: true, permissions, territories: Array.isArray(req.body.territories) ? req.body.territories.map((x) => clean(x, 60)).slice(0,100) : ['US'], status: 'pending-review', createdAt: new Date().toISOString() };
    store.musicLicenses.push(license); track.rightsStatus = 'license-pending-review'; await saveStore(); res.status(201).json({ license });
  });

  app.post('/api/radio/stations/:stationId/play', auth, async (req, res) => {
    const station = store.radioStations.find((s) => s.id === req.params.stationId);
    if (!station) return res.status(404).json({ error: 'Station not found' });
    if (station.ownerId !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Station owner or admin required' });
    const track = store.tracks.find((t) => t.id === clean(req.body.trackId, 100) && t.status === 'published');
    if (!track) return res.status(404).json({ error: 'Published track not found' });
    const directLicense = store.musicLicenses.find((l) => l.trackId === track.id && l.status === 'approved' && l.permissions.includes('radio'));
    if (!directLicense && track.rightsStatus !== 'licensed') return res.status(409).json({ error: 'Track is not cleared for Omniverse Radio playback' });
    station.currentTrackId = track.id;
    const event = { id: id('rplay'), stationId: station.id, lane: station.lane || 'general', trackId: track.id, artistName: track.artistName, title: track.title, isrc: clean(track.isrc, 30), licenseId: directLicense?.id || null, territory: clean(req.body.territory, 10) || 'US', listeners: Math.max(0, Number(req.body.listeners || 0)), startedAt: new Date().toISOString() };
    store.radioPlayEvents.push(event); await saveStore(); io.emit('radio:now-playing', event); res.status(201).json({ event });
  });

  app.post('/api/radio/ads', auth, async (req, res) => {
    const amountCents = Math.max(0, Math.min(100000000, Number(req.body.amountCents || 0)));
    if (!amountCents) return res.status(400).json({ error: 'Advertising budget is required' });
    const ad = { id: id('radad'), buyerId: req.user.id, businessName: clean(req.body.businessName, 120), lane: clean(req.body.lane, 40).toLowerCase() === 'set-apart' ? 'set-apart' : 'general', creativeUrl: clean(req.body.creativeUrl, 500), durationSeconds: [15,30,60].includes(Number(req.body.durationSeconds)) ? Number(req.body.durationSeconds) : 30, amountCents, status: 'pending-payment-and-review', impressions: 0, createdAt: new Date().toISOString() };
    store.radioAds.push(ad); await saveStore(); res.status(201).json({ ad });
  });

  app.get('/api/radio/creator/earnings', auth, (req, res) => {
    const entries = store.creatorLedger.filter((e) => e.creatorId === req.user.id);
    res.json({ entries: entries.slice(-200).reverse(), pendingCents: entries.filter((e) => e.status === 'pending').reduce((sum,e) => sum + Number(e.amountCents || 0), 0) });
  });

  app.get('/api/radio/admin/summary', auth, (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    res.json({ stations: store.radioStations.length, setApartStations: store.radioStations.filter((s) => s.lane === 'set-apart').length, liveStations: store.radioStations.filter((s) => s.status === 'live').length, requests: store.radioRequests.length, waitingCalls: store.radioCalls.filter((c) => c.status === 'waiting').length, ads: store.radioAds.length, adPipelineCents: store.radioAds.reduce((sum,a) => sum + Number(a.amountCents || 0), 0), radioPlays: store.radioPlayEvents.length, licenses: store.musicLicenses.length });
  });
};
