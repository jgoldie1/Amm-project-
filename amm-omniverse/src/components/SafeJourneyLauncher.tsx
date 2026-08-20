import { useMemo, useState } from 'react';
import { priceSafeJourney, type SafeJourneyKind } from '../safeWalk/safeWalkCore';

const journeySteps = ['Requested','Screening','Matching','Assigned','En route','Arrived','Journey active','Safe arrival'];

export default function SafeJourneyLauncher() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<SafeJourneyKind>('safe_walk');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [sponsored, setSponsored] = useState(true);
  const [shareTrustedContact, setShareTrustedContact] = useState(true);
  const [status, setStatus] = useState('Ready to request a pilot journey.');
  const [activeStep, setActiveStep] = useState(0);

  const quote = useMemo(() => priceSafeJourney({
    kind,
    baseMinor: kind === 'safe_walk' ? 1200 : 3000,
    safetyReserveMinor: 150,
    processingMinor: 100,
    communityOrReferralMinor: 50,
  }), [kind]);

  const prepare = () => {
    if (!pickup || !destination) {
      setStatus('Enter pickup and destination first.');
      return;
    }
    setActiveStep(1);
    setStatus(sponsored
      ? 'Pilot request prepared with sponsor/community coverage check. Server eligibility and dispatch are still required.'
      : 'Pilot request prepared. Server persistence, jurisdiction approval and live dispatch must be active before a real journey is accepted.');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Safe Walk and Safe Ride"
        style={{ position: 'fixed', right: 18, bottom: 220, zIndex: 80, borderRadius: 999, padding: '12px 16px', border: '1px solid #4fe3ff', background:'#04050e', color:'#fff' }}
      >
        🛡 Safe Walk / Ride
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="Safe Journey pilot" style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.72)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: 'min(760px,100%)', maxHeight: '90vh', overflow: 'auto', borderRadius: 24, padding: 22, background: '#070b12', color: '#fff', border: '1px solid #4fe3ff', boxShadow:'0 0 40px rgba(79,227,255,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <h2 style={{ margin: 0 }}>TRYAMM Safe Journey</h2>
                <p>Community accompaniment and ride support with dispatch, check-ins, trusted contacts and safe-arrival confirmation.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)}>Close</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button type="button" onClick={() => setKind('safe_walk')} aria-pressed={kind === 'safe_walk'}>🚶 Safe Walk</button>
              <button type="button" onClick={() => setKind('safe_ride')} aria-pressed={kind === 'safe_ride'}>🚗 Safe Ride</button>
            </div>

            <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              Pickup
              <input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Where should we meet you?" />
            </label>
            <label style={{ display: 'grid', gap: 6, marginBottom: 12 }}>
              Destination
              <input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where are you going?" />
            </label>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginBottom:14}}>
              <label style={{display:'flex',gap:8,alignItems:'center',padding:10,border:'1px solid rgba(255,255,255,.14)',borderRadius:12}}>
                <input type="checkbox" checked={sponsored} onChange={e=>setSponsored(e.target.checked)} /> Check community/sponsor coverage
              </label>
              <label style={{display:'flex',gap:8,alignItems:'center',padding:10,border:'1px solid rgba(255,255,255,.14)',borderRadius:12}}>
                <input type="checkbox" checked={shareTrustedContact} onChange={e=>setShareTrustedContact(e.target.checked)} /> Share start/ETA/completion with trusted contact
              </label>
            </div>

            <div style={{ padding: 14, border: '1px solid rgba(255,255,255,.18)', borderRadius: 16, marginBottom: 14 }}>
              <strong>{sponsored ? 'Participant estimate: $0 if sponsor eligibility is approved' : `Pilot quote: $${(quote.totalMinor / 100).toFixed(2)}`}</strong>
              <div>Companion/driver payable: ${(quote.companionOrDriverMinor / 100).toFixed(2)}</div>
              <div>TRYAMM platform: ${(quote.platformMinor / 100).toFixed(2)}</div>
              <div>Safety reserve: ${(quote.safetyReserveMinor / 100).toFixed(2)}</div>
              <div>Processing: ${(quote.processingMinor / 100).toFixed(2)}</div>
              <small>Final participant price, sponsor contribution, provider pay and settlement must come from the server-side billing record.</small>
            </div>

            <div aria-label="Journey progress" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(105px,1fr))',gap:6,marginBottom:14}}>
              {journeySteps.map((step, i) => <div key={step} style={{padding:8,borderRadius:10,border:'1px solid rgba(79,227,255,.3)',opacity:i<=activeStep?1:.45}}>{i<=activeStep?'✓ ':''}{step}</div>)}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:8}}>
              <button type="button" onClick={prepare}>Prepare request</button>
              <button type="button" onClick={() => setStatus(shareTrustedContact ? 'Trusted-contact update prepared. Real messages require an authorized notification provider.' : 'Enable trusted-contact sharing first.')}>Share ETA</button>
              <button type="button" onClick={() => {setActiveStep(journeySteps.length-1);setStatus('Safe-arrival confirmation prepared. Server persistence is required for a real journey.')}}>I arrived safely</button>
              <button type="button" onClick={() => setStatus('Help flow opened. Emergency situations must route to appropriate emergency services; non-emergency incidents go to safety review.')}>I need help</button>
            </div>

            <p aria-live="polite">{status}</p>
            <small>Not police and not an armed/unlicensed security service. The pilot focuses on accompaniment, observation, de-escalation, check-ins, dispatch and rapid routing to appropriate emergency services when needed. No pursuit, detention, retaliation or vigilantism.</small>
          </div>
        </div>
      )}
    </>
  );
}
