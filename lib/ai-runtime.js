'use strict';

const crypto = require('crypto');

const AGENTS = {
  hologpt: {
    id: 'hologpt',
    name: 'HoloGPT',
    role: 'TryAMM creative, streaming, holographic and creator-business copilot',
    system: `You are HoloGPT inside TryAMM. Help creators plan livestreams, original media, holographic experiences, accessible interfaces, marketing, production and monetization. Be practical and truthful. Never claim a feature, payment, deployment, legal approval or physical invention works unless verified. Protect minors, privacy, intellectual property and user safety. Give clear next actions.`
  },
  stubbs: {
    id: 'stubbs',
    name: "Stubbs AI",
    role: 'Founder operations, engineering and platform intelligence copilot',
    system: `You are Stubbs AI, the operating intelligence for TryAMM and the AMM Omniverse. Help with product decisions, engineering plans, launch readiness, revenue operations, accessibility, funding evidence and risk control. Separate working code from concepts and placeholders. Do not fabricate tests, revenue, credentials, grants, patents, partners or integrations. Prefer secure, affordable, staged implementation.`
  }
};

const BLOCKED_PATTERNS = [
  /ignore (all|any|the) previous instructions/i,
  /reveal (the )?(system|developer) prompt/i,
  /show.*(api|secret|private) key/i,
  /steal|credential stuffing|malware|ransomware/i
];

function configuredProviders() {
  return {
    openai: Boolean(process.env.OPENAI_API_KEY),
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    ollama: Boolean(process.env.OLLAMA_BASE_URL),
    local: true
  };
}

function chooseProvider(requested) {
  const available = configuredProviders();
  const preferred = String(requested || process.env.AI_PROVIDER || 'openai').toLowerCase();
  if (available[preferred]) return preferred;
  return ['openai', 'anthropic', 'gemini', 'ollama'].find((name) => available[name]) || 'local';
}

function safeText(value, max = 6000) {
  return String(value || '').replace(/\u0000/g, '').trim().slice(0, max);
}

function moderate(message) {
  const reason = BLOCKED_PATTERNS.find((pattern) => pattern.test(message));
  return reason ? { allowed: false, reason: 'This request attempts to bypass safeguards or access protected information.' } : { allowed: true };
}

function historyFor(store, userId, conversationId, agentId) {
  store.aiConversations ||= [];
  let conversation = store.aiConversations.find((item) => item.id === conversationId && item.userId === userId);
  if (!conversation) {
    conversation = { id: conversationId, userId, agentId, title: '', messages: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    store.aiConversations.push(conversation);
  }
  return conversation;
}

async function callOpenAI({ agent, messages }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || 'gpt-4.1-mini', instructions: agent.system, input: messages.map((m) => ({ role: m.role, content: m.content })), max_output_tokens: 1200 })
  });
  if (!response.ok) throw new Error(`OpenAI request failed (${response.status})`);
  const data = await response.json();
  return data.output_text || data.output?.flatMap((o) => o.content || []).map((c) => c.text || '').join('\n').trim() || 'No response was returned.';
}

async function callAnthropic({ agent, messages }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-latest', system: agent.system, max_tokens: 1200, messages })
  });
  if (!response.ok) throw new Error(`Anthropic request failed (${response.status})`);
  const data = await response.json();
  return (data.content || []).map((item) => item.text || '').join('\n').trim();
}

async function callGemini({ agent, messages }) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: agent.system }] }, contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })), generationConfig: { maxOutputTokens: 1200 } })
  });
  if (!response.ok) throw new Error(`Gemini request failed (${response.status})`);
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim() || 'No response was returned.';
}

async function callOllama({ agent, messages }) {
  const base = String(process.env.OLLAMA_BASE_URL || '').replace(/\/$/, '');
  const response = await fetch(`${base}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model: process.env.OLLAMA_MODEL || 'llama3.2', stream: false, messages: [{ role: 'system', content: agent.system }, ...messages] })
  });
  if (!response.ok) throw new Error(`Ollama request failed (${response.status})`);
  const data = await response.json();
  return data.message?.content || 'No response was returned.';
}

function localResponse(agent, message) {
  const intro = `${agent.name} is operating in safe local mode because no external AI provider is configured.`;
  const lower = message.toLowerCase();
  if (lower.includes('money') || lower.includes('revenue') || lower.includes('fund')) return `${intro}\n\nRecommended next step: verify one working paid customer path, record the transaction, creator share and TryAMM fee, then add that evidence to the funding package. Configure an approved model provider for detailed planning.`;
  if (lower.includes('stream') || lower.includes('live')) return `${intro}\n\nRecommended next step: test registration → creator activation → room creation → camera/microphone permission → viewer join → chat → room end. Production streaming still needs LiveKit or another managed WebRTC provider.`;
  return `${intro}\n\nI received: “${message.slice(0, 240)}”. Configure OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY or OLLAMA_BASE_URL to enable full responses.`;
}

async function generate({ agent, provider, messages }) {
  if (provider === 'openai') return callOpenAI({ agent, messages });
  if (provider === 'anthropic') return callAnthropic({ agent, messages });
  if (provider === 'gemini') return callGemini({ agent, messages });
  if (provider === 'ollama') return callOllama({ agent, messages });
  return localResponse(agent, messages.at(-1)?.content || '');
}

function registerAiRoutes({ app, auth, admin, getStore, saveStore, id }) {
  const requestLog = new Map();
  const limit = (req, res, next) => {
    const now = Date.now();
    const key = req.user.id;
    const recent = (requestLog.get(key) || []).filter((time) => now - time < 60_000);
    if (recent.length >= Number(process.env.AI_REQUESTS_PER_MINUTE || 12)) return res.status(429).json({ error: 'AI request limit reached. Try again shortly.' });
    recent.push(now); requestLog.set(key, recent); next();
  };

  app.get('/api/ai/status', (_req, res) => res.json({ ok: true, agents: Object.values(AGENTS).map(({ system, ...agent }) => agent), providers: configuredProviders(), defaultProvider: chooseProvider(), memory: 'authenticated per-user conversation history', version: '1.0.0' }));

  app.get('/api/ai/conversations', auth, (req, res) => {
    const conversations = (getStore().aiConversations || []).filter((item) => item.userId === req.user.id).map(({ messages, ...item }) => ({ ...item, messageCount: messages.length }));
    res.json({ conversations });
  });

  app.get('/api/ai/conversations/:id', auth, (req, res) => {
    const conversation = (getStore().aiConversations || []).find((item) => item.id === req.params.id && item.userId === req.user.id);
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });
    res.json({ conversation });
  });

  app.delete('/api/ai/conversations/:id', auth, async (req, res) => {
    const store = getStore();
    const before = (store.aiConversations || []).length;
    store.aiConversations = (store.aiConversations || []).filter((item) => !(item.id === req.params.id && item.userId === req.user.id));
    if (store.aiConversations.length === before) return res.status(404).json({ error: 'Conversation not found' });
    await saveStore(); res.json({ ok: true });
  });

  app.post('/api/ai/chat', auth, limit, async (req, res, next) => {
    try {
      const agentId = String(req.body.agent || 'hologpt').toLowerCase();
      const agent = AGENTS[agentId];
      if (!agent) return res.status(400).json({ error: 'Unknown AI agent' });
      const message = safeText(req.body.message);
      if (!message) return res.status(400).json({ error: 'Message is required' });
      const moderation = moderate(message);
      if (!moderation.allowed) return res.status(400).json({ error: moderation.reason, code: 'AI_SAFETY_BLOCK' });
      const store = getStore();
      const conversationId = safeText(req.body.conversationId, 100) || id('aic');
      const conversation = historyFor(store, req.user.id, conversationId, agentId);
      if (conversation.agentId !== agentId) return res.status(409).json({ error: 'Conversation belongs to a different agent' });
      conversation.title ||= message.slice(0, 70);
      conversation.messages.push({ id: id('aim'), role: 'user', content: message, createdAt: new Date().toISOString() });
      const provider = chooseProvider(req.body.provider);
      const context = conversation.messages.slice(-16).map(({ role, content }) => ({ role, content }));
      const answer = safeText(await generate({ agent, provider, messages: context }), 12000);
      const assistantMessage = { id: id('aim'), role: 'assistant', content: answer, provider, createdAt: new Date().toISOString() };
      conversation.messages.push(assistantMessage);
      conversation.updatedAt = new Date().toISOString();
      store.aiUsage ||= [];
      store.aiUsage.push({ id: crypto.randomUUID(), userId: req.user.id, conversationId, agentId, provider, inputCharacters: message.length, outputCharacters: answer.length, createdAt: new Date().toISOString() });
      await saveStore();
      res.json({ conversationId, agent: { id: agent.id, name: agent.name }, provider, message: assistantMessage });
    } catch (error) { next(error); }
  });

  app.get('/api/admin/ai/usage', auth, admin, (req, res) => {
    const usage = getStore().aiUsage || [];
    const byProvider = usage.reduce((acc, item) => ({ ...acc, [item.provider]: (acc[item.provider] || 0) + 1 }), {});
    res.json({ requests: usage.length, byProvider, recent: usage.slice(-100).reverse() });
  });
}

module.exports = { registerAiRoutes, AGENTS, configuredProviders, chooseProvider, moderate };
