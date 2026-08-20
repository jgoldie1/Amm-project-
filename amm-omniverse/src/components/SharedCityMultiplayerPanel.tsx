import { useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { AuthenticatedMultiplayerClient } from '../multiplayer/multiplayerClient';
import type { MatchAssignment, MatchRequest, WorldSnapshot } from '../multiplayer/authoritativeMultiplayer';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const wsUrl = import.meta.env.VITE_MULTIPLAYER_WS_URL as string | undefined;

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

type Status = 'offline' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'unauthenticated';

export default function SharedCityMultiplayerPanel() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('offline');
  const [assignment, setAssignment] = useState<MatchAssignment>();
  const [snapshot, setSnapshot] = useState<WorldSnapshot>();
  const [mode, setMode] = useState<MatchRequest['mode']>('shared_city');
  const clientRef = useRef<AuthenticatedMultiplayerClient>();

  const configured = Boolean(supabase && wsUrl);

  const client = useMemo(() => {
    if (!configured || !wsUrl || !supabase) return undefined;
    return new AuthenticatedMultiplayerClient({
      url: wsUrl,
      getAccessToken: async () => (await supabase.auth.getSession()).data.session?.access_token ?? null,
      onStatus: (next) => setStatus(next === 'connecting' ? 'connecting' : next),
      onMatch: setAssignment,
      onSnapshot: setSnapshot,
      onReconnectState: (state) => {
        if (state.snapshot) setSnapshot(state.snapshot);
      },
    });
  }, [configured]);

  useEffect(() => {
    clientRef.current = client;
    return () => client?.disconnect();
  }, [client]);

  async function connectAndMatch() {
    if (!client) return;
    const connected = await client.connect();
    if (!connected) return;
    window.setTimeout(() => client.matchmake({ mode, maxPlayers: mode === 'district_rescue_coop' ? 4 : 16 }), 200);
  }

  const playerCount = snapshot?.players.length ?? 0;

  return (
    <>
      <button
        type="button"
        aria-label="Open Shared City multiplayer"
        onClick={() => setOpen((value) => !value)}
        style={{ position: 'fixed', right: 18, bottom: 226, zIndex: 9997, minWidth: 56, minHeight: 48, borderRadius: 16, border: '1px solid rgba(79,227,255,.6)', background: 'rgba(4,5,14,.9)', color: '#fff', boxShadow: '0 0 22px rgba(79,227,255,.25)' }}
      >
        CITY
      </button>
      {open && (
        <section
          aria-label="AMM City Multiplayer"
          style={{ position: 'fixed', right: 18, bottom: 286, width: 'min(390px, calc(100vw - 36px))', zIndex: 9997, padding: 18, borderRadius: 22, border: '1px solid rgba(79,227,255,.45)', background: 'linear-gradient(160deg, rgba(4,5,14,.97), rgba(8,18,30,.96))', color: '#fff', boxShadow: '0 24px 70px rgba(0,0,0,.48)' }}
        >
          <div style={{ fontSize: 12, letterSpacing: 2, color: '#4FE3FF' }}>AMM CITY • AUTHORITATIVE MULTIPLAYER</div>
          <h2 style={{ margin: '8px 0 4px' }}>Continue Your World</h2>
          <p style={{ margin: '0 0 14px', opacity: .82, lineHeight: 1.45 }}>Solo tutorial → Shared City → District Rescue Co-op → reward → cloud save → continue on another device.</p>

          {!configured && <p role="status" style={{ padding: 10, borderRadius: 12, background: 'rgba(232,185,68,.12)' }}>Multiplayer transport is coded but gated until Supabase and VITE_MULTIPLAYER_WS_URL are configured.</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {(['shared_city','district_rescue_coop','user_world'] as MatchRequest['mode'][]).map((value) => (
              <button key={value} type="button" onClick={() => setMode(value)} aria-pressed={mode === value} style={{ minHeight: 46, borderRadius: 12, border: mode === value ? '1px solid #4FE3FF' : '1px solid rgba(255,255,255,.16)', background: mode === value ? 'rgba(79,227,255,.12)' : 'rgba(255,255,255,.04)', color: '#fff', fontSize: 11 }}>
                {value === 'shared_city' ? 'Shared City' : value === 'district_rescue_coop' ? 'Rescue Co-op' : 'User World'}
              </button>
            ))}
          </div>

          <button type="button" disabled={!configured || status === 'connecting'} onClick={() => void connectAndMatch()} style={{ width: '100%', minHeight: 48, marginTop: 12, borderRadius: 14, border: 0, fontWeight: 800, background: '#4FE3FF', color: '#04050E', opacity: !configured ? .5 : 1 }}>
            {status === 'connecting' ? 'CONNECTING…' : assignment ? 'FIND NEW MATCH' : 'ENTER CITY'}
          </button>

          <div style={{ marginTop: 14, display: 'grid', gap: 8, fontSize: 13 }}>
            <div><strong>Status:</strong> {status}</div>
            <div><strong>Room:</strong> {assignment?.roomId ?? 'not assigned'}</div>
            <div><strong>Players:</strong> {playerCount}</div>
            <div><strong>Server tick:</strong> {snapshot?.tick ?? '—'}</div>
            <div><strong>Cloud save:</strong> checkpoint persistence ready; server write required</div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.1)', fontSize: 12, opacity: .72 }}>
            Real-world terrain + fictional districts + user worlds + business twins + missions + HoloGPT/JARVIS guidance are visual/context layers. Server authority controls shared gameplay state.
          </div>
        </section>
      )}
    </>
  );
}
