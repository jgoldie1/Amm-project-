'use strict';

(() => {
  const commands = [
    { label: 'Watch Live', keywords: 'live rooms watch stream', action: () => document.querySelector('#live')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Go Live', keywords: 'creator broadcast camera start live', action: () => document.querySelector('#goLiveButton')?.click() },
    { label: 'Enter Living Worlds', keywords: 'worlds faith hub lion kingdom portal', href: '/living-worlds.html' },
    { label: 'Open Vocal Studio', keywords: 'music audio tracks recording studio', href: '/vocal-studio.html' },
    { label: 'Open HoloGPT', keywords: 'ai stubbs assistant chat', action: () => document.querySelector('#openHoloGPT')?.click() },
    { label: 'Games and GameVerse', keywords: 'games sports gameverse play', href: '/omniverse-sports.html' },
    { label: 'Marketplace', keywords: 'shop products services commerce', action: () => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Creator Dashboard', keywords: 'dashboard earnings account creator', action: () => document.querySelector('#dashboard')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Wallet and Earnings', keywords: 'wallet money balance earnings', action: () => document.querySelector('#earn')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Install TryAMM', keywords: 'install app home screen pwa', action: () => document.querySelector('#installAppButton')?.click() }
  ];

  const input = document.querySelector('#omniBoxInput');
  const results = document.querySelector('#omniBoxResults');
  const status = document.querySelector('#omniBoxStatus');
  if (!input || !results) return;

  function run(command) {
    status.textContent = `Opening ${command.label}`;
    if (command.href) window.location.href = command.href;
    else command.action?.();
    input.value = '';
    render('');
  }

  function render(query) {
    const normalized = query.trim().toLowerCase();
    const matches = commands.filter((command) => !normalized || `${command.label} ${command.keywords}`.toLowerCase().includes(normalized));
    results.replaceChildren(...matches.map((command) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'omni-command';
      button.textContent = command.label;
      button.addEventListener('click', () => run(command));
      return button;
    }));
    status.textContent = `${matches.length} command${matches.length === 1 ? '' : 's'} available`;
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const first = commands.find((command) => `${command.label} ${command.keywords}`.toLowerCase().includes(input.value.trim().toLowerCase()));
      if (first) run(first);
    }
    if (event.key === 'Escape') input.value = '';
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      input.focus();
      input.select();
    }
  });

  render('');
})();
