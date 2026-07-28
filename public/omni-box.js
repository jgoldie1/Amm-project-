'use strict';

(() => {
  const commands = [
    { label: 'Watch Live', hint: 'Browse active rooms', icon: '◉', keywords: 'live rooms watch stream', action: () => document.querySelector('#live')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Go Live', hint: 'Start your broadcast', icon: '⌁', keywords: 'creator broadcast camera start live', action: () => document.querySelector('#goLiveButton')?.click() },
    { label: 'Enter Living Worlds', hint: 'Faith Hub and portals', icon: '✦', keywords: 'worlds faith hub lion kingdom portal', href: '/living-worlds.html' },
    { label: 'Open Vocal Studio', hint: 'Music and audio tracks', icon: '♫', keywords: 'music audio tracks recording studio', href: '/vocal-studio.html' },
    { label: 'Open HoloGPT', hint: 'Talk with Stubbs AI', icon: '◇', keywords: 'ai stubbs assistant chat', action: () => document.querySelector('#openHoloGPT')?.click() },
    { label: 'Games and GameVerse', hint: 'Play and explore', icon: '⬡', keywords: 'games sports gameverse play', href: '/omniverse-sports.html' },
    { label: 'Marketplace', hint: 'Products and services', icon: '▣', keywords: 'shop products services commerce', action: () => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Creator Dashboard', hint: 'Account and creator tools', icon: '♛', keywords: 'dashboard earnings account creator', action: () => document.querySelector('#dashboard')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Wallet and Earnings', hint: 'Balance and income', icon: '$', keywords: 'wallet money balance earnings', action: () => document.querySelector('#earn')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'Install TryAMM', hint: 'Add app to your device', icon: '⇩', keywords: 'install app home screen pwa', action: () => document.querySelector('#installAppButton')?.click() }
  ];

  const input = document.querySelector('#omniBoxInput');
  const results = document.querySelector('#omniBoxResults');
  const status = document.querySelector('#omniBoxStatus');
  const box = input?.closest('.omni-box');
  if (!input || !results) return;

  function run(command) {
    if (status) status.textContent = `Opening ${command.label}`;
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
      const icon = document.createElement('span');
      const copy = document.createElement('span');
      const label = document.createElement('span');
      const hint = document.createElement('span');

      button.type = 'button';
      button.className = 'omni-command';
      icon.className = 'omni-command-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = command.icon;
      label.className = 'omni-command-label';
      label.textContent = command.label;
      hint.className = 'omni-command-hint';
      hint.textContent = command.hint;
      copy.append(label, hint);
      button.append(icon, copy);
      button.addEventListener('click', () => run(command));
      return button;
    }));
    if (status) status.textContent = `${matches.length} holographic command${matches.length === 1 ? '' : 's'} available`;
  }

  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const first = commands.find((command) => `${command.label} ${command.keywords}`.toLowerCase().includes(input.value.trim().toLowerCase()));
      if (first) run(first);
    }
    if (event.key === 'Escape') {
      input.value = '';
      render('');
    }
  });

  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      input.focus();
      input.select();
    }
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (box && !reduceMotion.matches) {
    box.addEventListener('pointermove', (event) => {
      const bounds = box.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      box.style.setProperty('--holo-x', `${x * 100}%`);
      box.style.setProperty('--holo-y', `${y * 100}%`);
      box.style.setProperty('--holo-tilt-x', `${(x - 0.5) * 2.4}deg`);
      box.style.setProperty('--holo-tilt-y', `${(0.5 - y) * 2}deg`);
    });
    box.addEventListener('pointerleave', () => {
      box.style.setProperty('--holo-x', '50%');
      box.style.setProperty('--holo-y', '42%');
      box.style.setProperty('--holo-tilt-x', '0deg');
      box.style.setProperty('--holo-tilt-y', '0deg');
    });
  }

  render('');
})();