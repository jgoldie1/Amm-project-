import { useEffect, useMemo, useState } from 'react';
import {
  applyAccessibilityPreferences,
  createAccessibilityPassport,
  loadAccessibilityPassport,
  saveAccessibilityPassport,
  type AccessibilityPassport,
  type AccessibilityPreferences,
} from '../accessibility/accessibilityPassport';

const labels: Array<[keyof AccessibilityPreferences, string, string]> = [
  ['oneHandedMode', 'One-handed mode', 'Larger reachable controls and layouts designed for one-hand use.'],
  ['voiceControl', 'Voice control', 'Prefer voice-capable actions and navigation where supported.'],
  ['screenReader', 'Screen reader', 'Prioritize semantic labels, headings and announcements.'],
  ['keyboardOnly', 'Keyboard-only navigation', 'Ensure primary flows work without a pointer.'],
  ['switchAccess', 'Switch access', 'Prefer controls suitable for switch/assistive input.'],
  ['largeTargets', 'Large touch targets', 'Increase interactive target sizes.'],
  ['largeText', 'Large text', 'Increase base text sizing.'],
  ['highContrast', 'High contrast', 'Increase visual contrast for core controls.'],
  ['reducedMotion', 'Reduced motion', 'Reduce non-essential animation and movement.'],
  ['captions', 'Captions', 'Prefer captions on supported video and LIVE experiences.'],
  ['transcripts', 'Transcripts', 'Prefer text transcripts for authored audio/video.'],
  ['audioDescription', 'Audio description', 'Prefer descriptive audio/notes where available.'],
  ['speechToText', 'Speech to text', 'Prefer dictation/input support where available.'],
  ['textToSpeech', 'Text to speech', 'Prefer read-aloud support where available.'],
  ['simplifiedUI', 'Simplified interface', 'Reduce visual density and secondary controls.'],
  ['extraProcessingTime', 'More processing time', 'Prefer non-timed or extended learning interactions where allowed.'],
];

const opportunityNeeds = [
  ['remote', 'Remote option'],
  ['flexible_schedule', 'Flexible schedule'],
  ['step_free', 'Step-free access'],
  ['adaptive_equipment', 'Adaptive equipment'],
  ['captioning', 'Captioning'],
  ['interpreting', 'Interpreting process'],
  ['voice_first', 'Voice-first workflow'],
  ['keyboard_accessible', 'Keyboard/switch compatible'],
  ['one_handed_compatible', 'One-handed compatible'],
  ['accessible_transit', 'Accessible transit information'],
  ['accommodation_process', 'Accommodation process'],
] as const;

export default function AccessibilityPassportPanel() {
  const [open, setOpen] = useState(false);
  const [passport, setPassport] = useState<AccessibilityPassport>(() => loadAccessibilityPassport());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    applyAccessibilityPreferences(passport.preferences);
  }, []);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('tryamm:open-accessibility-passport', show);
    return () => window.removeEventListener('tryamm:open-accessibility-passport', show);
  }, []);

  const enabledCount = useMemo(
    () => Object.values(passport.preferences).filter(Boolean).length + passport.opportunityNeeds.length,
    [passport],
  );

  const togglePreference = (key: keyof AccessibilityPreferences) => {
    setPassport((current) => createAccessibilityPassport({
      ...current,
      preferences: { ...current.preferences, [key]: !current.preferences[key] },
    }));
    setSaved(false);
  };

  const toggleNeed = (need: string) => {
    setPassport((current) => createAccessibilityPassport({
      ...current,
      opportunityNeeds: current.opportunityNeeds.includes(need)
        ? current.opportunityNeeds.filter((item) => item !== need)
        : [...current.opportunityNeeds, need],
    }));
    setSaved(false);
  };

  const persist = () => {
    const next = saveAccessibilityPassport(passport);
    setPassport(next);
    setSaved(true);
    window.dispatchEvent(new CustomEvent('tryamm:accessibility-passport-updated', { detail: next }));
  };

  return (
    <>
      <button
        type="button"
        aria-label="Open Accessibility Passport"
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', right: 14, bottom: 82, zIndex: 9995, width: 52, height: 52,
          borderRadius: 18, border: '1px solid rgba(79,227,255,.7)', background: 'rgba(4,5,14,.92)',
          color: '#fff', boxShadow: '0 0 24px rgba(79,227,255,.22)', fontSize: 24, cursor: 'pointer',
        }}
      >
        ♿
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="a11y-passport-title" style={{
          position: 'fixed', inset: 0, zIndex: 10050, background: 'rgba(0,0,0,.78)', display: 'grid',
          placeItems: 'center', padding: 16,
        }}>
          <section style={{
            width: 'min(820px, 100%)', maxHeight: '90vh', overflowY: 'auto', borderRadius: 24,
            background: '#070817', border: '1px solid rgba(79,227,255,.35)', color: '#fff', padding: 22,
            boxShadow: '0 24px 80px rgba(0,0,0,.55)',
          }}>
            <header style={{ display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ color: '#4FE3FF', fontWeight: 800, letterSpacing: 1 }}>ALL AMERICAN PASSPORT</div>
                <h2 id="a11y-passport-title" style={{ margin: '6px 0 4px', fontSize: 28 }}>Accessibility Passport</h2>
                <p style={{ margin: 0, color: '#c8c9d8', lineHeight: 1.45 }}>
                  Tell TRYAMM how technology should work for you. No medical diagnosis is required. Your settings stay private unless you choose to share a specific need.
                </p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close Accessibility Passport" style={{
                border: 0, background: 'transparent', color: '#fff', fontSize: 28, cursor: 'pointer', padding: 4,
              }}>×</button>
            </header>

            <div aria-live="polite" style={{ marginTop: 14, color: saved ? '#7CFFB2' : '#9fa2b8' }}>
              {saved ? 'Preferences saved and applied.' : `${enabledCount} accessibility preferences selected.`}
            </div>

            <h3 style={{ marginTop: 24 }}>How TRYAMM should work</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 10 }}>
              {labels.map(([key, title, description]) => (
                <label key={key} style={{
                  display: 'flex', gap: 12, padding: 14, borderRadius: 16,
                  background: passport.preferences[key] ? 'rgba(79,227,255,.12)' : 'rgba(255,255,255,.04)',
                  border: passport.preferences[key] ? '1px solid rgba(79,227,255,.55)' : '1px solid rgba(255,255,255,.08)',
                  cursor: 'pointer',
                }}>
                  <input
                    type="checkbox"
                    checked={passport.preferences[key]}
                    onChange={() => togglePreference(key)}
                    style={{ width: 22, height: 22, flex: '0 0 auto' }}
                  />
                  <span><strong>{title}</strong><br /><span style={{ color: '#b7b9c8', fontSize: 13 }}>{description}</span></span>
                </label>
              ))}
            </div>

            <h3 style={{ marginTop: 26 }}>Accessibility Match needs</h3>
            <p style={{ color: '#b7b9c8' }}>Select only what you want TRYAMM to consider when matching jobs, grants, programs and creator opportunities.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {opportunityNeeds.map(([value, title]) => {
                const active = passport.opportunityNeeds.includes(value);
                return <button key={value} type="button" aria-pressed={active} onClick={() => toggleNeed(value)} style={{
                  minHeight: 44, borderRadius: 999, padding: '8px 13px', cursor: 'pointer', color: '#fff',
                  border: active ? '1px solid #E8B944' : '1px solid rgba(255,255,255,.15)',
                  background: active ? 'rgba(232,185,68,.14)' : 'rgba(255,255,255,.04)',
                }}>{active ? '✓ ' : ''}{title}</button>;
              })}
            </div>

            <h3 style={{ marginTop: 26 }}>Communication preference</h3>
            <select
              aria-label="Communication preference"
              value={passport.communicationPreference ?? 'none'}
              onChange={(event) => setPassport(createAccessibilityPassport({
                ...passport,
                communicationPreference: event.target.value as AccessibilityPassport['communicationPreference'],
              }))}
              style={{ minHeight: 48, width: '100%', borderRadius: 12, padding: '0 12px', background: '#111326', color: '#fff', border: '1px solid rgba(255,255,255,.15)' }}
            >
              <option value="none">No preference</option>
              <option value="text">Text</option>
              <option value="voice">Voice</option>
              <option value="video">Video</option>
              <option value="email">Email</option>
            </select>

            <footer style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10, marginTop: 28 }}>
              <button type="button" onClick={() => {
                const reset = createAccessibilityPassport();
                setPassport(reset);
                saveAccessibilityPassport(reset);
                setSaved(true);
              }} style={{ minHeight: 48, padding: '0 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,.18)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>
                Reset preferences
              </button>
              <button type="button" onClick={persist} style={{ minHeight: 48, padding: '0 20px', borderRadius: 12, border: 0, background: '#4FE3FF', color: '#020212', fontWeight: 900, cursor: 'pointer' }}>
                SAVE & APPLY
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
