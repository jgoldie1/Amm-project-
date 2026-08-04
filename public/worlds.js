(() => {
  const grid = document.getElementById('worldGrid');
  const activePlayers = document.getElementById('activePlayers');
  const worldCount = document.getElementById('worldCount');
  const dialog = document.getElementById('worldDialog');
  const title = document.getElementById('dialogTitle');
  const kind = document.getElementById('dialogKind');
  const description = document.getElementById('dialogDescription');
  const message = document.getElementById('dialogMessage');
  const enter = document.getElementById('enterWorld');
  let selectedWorld = null;

  const token = () => localStorage.getItem('tryamm_token') || localStorage.getItem('token') || '';
  const request = async (url, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    if (token()) headers.Authorization = `Bearer ${token()}`;
    const response = await fetch(url, { ...options, headers });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Request failed');
    return payload;
  };

  const openWorld = world => {
    selectedWorld = world;
    title.textContent = world.name;
    kind.textContent = world.kind;
    description.textContent = world.description;
    message.textContent = '';
    dialog.showModal();
  };

  const render = worlds => {
    worldCount.textContent = worlds.length;
    activePlayers.textContent = worlds.reduce((sum, world) => sum + Number(world.activePlayers || 0), 0);
    grid.innerHTML = '';
    worlds.forEach(world => {
      const card = document.createElement('article');
      card.className = 'world-card';
      card.innerHTML = `<span class="kind">${world.kind}</span><h3>${world.name}</h3><p>${world.description}</p><footer><span>${world.activePlayers || 0} active</span><button class="small">View world</button></footer>`;
      card.querySelector('button').addEventListener('click', () => openWorld(world));
      grid.appendChild(card);
    });
  };

  const load = async () => {
    grid.innerHTML = '<p>Loading worlds…</p>';
    try {
      const { worlds } = await request('/api/worlds');
      render(worlds);
    } catch (error) {
      grid.innerHTML = `<p>Unable to load worlds: ${error.message}</p>`;
    }
  };

  enter.addEventListener('click', async () => {
    if (!selectedWorld) return;
    message.textContent = 'Opening travel gate…';
    try {
      const { session } = await request(`/api/worlds/${selectedWorld.slug}/enter`, { method: 'POST', body: JSON.stringify({ shard: 'global-1' }) });
      message.textContent = `Travel session ${session.id} created. The playable world client connects here next.`;
      await load();
    } catch (error) {
      message.textContent = error.message === 'Sign in required' ? 'Sign in on the main TryAMM page before entering a world.' : error.message;
    }
  });

  document.querySelector('.close').addEventListener('click', () => dialog.close());
  document.getElementById('refresh').addEventListener('click', load);
  document.getElementById('explore').addEventListener('click', () => document.getElementById('worlds-section').scrollIntoView({ behavior: 'smooth' }));
  load();
})();
