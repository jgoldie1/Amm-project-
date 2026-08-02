'use strict';

const PACKS = [
  { id: 'creator', name: 'Creator Pack', doors: ['create','live','music','isaiah-tv'], worlds: ['creator','earth'] },
  { id: 'gamer', name: 'Gamer Pack', doors: ['play','enter-globe'], worlds: ['herrin','sports','nature','timeline','starverse'] },
  { id: 'business', name: 'Business Pack', doors: ['shop','work'], worlds: ['business','earth','creator'] },
  { id: 'university', name: 'University Pack', doors: ['learn','work'], worlds: ['university','workforce','earth'] },
  { id: 'access', name: 'Universal Access Pack', doors: ['transit','translation','accessibility'], worlds: ['earth','herrin','sports','university'] }
];

module.exports = function registerCompetitiveMoat({ app, auth, clean, id, getStore, saveStore }) {
  app.get('/api/packs', (_req, res) => res.json({ packs: PACKS }));

  app.get('/api/profile/packs', auth, (req, res) => {
    res.json({ selected: req.user.selectedPacks || ['creator','gamer','access'], available: PACKS });
  });

  app.put('/api/profile/packs', auth, async (req, res) => {
    const requested = Array.isArray(req.body.packIds) ? req.body.packIds.map(value => clean(value, 40)) : [];
    const valid = [...new Set(requested.filter(packId => PACKS.some(pack => pack.id === packId)))];
    req.user.selectedPacks = valid.length ? valid : ['access'];
    await saveStore();
    res.json({ selected: req.user.selectedPacks });
  });

  app.get('/api/progression', auth, (req, res) => {
    const store = getStore();
    const sessions = (store.gameSessions || []).filter(item => item.userId === req.user.id);
    const visits = (store.worldVisits || []).filter(item => item.userId === req.user.id);
    const achievements = [...new Set([
      ...(sessions.length ? ['first-game-session'] : []),
      ...(visits.length ? ['first-world-visit'] : []),
      ...(visits.some(item => item.worldId === 'herrin') ? ['herrin-traveler'] : []),
      ...(sessions.some(item => item.gameId === 'gaming.open-city') ? ['open-city-citizen'] : []),
      ...(sessions.some(item => item.gameId === 'gaming.his-hers-sports') ? ['two-league-athlete'] : [])
    ])];
    res.json({
      userId: req.user.id,
      worldVisits: visits.length,
      gameSessions: sessions.length,
      achievements,
      portableAcrossWorlds: true,
      cashConversionEnabled: false
    });
  });

  app.get('/api/inventory', auth, (req, res) => {
    const store = getStore();
    const items = (store.inventory || []).filter(item => item.userId === req.user.id);
    res.json({ items, portableAcrossEligibleWorlds: true, exportable: true });
  });

  app.post('/api/inventory', auth, async (req, res) => {
    const store = getStore();
    store.inventory = store.inventory || [];
    const item = {
      id: id('item'),
      userId: req.user.id,
      type: clean(req.body.type, 40) || 'digital-asset',
      name: clean(req.body.name, 120) || 'Untitled asset',
      sourceWorld: clean(req.body.sourceWorld, 60) || 'earth',
      eligibleWorlds: Array.isArray(req.body.eligibleWorlds) ? req.body.eligibleWorlds.map(value => clean(value, 60)) : [],
      rightsOwner: req.user.id,
      exportStatus: 'user-exportable',
      createdAt: new Date().toISOString()
    };
    store.inventory.push(item);
    await saveStore();
    res.status(201).json({ item });
  });

  app.get('/api/recommendation-controls', auth, (req, res) => res.json({
    chronologicalFeed: true,
    resetRecommendations: true,
    interestControls: true,
    sensitiveTopicControls: true,
    explainWhyShown: true,
    selectedPacks: req.user.selectedPacks || []
  }));
};
