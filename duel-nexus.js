'use strict';

const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/duel-nexus.json'), 'utf8'));

module.exports = function registerDuelNexus({ app, auth, clean, id, getStore, saveStore }) {
  app.get('/api/duel/config', (_req, res) => res.json(config));

  app.get('/api/duel/decks', auth, (req, res) => {
    const store = getStore();
    res.json({ decks: (store.duelDecks || []).filter(deck => deck.userId === req.user.id) });
  });

  app.post('/api/duel/decks', auth, async (req, res) => {
    const cards = Array.isArray(req.body.cards) ? req.body.cards : [];
    if (cards.length < config.deckRules.minimumCards || cards.length > config.deckRules.maximumCards) {
      return res.status(400).json({ error: `Deck must contain ${config.deckRules.minimumCards}-${config.deckRules.maximumCards} cards` });
    }
    const counts = new Map();
    for (const rawCard of cards) {
      const cardId = clean(rawCard.cardId, 80);
      const rightsStatus = clean(rawCard.rightsStatus, 40);
      if (!cardId || !['original-tryamm', 'creator-approved', 'public-domain', 'licensed'].includes(rightsStatus)) {
        return res.status(400).json({ error: 'Every card requires an approved rights status' });
      }
      counts.set(cardId, (counts.get(cardId) || 0) + 1);
      if (counts.get(cardId) > config.deckRules.maximumCopiesPerCard) {
        return res.status(400).json({ error: `Too many copies of card ${cardId}` });
      }
    }
    const store = getStore();
    store.duelDecks = store.duelDecks || [];
    const deck = {
      id: id('deck'), userId: req.user.id,
      name: clean(req.body.name, 100) || 'Untitled Deck',
      cards: cards.map(card => ({ cardId: clean(card.cardId, 80), rightsStatus: clean(card.rightsStatus, 40) })),
      validation: 'server-approved', createdAt: new Date().toISOString()
    };
    store.duelDecks.push(deck);
    await saveStore();
    res.status(201).json({ deck });
  });

  app.post('/api/duel/matchmaking', auth, async (req, res) => {
    const mode = clean(req.body.mode, 30);
    if (!config.modes.includes(mode)) return res.status(400).json({ error: 'Unsupported duel mode' });
    const store = getStore();
    const deck = (store.duelDecks || []).find(item => item.id === clean(req.body.deckId, 80) && item.userId === req.user.id);
    if (!deck) return res.status(404).json({ error: 'Approved deck not found' });
    store.duelQueue = store.duelQueue || [];
    const ticket = { id: id('queue'), userId: req.user.id, deckId: deck.id, mode, region: clean(req.body.region, 40) || 'global', state: 'queued', createdAt: new Date().toISOString() };
    store.duelQueue.push(ticket);
    await saveStore();
    res.status(201).json({ ticket });
  });

  app.post('/api/duel/matches', auth, async (req, res) => {
    const store = getStore();
    store.duelMatches = store.duelMatches || [];
    const opponentId = clean(req.body.opponentId, 80);
    if (!opponentId || opponentId === req.user.id) return res.status(400).json({ error: 'A different opponent is required' });
    const match = {
      id: id('duel'), mode: clean(req.body.mode, 30) || 'casual', arena: clean(req.body.arena, 50) || 'digital-arena',
      players: [req.user.id, opponentId], activePlayerId: req.user.id, turnNumber: 1,
      turnNonce: id('turn'), state: 'active', actions: [], createdAt: new Date().toISOString(),
      rewardPolicy: 'non-withdrawable-until-integrity-approved'
    };
    store.duelMatches.push(match);
    await saveStore();
    res.status(201).json({ match });
  });

  app.post('/api/duel/matches/:matchId/actions', auth, async (req, res) => {
    const store = getStore();
    const match = (store.duelMatches || []).find(item => item.id === req.params.matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    if (!match.players.includes(req.user.id)) return res.status(403).json({ error: 'Not a match participant' });
    if (match.state !== 'active') return res.status(409).json({ error: 'Match is not active' });
    if (match.activePlayerId !== req.user.id) return res.status(409).json({ error: 'Not your turn' });
    const turnNonce = clean(req.body.turnNonce, 100);
    const actionId = clean(req.body.actionId, 100);
    if (turnNonce !== match.turnNonce) return res.status(409).json({ error: 'Stale or invalid turn nonce' });
    if (!actionId || match.actions.some(action => action.actionId === actionId)) return res.status(409).json({ error: 'Duplicate or missing action ID' });
    const action = { actionId, userId: req.user.id, type: clean(req.body.type, 40), payload: req.body.payload || {}, turnNumber: match.turnNumber, createdAt: new Date().toISOString() };
    match.actions.push(action);
    match.turnNumber += 1;
    match.activePlayerId = match.players.find(playerId => playerId !== req.user.id);
    match.turnNonce = id('turn');
    await saveStore();
    res.json({ accepted: true, action, nextTurn: { playerId: match.activePlayerId, turnNumber: match.turnNumber, turnNonce: match.turnNonce } });
  });

  app.post('/api/duel/matches/:matchId/complete', auth, async (req, res) => {
    const store = getStore();
    const match = (store.duelMatches || []).find(item => item.id === req.params.matchId);
    if (!match || !match.players.includes(req.user.id)) return res.status(404).json({ error: 'Match not found' });
    match.state = 'completed';
    match.winnerId = clean(req.body.winnerId, 80);
    match.completedAt = new Date().toISOString();
    match.replay = { deterministic: true, actionCount: match.actions.length, verification: 'pending-integrity-review' };
    await saveStore();
    res.json({ match });
  });

  app.get('/api/duel/matches/:matchId/replay', auth, (req, res) => {
    const store = getStore();
    const match = (store.duelMatches || []).find(item => item.id === req.params.matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json({ matchId: match.id, actions: match.actions, replay: match.replay || { verification: 'match-in-progress' }, broadcastEligible: match.state === 'completed' });
  });
};
