import { VocalStudioEngine } from './vocal-studio-engine.js';

const engine = new VocalStudioEngine();
const $ = (selector) => document.querySelector(selector);
const files = $('#audioFiles');
const rows = $('#trackRows');
const status = $('#studioStatus');
const count = $('#trackCount');
const template = $('#trackTemplate');

const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const announce = (message) => { status.textContent = message; };

function render() {
  const tracks = engine.listTracks();
  count.textContent = `${tracks.length} / ${engine.maxTracks}`;
  rows.replaceChildren();
  if (!tracks.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = 'No tracks loaded.';
    rows.append(empty);
    return;
  }

  for (const track of tracks) {
    const node = template.content.cloneNode(true);
    const article = node.querySelector('.track-row');
    article.dataset.trackId = track.id;
    node.querySelector('.track-name').textContent = track.name;
    node.querySelector('.track-duration').textContent = formatTime(track.duration);

    const volume = node.querySelector('.track-volume');
    volume.value = track.volume;
    volume.addEventListener('input', () => engine.setVolume(track.id, volume.value));

    const pan = node.querySelector('.track-pan');
    pan.value = track.pan;
    pan.addEventListener('input', () => engine.setPan(track.id, pan.value));

    const mute = node.querySelector('.track-mute');
    mute.setAttribute('aria-pressed', String(track.muted));
    mute.addEventListener('click', () => { engine.toggleMute(track.id); render(); });

    const solo = node.querySelector('.track-solo');
    solo.setAttribute('aria-pressed', String(track.solo));
    solo.addEventListener('click', () => { engine.toggleSolo(track.id); render(); });

    const loop = node.querySelector('.track-loop');
    loop.setAttribute('aria-pressed', String(track.loop));
    loop.addEventListener('click', () => { engine.toggleLoop(track.id); render(); });

    node.querySelector('.track-remove').addEventListener('click', () => {
      engine.removeTrack(track.id);
      announce(`${track.name} removed.`);
      render();
    });
    rows.append(node);
  }
}

files.addEventListener('change', async () => {
  const selected = [...files.files];
  for (const file of selected) {
    try {
      announce(`Loading ${file.name}…`);
      await engine.addFile(file);
    } catch (error) {
      announce(error.message);
      break;
    }
  }
  files.value = '';
  render();
  if (selected.length) announce(`${engine.tracks.size} track${engine.tracks.size === 1 ? '' : 's'} ready.`);
});

$('#playAll').addEventListener('click', async () => {
  try { await engine.playAll(); announce('Playback started.'); } catch (error) { announce(error.message); }
});
$('#pauseAll').addEventListener('click', () => { engine.pauseAll(); announce('Playback paused.'); });
$('#stopAll').addEventListener('click', () => { engine.stopAll(); announce('Playback stopped.'); });
$('#clearAll').addEventListener('click', () => { engine.clear(); render(); announce('All tracks cleared.'); });
$('#masterVolume').addEventListener('input', (event) => engine.setMasterVolume(event.target.value));
window.addEventListener('pagehide', () => engine.close());

render();