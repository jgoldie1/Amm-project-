const chat = document.querySelector('#chat');
const form = document.querySelector('#composer');
const input = document.querySelector('#messageInput');
const sendButton = document.querySelector('#sendButton');
const speakButton = document.querySelector('#speakButton');
const readButton = document.querySelector('#readButton');
const statusDot = document.querySelector('#statusDot');
const statusText = document.querySelector('#statusText');
const largeControls = document.querySelector('#largeControls');
const reducedMotion = document.querySelector('#reducedMotion');

let mode = localStorage.getItem('ammMode') || 'quick';
let history = [];
let lastAnswer = '';

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function setMode(nextMode) {
  mode = nextMode;
  localStorage.setItem('ammMode', mode);
  document.querySelectorAll('.mode').forEach((button) => {
    const active = button.dataset.mode === mode;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderSources(sources = []) {
  if (!sources.length) return '';
  return `<div class="sources"><strong>Approved sources</strong>${sources.map((source) =>
    `<span>${escapeHtml(source.title)} · ${escapeHtml(source.category)}</span>`
  ).join('')}</div>`;
}

function addMessage(role, text, meta = {}) {
  const article = document.createElement('article');
  article.className = `message ${role}`;
  const label = role === 'assistant' ? 'AMM Intelligence' : 'You';
  article.innerHTML = `
    <div class="avatar" aria-hidden="true">${role === 'assistant' ? 'A' : 'Y'}</div>
    <div class="bubble">
      <strong>${label}</strong>
      <p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>
      ${renderSources(meta.sources)}
      ${role === 'assistant' ? `<div class="feedback"><button data-rating="up" aria-label="Helpful answer">👍</button><button data-rating="down" aria-label="Unhelpful answer">👎</button><small>${escapeHtml(meta.provider || '')}</small></div>` : ''}
    </div>`;

  if (role === 'assistant') {
    article.querySelectorAll('[data-rating]').forEach((button) => {
      button.addEventListener('click', async () => {
        const rating = button.dataset.rating;
        const reason = rating === 'down' ? (prompt('What was wrong with the answer?') || '') : '';
        await fetch('/api/ai/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating,
            mode,
            question: history.at(-2)?.content || '',
            answer: text,
            reason
          })
        });
        article.querySelector('.feedback').innerHTML = '<small>Feedback saved. Thank you.</small>';
      });
    });
  }

  chat.appendChild(article);
  chat.scrollTop = chat.scrollHeight;
}

async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    statusDot.classList.add('online');
    statusText.textContent = data.providerConnected ? 'AI provider connected' : 'Local knowledge mode';
  } catch {
    statusDot.classList.remove('online');
    statusText.textContent = 'Service unavailable';
  }
}

async function sendMessage(message) {
  addMessage('user', message);
  history.push({ role: 'user', content: message });
  sendButton.disabled = true;
  sendButton.textContent = 'Thinking…';

  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, mode, history: history.slice(-8) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    lastAnswer = data.answer;
    history.push({ role: 'assistant', content: data.answer });
    addMessage('assistant', data.answer, { sources: data.sources, provider: data.provider });
  } catch (error) {
    addMessage('assistant', `I could not complete that request: ${error.message}`);
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = 'Send';
    input.focus();
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  input.value = '';
  sendMessage(message);
});

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll('.mode').forEach((button) => {
  button.addEventListener('click', () => setMode(button.dataset.mode));
});

document.querySelectorAll('[data-prompt]').forEach((button) => {
  button.addEventListener('click', () => {
    input.value = button.dataset.prompt;
    form.requestSubmit();
  });
});

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Recognition) {
  const recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.addEventListener('result', (event) => {
    input.value = event.results[0][0].transcript;
    input.focus();
  });
  recognition.addEventListener('end', () => { speakButton.textContent = '🎙 Speak'; });
  speakButton.addEventListener('click', () => {
    speakButton.textContent = 'Listening…';
    recognition.start();
  });
} else {
  speakButton.disabled = true;
  speakButton.title = 'Speech recognition is not supported in this browser.';
}

readButton.addEventListener('click', () => {
  if (!lastAnswer || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  speechSynthesis.speak(new SpeechSynthesisUtterance(lastAnswer));
});

largeControls.addEventListener('change', () => document.body.classList.toggle('large-controls', largeControls.checked));
reducedMotion.addEventListener('change', () => document.body.classList.toggle('reduced-motion', reducedMotion.checked));

setMode(mode);
checkHealth();
