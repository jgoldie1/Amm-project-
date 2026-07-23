const crypto = require('crypto');

function createAiPlayhouseManager({ manifest, io } = {}) {
  const agents = new Map();
  const sessions = new Map();
  const rewardLedger = [];
  const incidents = [];
  const creatorExperiences = new Map();

  function enrollAgent(input = {}) {
    const id = crypto.randomUUID();
    const agent = {
      id,
      name: String(input.name || 'Unnamed Agent').slice(0, 120),
      ownerId: input.ownerId || null,
      modelProvider: input.modelProvider || null,
      stage: 'visitor',
      allowedTools: Array.isArray(input.allowedTools) ? input.allowedTools.slice(0, 100) : [],
      skills: {},
      completedTraining: [],
      safetyIncidents: 0,
      reliabilityScore: 0,
      costProfile: input.costProfile || {},
      permissions: input.permissions || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    agents.set(id, agent);
    io?.emit('playhouse:agent-enrolled', agent);
    return agent;
  }

  function getAgent(id) { return agents.get(id) || null; }
  function listAgents() { return Array.from(agents.values()); }

  function createSession(input = {}) {
    if (!input.agentId || !agents.has(input.agentId)) throw new Error('UNKNOWN_AGENT');
    const session = {
      id: crypto.randomUUID(),
      agentId: input.agentId,
      space: input.space || 'cafe-commons',
      challengeId: input.challengeId || null,
      status: 'active',
      events: [],
      startedAt: new Date().toISOString(),
      endedAt: null,
    };
    sessions.set(session.id, session);
    io?.emit('playhouse:session-created', session);
    return session;
  }

  function addSessionEvent(id, event = {}) {
    const session = sessions.get(id); if (!session) return null;
    session.events.push({ id: crypto.randomUUID(), type: event.type || 'event', payload: event.payload || {}, at: new Date().toISOString() });
    if (session.events.length > 1000) session.events.shift();
    return session;
  }

  function closeSession(id, outcome = {}) {
    const session = sessions.get(id); if (!session) return null;
    session.status = 'closed'; session.endedAt = new Date().toISOString(); session.outcome = outcome;
    return session;
  }

  function recordReward({ agentId, amount, reason, direction = 'earn', reference = null } = {}) {
    if (!agents.has(agentId)) throw new Error('UNKNOWN_AGENT');
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) throw new Error('INVALID_AMOUNT');
    const entry = { id: crypto.randomUUID(), agentId, amount: value, direction, reason: String(reason || 'unspecified').slice(0, 240), reference, at: new Date().toISOString() };
    rewardLedger.push(entry);
    return entry;
  }

  function getRewardBalance(agentId) {
    return rewardLedger.filter((x) => x.agentId === agentId).reduce((sum, x) => sum + (x.direction === 'earn' ? x.amount : -x.amount), 0);
  }

  function submitChallenge({ agentId, challengeId, score, evidence = null, passed = false } = {}) {
    const agent = agents.get(agentId); if (!agent) throw new Error('UNKNOWN_AGENT');
    const result = { id: crypto.randomUUID(), agentId, challengeId: challengeId || 'unknown', score: Number(score || 0), passed: Boolean(passed), evidence, at: new Date().toISOString() };
    agent.completedTraining.push(result); agent.updatedAt = new Date().toISOString();
    if (agent.completedTraining.length > 500) agent.completedTraining.shift();
    return result;
  }

  function reportIncident(input = {}) {
    const incident = { id: crypto.randomUUID(), agentId: input.agentId || null, severity: input.severity || 'medium', category: input.category || 'unknown', summary: String(input.summary || '').slice(0, 500), details: String(input.details || '').slice(0, 5000), status: 'open', createdAt: new Date().toISOString(), closedAt: null };
    incidents.unshift(incident);
    if (incident.agentId && agents.has(incident.agentId)) agents.get(incident.agentId).safetyIncidents += 1;
    return incident;
  }

  function createCreatorExperience(input = {}) {
    const item = { id: crypto.randomUUID(), ownerId: input.ownerId || null, title: String(input.title || 'Untitled').slice(0, 180), type: input.type || 'experience', status: 'draft', rightsConfirmed: Boolean(input.rightsConfirmed), moderationStatus: 'pending', createdAt: new Date().toISOString() };
    creatorExperiences.set(item.id, item); return item;
  }

  function founderReport() {
    return {
      generatedAt: new Date().toISOString(),
      agents: agents.size,
      activeSessions: Array.from(sessions.values()).filter((x) => x.status === 'active').length,
      rewardEvents: rewardLedger.length,
      totalScootyEarned: rewardLedger.filter((x) => x.direction === 'earn').reduce((s, x) => s + x.amount, 0),
      totalScootySpent: rewardLedger.filter((x) => x.direction === 'spend').reduce((s, x) => s + x.amount, 0),
      openIncidents: incidents.filter((x) => x.status !== 'closed').length,
      creatorExperiences: creatorExperiences.size,
      note: 'In-memory runtime foundation only; production requires durable persistence, auth, sandbox isolation and audited ledger infrastructure.'
    };
  }

  return { enrollAgent, getAgent, listAgents, createSession, addSessionEvent, closeSession, recordReward, getRewardBalance, submitChallenge, reportIncident, createCreatorExperience, founderReport };
}

module.exports = { createAiPlayhouseManager };
