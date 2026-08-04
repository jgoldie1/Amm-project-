'use strict';

const WORLD_CATALOG = [
  { slug: 'my-world', name: 'My World', kind: 'open-world', description: 'Persistent life, business, property, missions and social play.' },
  { slug: 'we-are-the-world', name: 'We Are the World', kind: 'cooperative', description: 'Global rebuilding, culture, science and community missions.' },
  { slug: 'basketball', name: 'Basketball World', kind: 'sport', description: 'Career, street, league, training and holographic replay.' },
  { slug: 'football', name: 'Football World', kind: 'sport', description: 'Career, franchise, play design and team competition.' },
  { slug: 'baseball', name: 'Baseball World', kind: 'sport', description: 'Batting, pitching, fielding, clubs and seasons.' },
  { slug: 'soccer', name: 'Soccer World', kind: 'sport', description: 'Club, street, academy and global tournaments.' },
  { slug: 'hockey', name: 'Hockey World', kind: 'sport', description: 'Ice physics, teams, leagues and arena events.' },
  { slug: 'combat', name: 'Combat World', kind: 'sport', description: 'Boxing, MMA, training camps and sanctioned competition.' },
  { slug: 'racing', name: 'Racing World', kind: 'sport', description: 'Street, circuit, off-road and future vehicle racing.' },
  { slug: 'creator', name: 'Creator World', kind: 'creator', description: 'Build arenas, missions, events, broadcasts and mini-games.' },
  { slug: 'music', name: 'Music World', kind: 'entertainment', description: 'Studios, concerts, labels, festivals and creator commerce.' },
  { slug: 'academy', name: 'Academy World', kind: 'education', description: 'Sports, business, technology and creative learning.' },
  { slug: 'middleverse', name: 'The Middleverse', kind: 'hub', description: 'The travel, commerce and event bridge between all worlds.' }
];

module.exports = function registerWorldsApi({ app, auth, clean, id, getStore, saveStore }) {
  const ensure = () => {
    const store = getStore();
    store.worldProfiles ||= [];
    store.worldSessions ||= [];
    store.worldEvents ||= [];
    store.worldAssets ||= [];
    return store;
  };

  app.get('/api/worlds', (_req, res) => {
    const store = ensure();
    const population = Object.fromEntries(WORLD_CATALOG.map(world => [world.slug, store.worldSessions.filter(s => s.worldSlug === world.slug && !s.endedAt).length]));
    res.json({ worlds: WORLD_CATALOG.map(world => ({ ...world, activePlayers: population[world.slug] || 0 })) });
  });

  app.get('/api/worlds/profile', auth, (req, res) => {
    const store = ensure();
    let profile = store.worldProfiles.find(p => p.userId === req.user.id);
    if (!profile) profile = { userId: req.user.id, avatarName: req.user.displayName, reputation: 0, level: 1, xp: 0, homeWorld: 'my-world', inventory: [], skills: {}, createdAt: new Date().toISOString() };
    res.json({ profile });
  });

  app.put('/api/worlds/profile', auth, async (req, res) => {
    const store = ensure();
    let profile = store.worldProfiles.find(p => p.userId === req.user.id);
    if (!profile) {
      profile = { userId: req.user.id, reputation: 0, level: 1, xp: 0, inventory: [], skills: {}, createdAt: new Date().toISOString() };
      store.worldProfiles.push(profile);
    }
    profile.avatarName = clean(req.body.avatarName || req.user.displayName, 60);
    profile.homeWorld = WORLD_CATALOG.some(w => w.slug === req.body.homeWorld) ? req.body.homeWorld : (profile.homeWorld || 'my-world');
    profile.accessibility = {
      voiceControl: Boolean(req.body.accessibility?.voiceControl),
      highContrast: Boolean(req.body.accessibility?.highContrast),
      reducedMotion: Boolean(req.body.accessibility?.reducedMotion),
      oneHandMode: Boolean(req.body.accessibility?.oneHandMode)
    };
    profile.updatedAt = new Date().toISOString();
    await saveStore();
    res.json({ profile });
  });

  app.post('/api/worlds/:slug/enter', auth, async (req, res) => {
    const world = WORLD_CATALOG.find(w => w.slug === req.params.slug);
    if (!world) return res.status(404).json({ error: 'World not found' });
    const store = ensure();
    store.worldSessions.filter(s => s.userId === req.user.id && !s.endedAt).forEach(s => { s.endedAt = new Date().toISOString(); });
    const session = { id: id('ws'), userId: req.user.id, worldSlug: world.slug, shard: clean(req.body.shard, 40) || 'global-1', enteredAt: new Date().toISOString(), endedAt: null };
    store.worldSessions.push(session);
    await saveStore();
    res.status(201).json({ session, world, travelToken: id('travel') });
  });

  app.post('/api/worlds/sessions/:sessionId/leave', auth, async (req, res) => {
    const store = ensure();
    const session = store.worldSessions.find(s => s.id === req.params.sessionId && s.userId === req.user.id);
    if (!session) return res.status(404).json({ error: 'World session not found' });
    session.endedAt ||= new Date().toISOString();
    await saveStore();
    res.json({ session });
  });

  app.get('/api/world-events', (_req, res) => {
    const store = ensure();
    const events = store.worldEvents.filter(event => !event.endsAt || new Date(event.endsAt).getTime() > Date.now());
    res.json({ events });
  });

  app.post('/api/world-events', auth, async (req, res) => {
    if (!req.user.isCreator && req.user.role !== 'admin') return res.status(403).json({ error: 'Creator access required' });
    const worldSlug = clean(req.body.worldSlug, 40);
    if (!WORLD_CATALOG.some(w => w.slug === worldSlug)) return res.status(400).json({ error: 'Choose a valid world' });
    const store = ensure();
    const event = {
      id: id('evt'), ownerId: req.user.id, worldSlug,
      title: clean(req.body.title, 100), description: clean(req.body.description, 600),
      startsAt: req.body.startsAt || new Date().toISOString(), endsAt: req.body.endsAt || null,
      eventType: clean(req.body.eventType, 40) || 'community', capacity: Math.max(1, Math.min(100000, Number(req.body.capacity || 100))),
      createdAt: new Date().toISOString()
    };
    if (!event.title) return res.status(400).json({ error: 'Event title is required' });
    store.worldEvents.push(event);
    await saveStore();
    res.status(201).json({ event });
  });
};
