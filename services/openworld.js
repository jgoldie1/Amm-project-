const crypto = require('crypto');

const ACTIONS = ['attack', 'heavy', 'block', 'shield', 'dodge', 'faith', 'holo'];
const DECKS = {
  faith: [
    { id: 'faith-courage', title: 'Courage', effect: 'heal', power: 18, cooldown: 3 },
    { id: 'faith-wisdom', title: 'Wisdom Guard', effect: 'shield', power: 28, cooldown: 4 },
    { id: 'faith-unity', title: 'Unity Pulse', effect: 'buff', power: 12, cooldown: 3 },
    { id: 'faith-restoration', title: 'Restoration', effect: 'heal', power: 32, cooldown: 6 }
  ],
  holographic: [
    { id: 'holo-decoy', title: 'Holo Decoy', effect: 'dodge', power: 1, cooldown: 3 },
    { id: 'holo-lance', title: 'Photon Lance', effect: 'damage', power: 30, cooldown: 4 },
    { id: 'holo-wall', title: 'Prism Wall', effect: 'shield', power: 38, cooldown: 5 },
    { id: 'holo-scan', title: 'Quantum Scan', effect: 'critical', power: 20, cooldown: 4 }
  ]
};

function id(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function newSession(input = {}) {
  return {
    id: id('world'),
    playerId: String(input.playerId || 'demo-player'),
    district: String(input.district || 'Creator City'),
    position: { x: 0, y: 0, z: 0 },
    player: { health: 100, shield: 50, stamina: 100, faith: 60, combo: 0 },
    enemy: { id: 'sentinel-01', health: 120, shield: 25, state: 'patrol' },
    cooldowns: {},
    inventory: ['faith-courage', 'faith-wisdom', 'holo-decoy', 'holo-lance'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function resolveDamage(target, amount, blocking = false) {
  let damage = Math.max(0, Number(amount) || 0);
  if (blocking) damage *= 0.35;
  const absorbed = Math.min(target.shield || 0, damage);
  target.shield = clamp((target.shield || 0) - absorbed, 0, 999);
  damage -= absorbed;
  target.health = clamp((target.health || 0) - damage, 0, 999);
  return { damage: Math.round(damage), absorbed: Math.round(absorbed) };
}

function useCard(session, cardId) {
  const card = [...DECKS.faith, ...DECKS.holographic].find((item) => item.id === cardId);
  if (!card) throw new Error('Unknown deck card.');
  if (!session.inventory.includes(cardId)) throw new Error('Card is not in the active deck.');
  if ((session.cooldowns[cardId] || 0) > 0) throw new Error('Card is cooling down.');

  let result = { card };
  if (card.effect === 'heal') session.player.health = clamp(session.player.health + card.power, 0, 100);
  if (card.effect === 'shield') session.player.shield = clamp(session.player.shield + card.power, 0, 100);
  if (card.effect === 'damage') result = { ...result, ...resolveDamage(session.enemy, card.power, false) };
  if (card.effect === 'dodge') session.player.dodgeReady = true;
  if (card.effect === 'buff') session.player.faith = clamp(session.player.faith + card.power, 0, 100);
  if (card.effect === 'critical') session.player.criticalReady = true;
  session.cooldowns[cardId] = card.cooldown;
  return result;
}

function tickCooldowns(session) {
  for (const key of Object.keys(session.cooldowns)) {
    session.cooldowns[key] = Math.max(0, session.cooldowns[key] - 1);
  }
}

function act(session, input = {}) {
  const action = String(input.action || 'attack');
  if (!ACTIONS.includes(action)) throw new Error('Unknown combat action.');
  if (session.status !== 'active') throw new Error('Session is not active.');

  tickCooldowns(session);
  const event = { action, timestamp: new Date().toISOString(), audioCue: action, haptic: 'medium' };

  if (action === 'attack' || action === 'heavy') {
    const staminaCost = action === 'heavy' ? 24 : 10;
    if (session.player.stamina < staminaCost) throw new Error('Not enough stamina.');
    session.player.stamina -= staminaCost;
    const base = action === 'heavy' ? 28 : 14;
    const critical = session.player.criticalReady ? 1.75 : 1;
    session.player.criticalReady = false;
    Object.assign(event, resolveDamage(session.enemy, base * critical, false));
    session.player.combo += 1;
    event.haptic = action === 'heavy' ? 'heavy' : 'medium';
  } else if (action === 'block') {
    session.player.blocking = true;
    session.player.stamina = clamp(session.player.stamina - 6, 0, 100);
    event.haptic = 'light';
  } else if (action === 'shield') {
    if (session.player.faith < 12) throw new Error('Not enough faith energy.');
    session.player.faith -= 12;
    session.player.shield = clamp(session.player.shield + 22, 0, 100);
  } else if (action === 'dodge') {
    if (session.player.stamina < 18) throw new Error('Not enough stamina.');
    session.player.stamina -= 18;
    session.player.dodgeReady = true;
    event.haptic = 'light';
  } else {
    Object.assign(event, useCard(session, String(input.cardId || '')));
  }

  if (session.enemy.health > 0 && !session.player.dodgeReady) {
    const enemyHit = resolveDamage(session.player, 9 + Math.floor(Math.random() * 10), Boolean(session.player.blocking));
    event.enemyCounter = enemyHit;
  } else if (session.player.dodgeReady) {
    event.enemyCounter = { dodged: true };
  }

  session.player.blocking = false;
  session.player.dodgeReady = false;
  session.player.stamina = clamp(session.player.stamina + 8, 0, 100);
  session.player.faith = clamp(session.player.faith + 3, 0, 100);
  if (session.enemy.health <= 0) session.status = 'victory';
  if (session.player.health <= 0) session.status = 'defeat';
  session.updatedAt = new Date().toISOString();
  return { session, event };
}

module.exports = { ACTIONS, DECKS, newSession, act };
