'use strict';

const token = localStorage.getItem('tryamm_token') || localStorage.getItem('token') || '';
const messages = document.getElementById('messages');
const prompt = document.getElementById('prompt');
const composer = document.getElementById('composer');
const statusText = document.getElementById('status');
let agent = 'hologpt';
let conversationId = '';

function addMessage(role, text) {
  const node = document.createElement('div');
  node.className = `message ${role}`;
  node.textContent = text;
  messages.appendChild(node);
  messages.scrollTop = messages.scrollHeight;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${token}`, ...(options.headers || {}) }
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

async function loadStatus() {
  try {
    const response = await fetch('/api/ai/status');
    const body = await response.json();
    const active = Object.entries(body.providers).filter(([, enabled]) => enabled).map(([name]) => name);
    statusText.textContent = `Online • available providers: ${active.join(', ')}`;
  } catch {
    statusText.textContent = 'AI status unavailable';
  }
}

document.querySelectorAll('.agent[data-agent]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.agent[data-agent]').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    agent = button.dataset.agent;
    conversationId = '';
    messages.replaceChildren();
    addMessage('assistant', agent === 'hologpt' ? 'HoloGPT ready. What are we creating or launching?' : 'Stubbs AI ready. What operation, engineering or funding decision should we work on?');
  });
});

document.getElementById('newConversation').addEventListener('click', () => {
  conversationId = '';
  messages.replaceChildren();
  addMessage('assistant', 'New private conversation started.');
});

composer.addEventListener('submit', async (event) => {
  event.preventDefault();
  const text = prompt.value.trim();
  if (!text) return;
  if (!token) {
    addMessage('assistant', 'Please sign in on the TryAMM homepage first.');
    return;
  }
  prompt.value = '';
  addMessage('user', text);
  const button = composer.querySelector('button');
  button.disabled = true;
  try {
    const body = await api('/api/ai/chat', { method: 'POST', body: JSON.stringify({ agent, message: text, conversationId }) });
    conversationId = body.conversationId;
    addMessage('assistant', body.message.content);
    statusText.textContent = `${body.agent.name} • ${body.provider}`;
  } catch (error) {
    addMessage('assistant', error.message);
  } finally {
    button.disabled = false;
    prompt.focus();
  }
});

loadStatus();
addMessage('assistant', 'HoloGPT ready. What are we creating or launching?');
