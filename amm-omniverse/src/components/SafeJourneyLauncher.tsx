import { useMemo, useState } from 'react';
import { priceSafeJourney, type SafeJourneyKind } from '../safeWalk/safeWalkCore';

export default function SafeJourneyLauncher() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<SafeJourneyKind>('safe_walk');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState('Ready to request a pilot journey.');

  const quote = useMemo(() => priceSafeJourney({
    kind,
    baseMinor: kind === 'safe_walk' ? 1200 : 3000,
    safetyReserveMinor: 150,
    processingMinor: 100,
    communityOrReferralMinor: 50,
  }), [kind]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Safe Walk and Safe Ride"
        style={{ position: 'fixed', right: 18, bottom: 220, zIndex: 80, borderRadius: 999, padding: '12px 16px', border: '1px solid currentColor' }}
      >
        Safe Walk / Ride
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Safe Journey pilot" style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.72)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: 'min(680px,100%)', maxHeight: '90vh', overflow: 'auto', borderRadius: 24, padding: 22, background: '#070b12', color: '#fff', border: '1px solid #4fe3ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0 }}>TRYAMM Safe Journey</h2>
                <p>Community accompaniment and ride support with dispatch, check-ins and safe-arrival confirmation.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)}>Close</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button type="button" onClick={() => setKind('safe_walk')} aria-pressed={kind === 'safe_walk'}>Safe Walk</button>
              <button type="button" onClick={() => setKind('safe_ride')} aria-pressed={kind === 'safe_ride'}>Safe Ride</button>
            </div>

            <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              Pickup
              <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Where should we meet you?" />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              Destination
              <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where are you going?" />
            </label>

            <div style={{ padding: 14, border: '1px solid rgba(255,255,255,.18)', borderRadius: 16, marginBottom: 14 }}>
              <strong>Pilot quote: ${(quote.totalMinor / 100).toFixed(2)}</strong>
              <div>Companion/driver: ${(quote.companionOrDriverMinor / 100).toFixed(2)}</div>
              <div>Platform: ${(quote.platformMinor / 100).toFixed(2)}</div>
              <div>Safety reserve: ${(quote.safetyReserveMinor / 100).toFixed(2)}</div>
              <div>Processing: ${(quote.processingMinor / 100).toFixed(2)}</div>
            </div>

            <button
              type="button"
              onClick={() => setStatus(pickup && destination ? 'Pilot request prepared. Server persistence, jurisdiction approval and live dispatch must be active before a real journey is accepted.' : 'Enter pickup and destination first.')}
            >
              Prepare request
            </button>

            <p aria-live="polite">{status}</p>
            <small>Not police and not an armed/unlicensed security service. The pilot focuses on accompaniment, observation, de-escalation, check-ins, dispatch and rapid routing to appropriate emergency services when needed.</small>
          </div>
        </div>
      )}
    </>
  );
}
