'use strict';

const fs = require('fs');
const path = require('path');

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'config', name), 'utf8'));
}

module.exports = function registerGameWorldRuntime({ app, auth, clean, id, getStore, saveStore }) {
  const worlds = load('worlds.json');
  const features = load('features.json');
  const games = features.filter(feature => feature.domain === 'gaming');
  const store = getStore();
  if (!Array.isArray(store.gameSessions)) store.gameSessions = [];
  if (!Array.isArray(store.worldVisits)) store.worldVisits = [];

  app.get('/api/beta/worlds', (_req, res) => {
    const livingWorlds = worlds.filter(world => world.category === 'living-world');
    const connectedUniverses = worlds.filter(world => world.category !== 'living-world');
    res.json({ livingWorldCount: livingWorlds.length, livingWorlds, connectedUniverses });
  });

  app.get('/api/beta/games', (req, res) => {
    const worldId = clean(req.query.worldId, 80);
    const ageLane = clean(req.query.ageLane, 20) || 'adult';
    const visible = games.filter(game => {
      const worldAllowed = !worldId || (game.worlds || []).includes(worldId);
      const ageAllowed = !game.ageLanes || game.ageLanes.includes(ageLane);
      return worldAllowed && ageAllowed;
    });
    res.json({ count: visible.length, games: visible });
  });

  app.post('/api/beta/worlds/:worldId/enter', auth, async (req, res) => {
    const world = worlds.find(item => item.id === req.params.worldId);
    if (!world) return res.status(404).json({ error: 'World not found' });
    const visit = {
      id: id('visit'),
      userId: req.user.id,
      worldId: world.id,
      worldName: world.name,
      mode: clean(req.body.mode, 20) || '3d',
      status: 'active',
      enteredAt: new Date().toISOString()
    };
    store.worldVisits.push(visit);
    await saveStore();
    res.status(201).json({ visit, games: games.filter(game => (game.worlds || []).includes(world.id)) });
  });

  app.post('/api/beta/games/:gameId/sessions', auth, async (req, res) => {
    const game = games.find(item => item.id === req.params.gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    const worldId = clean(req.body.worldId, 80) || (game.worlds || [])[0];
    const world = worlds.find(item => item.id === worldId);
    if (!world || !(game.worlds || []).includes(worldId)) {
      return res.status(400).json({ error: 'Game is not available in the selected world' });
    }
    const session = {
      id: id('game'),
      userId: req.user.id,
      gameId: game.id,
      gameName: game.name,
      worldId,
      mode: clean(req.body.mode, 20) || '3d',
      input: clean(req.body.input, 30) || 'keyboard-touch',
      status: 'ready',
      score: 0,
      rewardsPending: 0,
      createdAt: new Date().toISOString()
    };
    store.gameSessions.push(session);
    await saveStore();
    res.status(201).json({ session, launch: { runtime: 'web-beta-shell', nativeBuildRequired: true } });
  });

  app.post('/api/beta/games/sessions/:sessionId/complete', auth, async (req, res) => {
    const session = store.gameSessions.find(item => item.id === req.params.sessionId && item.userId === req.user.id);
    if (!session) return res.status(404).json({ error: 'Game session not found' });
    if (session.status === 'completed') return res.json({ session, duplicate: true });
    session.status = 'completed';
    session.score = Math.max(0, Math.min(1000000, Number(req.body.score || 0)));
    session.rewardsPending = Math.max(0, Math.min(1000, Math.floor(session.score / 1000)));
    session.completedAt = new Date().toISOString();
    await saveStore();
    res.json({ session, note: 'Rewards remain non-withdrawable until the economy and anti-fraud gates approve them.' });
  });

  app.get('/api/beta/journey', auth, (req, res) => {
    const herrin = worlds.find(world => world.id === 'herrin');
    const quantumTag = games.find(game => game.id === 'gaming.quantum-tag');
    res.json({
      releaseTruth: 'web-beta-shell',
      journey: [
        { step: 1, action: 'enter-globe', destination: herrin },
        { step: 2, action: 'launch-game', game: quantumTag },
        { step: 3, action: 'visit-store', featureId: 'commerce.store-builder' },
        { step: 4, action: 'join-live', featureId: 'media.live' },
        { step: 5, action: 'inspect-wallet', endpoint: '/api/wallet' }
      ]
    });
  });
};
