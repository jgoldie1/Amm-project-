import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  canUseSpeechRecognition,
  signLanguageApi,
  startSpeechRecognition,
  type SignCapabilities,
  type SignLanguageCode,
  type SignOutputMode,
  type SignTranslation,
} from '../accessibility/signLanguage'

const LANGUAGES: Array<{ code: SignLanguageCode; label: string }> = [
  { code: 'asl', label: 'ASL — American Sign Language' },
  { code: 'bsl', label: 'BSL — British Sign Language' },
  { code: 'lsf', label: 'LSF — French Sign Language' },
  { code: 'dgs', label: 'DGS — German Sign Language' },
  { code: 'auslan', label: 'Auslan — Australian Sign Language' },
  { code: 'isl', label: 'ISL — Irish Sign Language' },
  { code: 'jls', label: 'JSL — Japanese Sign Language' },
]

export default function SignLanguageHub({ onClose }: { onClose: () => void }) {
  const [language, setLanguage] = useState<SignLanguageCode>('asl')
  const [mode, setMode] = useState<SignOutputMode>('gloss')
  const [text, setText] = useState('Welcome to TryAMM. Sign language is a first-class language here.')
  const [result, setResult] = useState<SignTranslation | null>(null)
  const [capabilities, setCapabilities] = useState<SignCapabilities | null>(null)
  const [busy, setBusy] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const [cameraOn, setCameraOn] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const stopSpeechRef = useRef<null | (() => void)>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    signLanguageApi.capabilities().then(setCapabilities).catch(() => setCapabilities(null))
    return () => {
      stopSpeechRef.current?.()
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  const supported = useMemo(() => capabilities?.supportedSignLanguages || LANGUAGES.map(x => x.code), [capabilities])

  async function translate(nextText = text) {
    if (!nextText.trim()) return
    setBusy(true)
    setError('')
    try {
      const data = await signLanguageApi.translate({ text: nextText, signLanguage: language, mode })
      setResult(data)
    } catch (e: any) {
      setError(e.message || 'Translation failed')
    } finally {
      setBusy(false)
    }
  }

  function toggleSpeech() {
    if (listening) {
      stopSpeechRef.current?.()
      setListening(false)
      return
    }
    if (!canUseSpeechRecognition()) {
      setError('Live speech recognition is not available in this browser. You can still type or paste text.')
      return
    }
    setError('')
    setListening(true)
    stopSpeechRef.current = startSpeechRecognition(
      transcript => {
        setText(transcript)
        if (transcript) void translate(transcript)
      },
      () => setListening(false),
      message => {
        setError(message)
        setListening(false)
      },
    )
  }

  async function toggleCamera() {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setCameraOn(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      setCameraOn(true)
      requestAnimationFrame(() => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
    } catch {
      setError('Camera permission was not granted.')
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="TryAMM Sign Language Hub" style={styles.shell}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>TRYAMM ACCESSIBILITY</div>
          <h1 style={styles.title}>Sign Language Hub</h1>
          <p style={styles.subtitle}>Speech ⇄ text ⇄ sign, live captions, camera input, and avatar-ready output through one API.</p>
        </div>
        <button onClick={onClose} aria-label="Close Sign Language Hub" style={styles.close}>×</button>
      </header>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Speak or type</h2>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={6} style={styles.textarea} aria-label="Text to translate" />
          <div style={styles.row}>
            <button onClick={toggleSpeech} style={styles.primary}>{listening ? '■ Stop listening' : '🎙 Live speech'}</button>
            <button onClick={() => void translate()} disabled={busy} style={styles.secondary}>{busy ? 'Translating…' : 'Translate to sign'}</button>
          </div>
          <div style={styles.row}>
            <select value={language} onChange={e => setLanguage(e.target.value as SignLanguageCode)} style={styles.select} aria-label="Sign language">
              {LANGUAGES.filter(x => supported.includes(x.code)).map(x => <option value={x.code} key={x.code}>{x.label}</option>)}
            </select>
            <select value={mode} onChange={e => setMode(e.target.value as SignOutputMode)} style={styles.select} aria-label="Output mode">
              <option value="gloss">Sign gloss</option>
              <option value="fingerspell">Fingerspelling fallback</option>
              <option value="avatar">Avatar sequence</option>
            </select>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Sign output</h2>
          <div aria-live="polite" style={styles.output}>
            {result ? (
              <>
                <div style={styles.badge}>{result.signLanguage.toUpperCase()} · {result.provider}</div>
                <div style={styles.gloss}>{result.gloss.join(' · ') || 'No sign tokens returned'}</div>
                {result.fingerspelling && <div style={styles.fingers}>{result.fingerspelling.map(word => word.join(' ')).join('   /   ')}</div>}
                {result.avatarSequence && <div style={styles.avatar}>Avatar queue: {result.avatarSequence.map(x => x.token).join(' → ')}</div>}
                {result.warnings?.map(warning => <p key={warning} style={styles.warning}>{warning}</p>)}
              </>
            ) : <p style={styles.muted}>Your translated sign sequence will appear here.</p>}
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>Camera: sign → text</h2>
          <div style={styles.cameraFrame}>
            {cameraOn ? <video ref={videoRef} autoPlay muted playsInline style={styles.video} /> : <div style={styles.cameraPlaceholder}>Camera off</div>}
          </div>
          <button onClick={() => void toggleCamera()} style={styles.secondary}>{cameraOn ? 'Turn camera off' : 'Turn camera on'}</button>
          <p style={styles.muted}>{capabilities?.providerConfigured ? 'Recognition provider is configured. Hand/body landmark streaming can be connected here.' : 'Camera preview works now. Production sign recognition requires a configured sign-recognition model/provider.'}</p>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>System status</h2>
          <div style={styles.statusList}>
            <Status ok={Boolean(capabilities?.features.textToSign)} label="Text → sign" />
            <Status ok={Boolean(capabilities?.features.speechToSign)} label="Speech → sign" />
            <Status ok={Boolean(capabilities?.features.liveCaptions)} label="Live captions" />
            <Status ok={Boolean(capabilities?.features.offlineFingerspelling)} label="Offline fingerspelling fallback" />
            <Status ok={Boolean(capabilities?.features.signToText)} label="Sign → text model" />
            <Status ok={Boolean(capabilities?.features.avatarReady)} label="3D avatar provider" />
          </div>
          <p style={styles.muted}>No biometric identity is created by this interface. Camera access stays opt-in and can be stopped instantly.</p>
        </section>
      </div>
      {error && <div role="alert" style={styles.error}>{error}</div>}
    </div>
  )
}

function Status({ ok, label }: { ok: boolean; label: string }) {
  return <div style={styles.status}><span aria-hidden="true">{ok ? '✅' : '◻️'}</span><span>{label}</span></div>
}

const styles: Record<string, CSSProperties> = {
  shell: { minHeight: '100%', overflowY: 'auto', background: 'linear-gradient(180deg,#050816,#0d1230)', color: '#fff', padding: 24, boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' },
  header: { maxWidth: 1180, margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' },
  eyebrow: { fontSize: 12, letterSpacing: 2, fontWeight: 800, opacity: .7 },
  title: { margin: '6px 0', fontSize: 34 },
  subtitle: { margin: 0, maxWidth: 760, opacity: .78, lineHeight: 1.5 },
  close: { border: 0, background: 'rgba(255,255,255,.12)', color: '#fff', width: 44, height: 44, borderRadius: 14, fontSize: 30, cursor: 'pointer' },
  grid: { maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 },
  card: { background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: 18, backdropFilter: 'blur(12px)' },
  cardTitle: { marginTop: 0, marginBottom: 12, fontSize: 18 },
  textarea: { width: '100%', boxSizing: 'border-box', borderRadius: 14, border: '1px solid rgba(255,255,255,.2)', background: '#080d22', color: '#fff', padding: 14, fontSize: 16, resize: 'vertical' },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 },
  primary: { border: 0, borderRadius: 12, padding: '11px 14px', fontWeight: 800, cursor: 'pointer', background: '#fff', color: '#080d22' },
  secondary: { border: '1px solid rgba(255,255,255,.25)', borderRadius: 12, padding: '11px 14px', fontWeight: 700, cursor: 'pointer', background: 'rgba(255,255,255,.08)', color: '#fff' },
  select: { flex: 1, minWidth: 170, borderRadius: 12, border: '1px solid rgba(255,255,255,.2)', background: '#080d22', color: '#fff', padding: 11 },
  output: { minHeight: 170, padding: 14, borderRadius: 14, background: '#080d22' },
  badge: { display: 'inline-block', fontSize: 11, fontWeight: 800, letterSpacing: 1, padding: '6px 9px', borderRadius: 999, background: 'rgba(255,255,255,.1)' },
  gloss: { fontSize: 23, fontWeight: 900, lineHeight: 1.5, marginTop: 14 },
  fingers: { marginTop: 12, fontFamily: 'monospace', fontSize: 16, lineHeight: 1.6 },
  avatar: { marginTop: 12, opacity: .8 },
  warning: { margin: '12px 0 0', fontSize: 13, lineHeight: 1.4, opacity: .75 },
  muted: { opacity: .68, lineHeight: 1.45, fontSize: 14 },
  cameraFrame: { width: '100%', aspectRatio: '16/9', background: '#050817', borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  video: { width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' },
  cameraPlaceholder: { height: '100%', display: 'grid', placeItems: 'center', opacity: .5 },
  statusList: { display: 'grid', gap: 9 },
  status: { display: 'flex', alignItems: 'center', gap: 9, fontSize: 14 },
  error: { maxWidth: 1180, margin: '16px auto 0', padding: 12, borderRadius: 12, background: 'rgba(255,80,80,.14)', border: '1px solid rgba(255,80,80,.3)' },
}
