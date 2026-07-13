const messages = document.querySelector('#messages');
const form = document.querySelector('#composer');
const input = document.querySelector('#message');
const mode = document.querySelector('#mode');
const statusEl = document.querySelector('#status');
const micButton = document.querySelector('#mic');
const speakToggle = document.querySelector('#speak-toggle');

let conversationId = localStorage.getItem('ammConversationId') || crypto.randomUUID();
localStorage.setItem('ammConversationId', conversationId);
let lastAssistantMessageId = null;

function addMessage(role, text, meta = {}) {
  const article = document.createElement('article');
  article.className = `message ${role}`;
  article.innerHTML = `
    <div class="message-label">${