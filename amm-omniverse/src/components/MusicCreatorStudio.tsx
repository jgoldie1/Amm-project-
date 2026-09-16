import React, { useMemo, useState } from 'react';
import { GENRE_PROFILES, MUSIC_PROJECT_TYPES } from '../lib/music/universalImmersiveMusic';

type Action = 'ai-producer' | 'preview' | 'keep' | 'undo' | 'redo' | 'rollback' | 'history' | 'immersive' | 'release';

export default function MusicCreatorStudio() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState<(typeof GENRE_PROFILES)[number]>('gospel');
  const [projectType, setProjectType] = useState<(typeof MUSIC_PROJECT_TYPES)[number]>('song');
  const [status, setStatus] = useState('Ready — describe what you want to create.');
  const [advanced, setAdvanced] = useState(false);

  const genreLabel = useMemo(() => genre.replaceAll('-', ' / '), [genre]);

  const run = (action: Action) => {
    const messages: Record<Action, string> = {
      'ai-producer': prompt.trim() ? `AI Producer request staged: ${prompt.trim()}` : 'Describe the song or change first.',
      preview: 'Preview requested. No approved music will be replaced.',
      keep: 'Current version marked to keep.',
      undo: 'Undo requested for the most recent reversible change.',
      redo: 'Redo requested for the most recently undone change.',
      rollback: 'Rollback requested. Choose a saved checkpoint from Version History.',
      history: 'Version History requested.',
      immersive: 'Immersive Mix requested with stereo and headphone fallbacks preserved.',
      release: 'Release & Earn requested. Publishing and ledger verification are required before release.',
    };
    setStatus(messages[action]);
  };

  return (
    <main aria-labelledby="music-creator-title" style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>
      <header>
        <p style={{ marginBottom: 4 }}>TRYAMM • StreetVerse Creator Studio</p>
        <h1 id="music-creator-title">Create Music</h1>
        <p>Tell the AI producer what you want. The 64-track production system stays under the hood.</p>
      </header>

      <section aria-label="Project setup">
        <label>
          Project type
          <select value={projectType} onChange={(e) => setProjectType(e.target.value as typeof projectType)} style={{ display: 'block', width: '100%', minHeight: 48, margin: '8px 0 16px' }}>
            {MUSIC_PROJECT_TYPES.map((type) => <option key={type} value={type}>{type.replaceAll('-', ' ')}</option>)}
          </select>
        </label>
        <label>
          Genre
          <select value={genre} onChange={(e) => setGenre(e.target.value as typeof genre)} style={{ display: 'block', width: '100%', minHeight: 48, margin: '8px 0 16px' }}>
            {GENRE_PROFILES.map((item) => <option key={item} value={item}>{item.replaceAll('-', ' / ')}</option>)}
          </select>
        </label>
        <label>
          What do you want to make?
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="Example: Make an uplifting gospel song with piano, choir and cinematic strings." style={{ display: 'block', width: '100%', marginTop: 8, fontSize: 18 }} />
        </label>
        <button type="button" onClick={() => run('ai-producer')} style={{ minHeight: 52, width: '100%', marginTop: 12, fontSize: 18 }}>AI Producer — Create / Change</button>
      </section>

      <section aria-label="Safe editing controls" style={{ marginTop: 24 }}>
        <h2>Safe Editing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
          <button type="button" onClick={() => run('preview')}>Preview</button>
          <button type="button" onClick={() => run('keep')}>Keep It</button>
          <button type="button" onClick={() => run('undo')}>Undo</button>
          <button type="button" onClick={() => run('redo')}>Redo</button>
          <button type="button" onClick={() => run('rollback')}>Roll Back</button>
          <button type="button" onClick={() => run('history')}>Version History</button>
        </div>
      </section>

      <section aria-label="Finish project" style={{ marginTop: 24 }}>
        <h2>Finish</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <button type="button" onClick={() => run('immersive')}>Immersive Mix</button>
          <button type="button" onClick={() => run('release')}>Release & Earn</button>
        </div>
      </section>

      <section aria-live="polite" style={{ marginTop: 24, padding: 16, border: '1px solid currentColor', borderRadius: 12 }}>
        <strong>Status:</strong> {status}
        <div>Project: {projectType} • Genre: {genreLabel} • Production: 64-track • Composition locks: ON</div>
      </section>

      <section style={{ marginTop: 20 }}>
        <button type="button" aria-expanded={advanced} onClick={() => setAdvanced((value) => !value)}>{advanced ? 'Hide Studio Mode' : 'Open Studio Mode'}</button>
        {advanced && <p>Studio Mode exposes advanced arrangement, MIDI, orchestration, spatial and Ableton controls when their verified runtime adapters are connected.</p>}
      </section>
    </main>
  );
}
