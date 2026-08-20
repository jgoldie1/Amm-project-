import { useMemo, useState } from 'react';
import { triageGuardianRequest, type GuardianRequestType } from '../communityGuardian/communityGuardianCore';

const lanes: Array<{ id: GuardianRequestType; title: string; detail: string }> = [
  { id: 'safe_walk', title: 'Safe Walk', detail: 'Request non-emergency accompaniment to transit, work, school, parking or a community destination.' },
  { id: 'late_shift_escort', title: 'Late-Shift Check-In', detail: 'Coordinate a safe arrival/departure plan for workers and participating organizations.' },
  { id: 'school_route', title: 'School Route', detail: 'Youth-safe arrival support with safeguarding rules and approved partners.' },
  { id: 'business_checkin', title: 'Business District Support', detail: 'Customer assistance, wayfinding, community presence and resource routing.' },
  { id: 'event_support', title: 'Event Ambassador', detail: 'Guest support, directions, accessibility help and non-security event assistance.' },
  { id: 'resource_navigation', title: 'Find Help', detail: 'Connect to food, housing, transportation, reentry, legal-aid, health or community resources.' },
  { id: 'youth_support', title: 'Youth Peace Mission', detail: 'Mentoring, sports, music, gaming, creator projects, education and opportunity pathways.' },
  { id: 'accessibility_support', title: 'Accessibility Support', detail: 'Request communication, mobility or navigation assistance using preferences you choose to share.' },
];

export default function CommunityGuardianLauncher() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<GuardianRequestType>('safe_walk');
  const [imminentDanger, setImminentDanger] = useState(false);
  const [status, setStatus] = useState('');

  const triage = useMemo(() => triageGuardianRequest({
    id: 'preview', accountId: 'preview', type: selected, state: 'requested', requestedAt: new Date().toISOString(),
    serviceAreaId: 'current', imminentDanger,
  }), [selected, imminentDanger]);

  function previewRequest() {
    setStatus(triage.dispatchGuardian
      ? 'Eligible for the non-emergency Guardian workflow. Production dispatch requires authenticated location/service-area and trained-worker availability.'
      : 'Do not dispatch a civilian Guardian into imminent danger. Use appropriate emergency/public-safety response.'
    );
  }

  return (
    <>
      <button
        type="button"
        aria-label="Open Community Guardian"
        onClick={() => setOpen(true)}
        style={{ position: 'fixed', right: 18, bottom: 222, zIndex: 9998, borderRadius: 999, padding: '12px 16px', border: '1px solid rgba(79,227,255,.7)', background: 'rgba(4,5,14,.92)', color: '#fff', boxShadow: '0 0 24px rgba(79,227,255,.25)' }}
      >
        Guardian
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Community Guardian" style={{ position: 'fixed', inset: 0, zIndex: 10020, background: 'rgba(0,0,0,.78)', display: 'grid', placeItems: 'center', padding: 16 }}>
          <div style={{ width: 'min(960px,100%)', maxHeight: '90vh', overflow: 'auto', border: '1px solid rgba(79,227,255,.55)', borderRadius: 24, background: 'linear-gradient(180deg,rgba(7,12,24,.98),rgba(4,5,14,.98))', color: '#fff', padding: 20, boxShadow: '0 0 60px rgba(79,227,255,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: '.18em', opacity: .72 }}>TRYAMM COMMUNITY GUARDIAN</div>
                <h2 style={{ margin: '6px 0 8px' }}>Peace Ambassador & Safe Arrival</h2>
                <p style={{ margin: 0, opacity: .78 }}>Unarmed, non-vigilante community assistance. Guardian does not replace police, emergency medical response, or licensed security.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{ borderRadius: 12, padding: '8px 12px' }}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, marginTop: 18 }}>
              {lanes.map((lane) => (
                <button
                  type="button"
                  key={lane.id}
                  onClick={() => setSelected(lane.id)}
                  aria-pressed={selected === lane.id}
                  style={{ textAlign: 'left', padding: 16, borderRadius: 18, border: selected === lane.id ? '1px solid #4FE3FF' : '1px solid rgba(255,255,255,.15)', background: selected === lane.id ? 'rgba(79,227,255,.10)' : 'rgba(255,255,255,.035)', color: '#fff' }}
                >
                  <strong>{lane.title}</strong>
                  <div style={{ marginTop: 6, fontSize: 13, opacity: .72 }}>{lane.detail}</div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 18, padding: 16, borderRadius: 18, border: '1px solid rgba(232,185,68,.35)', background: 'rgba(232,185,68,.06)' }}>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="checkbox" checked={imminentDanger} onChange={(e) => setImminentDanger(e.target.checked)} />
                This situation involves immediate/imminent danger.
              </label>
              {imminentDanger && <p role="alert" style={{ marginBottom: 0 }}>Guardian is not dispatched into imminent danger. Use the appropriate emergency/public-safety response for your location.</p>}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
              <button type="button" onClick={previewRequest} style={{ borderRadius: 14, padding: '12px 16px', fontWeight: 700 }}>Preview Request</button>
              <button type="button" onClick={() => setStatus('Sponsor/organization onboarding will connect contracts, funded Safe Walk hours, event support, training, and Guardian SaaS to Money Engine and Platform Sustainability Engine.')} style={{ borderRadius: 14, padding: '12px 16px' }}>Sponsor / Organization</button>
              <button type="button" onClick={() => setStatus('Youth Peace Missions connect Student JARVIS, Launchpad, mentoring, sports, music, gaming, trades, creator projects and verified opportunity pathways.')} style={{ borderRadius: 14, padding: '12px 16px' }}>Youth Peace Mission</button>
            </div>

            {status && <p role="status" style={{ marginTop: 14, padding: 12, borderRadius: 14, background: 'rgba(255,255,255,.05)' }}>{status}</p>}

            <div style={{ marginTop: 18, fontSize: 12, opacity: .62 }}>
              Privacy: do not expose crisis history or precise location publicly. Production requests require authenticated, consent-controlled, minimum-necessary data handling.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
