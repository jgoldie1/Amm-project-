import { FormEvent, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export default function AuthGateway() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage(data.session ? 'Account created and signed in.' : 'Account created. Check your email if confirmation is required.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage('Signed in.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setMessage(error?.message ?? 'Signed out.');
    setBusy(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={user ? 'Open account' : 'Sign in or create account'}
        style={{ position: 'fixed', right: 18, top: 18, zIndex: 10040, borderRadius: 999, padding: '10px 14px', border: '1px solid rgba(79,227,255,.65)', background: 'rgba(4,5,14,.9)', color: '#fff', boxShadow: '0 0 22px rgba(79,227,255,.22)' }}
      >
        {user ? 'JARVIS ACCOUNT ✓' : 'SIGN IN'}
      </button>
      {open && (
        <div role="dialog" aria-modal="true" aria-label="TRYAMM account" style={{ position: 'fixed', inset: 0, zIndex: 10050, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.66)', padding: 20 }}>
          <section style={{ width: 'min(440px, 100%)', border: '1px solid rgba(79,227,255,.7)', borderRadius: 24, background: 'rgba(4,5,14,.98)', color: '#fff', padding: 24, boxShadow: '0 0 50px rgba(79,227,255,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
              <div><strong>TRYAMM Identity</strong><div style={{ opacity: .75, marginTop: 4 }}>One authenticated account for JARVIS, Learning, Business, Marketplace and Delivery.</div></div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close account panel">✕</button>
            </div>
            {user ? (
              <div style={{ marginTop: 22 }}>
                <p><strong>Signed in</strong></p>
                <p style={{ overflowWrap: 'anywhere', opacity: .8 }}>{user.email}</p>
                <button type="button" disabled={busy} onClick={signOut}>Sign out</button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ display: 'grid', gap: 12, marginTop: 22 }}>
                <label>Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={{ width: '100%', minHeight: 44 }} /></label>
                <label>Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} style={{ width: '100%', minHeight: 44 }} /></label>
                <button disabled={busy} type="submit">{busy ? 'Working…' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
                <button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'I already have an account' : 'Create a new account'}</button>
              </form>
            )}
            {message && <p role="status" style={{ marginTop: 16 }}>{message}</p>}
          </section>
        </div>
      )}
    </>
  );
}
