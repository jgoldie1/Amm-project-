'use strict';
(() => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const files = document.querySelector('#trackFiles');
  const tracksEl = document.querySelector('#tracks');
  const status = document.querySelector('#studioStatus');
  const count = document.querySelector('#trackCount');
  const masterSlider = document.querySelector('#masterVolume');
  if (!AudioCtx || !files || !tracksEl) { if (status) status.textContent = 'This browser does not support the Web Audio mixer.'; return; }

  const ctx = new AudioCtx();
  const master = ctx.createGain();
  master.gain.value = Number(masterSlider.value);
  master.connect(ctx.destination);
  const tracks = [];
  let startedAt = 0;
  let pausedAt = 0;
  let playing = false;

  function announce(message) { status.textContent = message; }
  function updateCount() { count.textContent = `${tracks.length} / 64 tracks`; }
  function stopSources(reset = true) {
    tracks.forEach((track) => { try { track.source?.stop(); } catch (_) {} track.source = null; });
    playing = false;
    if (reset) pausedAt = 0;
  }
  function effectiveAudible(track) {
    const anySolo = tracks.some((item) => item.solo);
    return !track.muted && (!anySolo || track.solo);
  }
  function updateMix() {
    tracks.forEach((track) => track.gain.gain.setTargetAtTime(effectiveAudible(track) ? track.volume : 0, ctx.currentTime, .01));
  }
  function makeSource(track, offset) {
    const source = ctx.createBufferSource();
    source.buffer = track.buffer;
    source.loop = track.loop;
    source.connect(track.gain);
    source.onended = () => { if (!source.loop && playing && tracks.every((item) => !item.source || item.source === source)) { playing = false; announce('Playback finished.'); } };
    source.start(0, Math.min(offset, Math.max(0, track.buffer.duration - .01)));
    track.source = source;
  }
  async function playAll() {
    if (!tracks.length) return announce('Add at least one audio track first.');
    await ctx.resume();
    stopSources(false);
    const offset = pausedAt;
    tracks.forEach((track) => makeSource(track, offset));
    startedAt = ctx.currentTime - offset;
    playing = true;
    announce(`Playing ${tracks.length} synchronized track${tracks.length === 1 ? '' : 's'}.`);
  }
  function pauseAll() {
    if (!playing) return announce('Playback is not currently running.');
    pausedAt = Math.max(0, ctx.currentTime - startedAt);
    stopSources(false);
    announce(`Paused at ${pausedAt.toFixed(1)} seconds.`);
  }
  function stopAll() { stopSources(true); announce('Playback stopped and returned to the beginning.'); }

  function render() {
    tracksEl.replaceChildren();
    if (!tracks.length) {
      const empty = document.createElement('article'); empty.className = 'empty holo-panel';
      empty.innerHTML = '<h2>No tracks loaded</h2><p>Add music, vocals, beats or podcast audio from your device.</p>';
      tracksEl.append(empty); updateCount(); return;
    }
    tracks.forEach((track, index) => {
      const card = document.createElement('article'); card.className = 'track holo-panel';
      card.innerHTML = `<div><h2>${track.name}</h2><small>${track.buffer.duration.toFixed(1)} seconds</small><div class="meter"><span></span></div></div><label>Volume<input data-control="volume" type="range" min="0" max="1" step="0.01" value="${track.volume}"></label><label>Pan<input data-control="pan" type="range" min="-1" max="1" step="0.01" value="${track.panValue}"></label><div class="track-controls"><button data-action="mute" class="${track.muted ? 'active' : ''}">Mute</button><button data-action="solo" class="${track.solo ? 'active' : ''}">Solo</button><button data-action="loop" class="${track.loop ? 'active' : ''}">Loop</button><button data-action="remove">Remove</button></div>`;
      card.querySelector('[data-control="volume"]').addEventListener('input', (event) => { track.volume = Number(event.target.value); updateMix(); });
      card.querySelector('[data-control="pan"]').addEventListener('input', (event) => { track.panValue = Number(event.target.value); track.pan.pan.setTargetAtTime(track.panValue, ctx.currentTime, .01); });
      card.querySelector('[data-action="mute"]').addEventListener('click', () => { track.muted = !track.muted; updateMix(); render(); });
      card.querySelector('[data-action="solo"]').addEventListener('click', () => { track.solo = !track.solo; updateMix(); render(); });
      card.querySelector('[data-action="loop"]').addEventListener('click', () => { track.loop = !track.loop; if (track.source) track.source.loop = track.loop; render(); });
      card.querySelector('[data-action="remove"]').addEventListener('click', () => { try { track.source?.stop(); } catch (_) {} track.gain.disconnect(); track.pan.disconnect(); tracks.splice(index, 1); updateMix(); render(); announce(`${track.name} removed.`); });
      tracksEl.append(card);
    });
    updateCount();
  }

  files.addEventListener('change', async () => {
    const selected = [...files.files].slice(0, Math.max(0, 64 - tracks.length));
    for (const file of selected) {
      try {
        const buffer = await ctx.decodeAudioData(await file.arrayBuffer());
        const gain = ctx.createGain(); const pan = ctx.createStereoPanner();
        gain.connect(pan); pan.connect(master);
        tracks.push({ name: file.name, buffer, gain, pan, volume: .85, panValue: 0, muted: false, solo: false, loop: false, source: null });
      } catch (_) { announce(`Could not load ${file.name}. Try another audio format.`); }
    }
    files.value = ''; updateMix(); render(); announce(`${tracks.length} track${tracks.length === 1 ? '' : 's'} ready.`);
  });
  masterSlider.addEventListener('input', () => master.gain.setTargetAtTime(Number(masterSlider.value), ctx.currentTime, .01));
  document.querySelector('#playAll').addEventListener('click', playAll);
  document.querySelector('#pauseAll').addEventListener('click', pauseAll);
  document.querySelector('#stopAll').addEventListener('click', stopAll);
  window.addEventListener('beforeunload', () => { stopSources(true); ctx.close(); });
  render();
})();