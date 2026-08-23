import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import {
  SPECIES_CATALOG, detectFaceFromImage, sampleFaceColors,
  generateAvatarTexture, type AvatarSpecies, type FaceData
} from '../game/avatar/AvatarSystem'
import { playLottie, stopLottie, type LottieAnimKey } from '../game/lottie/LottieAnimations'
import type { AnimationItem } from 'lottie-web'

type Step = 'species' | 'face' | 'preview'

const CATEGORY_COLORS = { human: '#00ccff', beast: '#ff6600', mythic: '#8800ff', divine: '#ffd700' }

export default function AvatarCreator({ onDone }: { onDone: () => void }) {
  const store = useGameStore()
  const [step, setStep] = useState<Step>('species')
  const [selectedSpecies, setSelectedSpecies] = useState<AvatarSpecies>('human_male')
  const [catFilter, setCatFilter] = useState<'all' | 'human' | 'beast' | 'mythic' | 'divine'>('all')
  const [faceMode, setFaceMode] = useState<'skip' | 'camera' | 'upload'>('skip')
  const [photos, setPhotos] = useState<string[]>([])
  const [faceData, setFaceData] = useState<FaceData | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState('')
  const [previewCanvas, setPreviewCanvas] = useState<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const scanLottieRef = useRef<AnimationItem | null>(null)
  const scanContainer = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const isHuman = selectedSpecies.startsWith('human')
  const species = SPECIES_CATALOG.find(s => s.id === selectedSpecies)!
  const filtered = catFilter === 'all' ? SPECIES_CATALOG : SPECIES_CATALOG.filter(s => s.category === catFilter)

  // Start camera
  const startCamera = async () => {
    setFaceMode('camera')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      store.setNotif('❌ Camera access denied. Use photo upload instead.')
      setFaceMode('upload')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
  }

  // Capture from camera
  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return
    setScanning(true)
    setScanMsg('Scanning face...')

    // Start scan animation
    if (scanContainer.current) {
      scanLottieRef.current = playLottie(scanContainer.current, 'face_scan', { loop: true, speed: 1.5 })
    }

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0)
    const url = canvas.toDataURL('image/jpeg', 0.8)

    await processPhoto(url)
    stopCamera()
    setScanMsg('Face detected!')
    setTimeout(() => { stopLottie(scanLottieRef.current); setScanning(false) }, 1000)
  }, [])

  // Handle file upload
  const handleFiles = async (files: FileList) => {
    const urls: string[] = []
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const f = files[i]
      if (!f.type.startsWith('image/')) continue
      urls.push(await fileToUrl(f))
    }
    if (!urls.length) { store.setNotif('❌ Please upload image files'); return }
    setPhotos(p => [...p, ...urls].slice(0, 3))
    await processPhoto(urls[0])
  }

  const processPhoto = async (url: string) => {
    setScanMsg('Detecting face...')
    const img = await loadImage(url)
    const landmarks = await detectFaceFromImage(img)
    const colors = sampleFaceColors(img, landmarks)

    const fd: FaceData = {
      photoUrls: [url, ...photos].slice(0, 3),
      primaryUrl: url,
      skinColor: colors.skin,
      hairColor: colors.hair,
      faceShape: 'oval',
      gender: selectedSpecies === 'human_female' ? 'female' : 'male',
      landmarks,
      textureCanvas: null,
    }
    setFaceData(fd)
    setPhotos(p => [url, ...p].slice(0, 3))
    setScanMsg(landmarks ? '✅ Face mapped to avatar!' : '✅ Color sampled from photo')
  }

  // Build preview when going to preview step
  useEffect(() => {
    if (step === 'preview') {
      const canvas = generateAvatarTexture({
        species: selectedSpecies,
        faceData,
        name: store.player.name,
        role: store.player.avatar,
      })
      setPreviewCanvas(canvas)
    }
  }, [step])

  const confirm = () => {
    store.setPlayer({ avatar: selectedSpecies as any })
    store.setNotif(`✅ Avatar set to ${species.label}!`)
    store.earnXp(100)
    onDone()
  }

  const C = '#00ccff'

  return (
    <div style={{ width: '100%', height: '100%', background: '#020212', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #00ffcc22' }}>
        <button onClick={onDone} style={{ background: '#00ffcc11', border: '1px solid #00ffcc44', color: '#00ffcc', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: 'monospace' }}>← BACK</button>
        <span style={{ color: '#00ffcc', fontWeight: 900, fontSize: 16, letterSpacing: 3 }}>🧬 AVATAR CREATOR</span>
        <span style={{ color: '#444', fontSize: 11, marginLeft: 'auto' }}>STEP {step === 'species' ? 1 : step === 'face' ? 2 : 3} / 3</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

        {/* STEP 1: SPECIES */}
        {step === 'species' && (
          <div>
            <p style={{ color: '#888', fontSize: 12, marginBottom: 14 }}>Choose your avatar species. Each has unique stats, animations, and visual identity in AMM City.</p>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {(['all', 'human', 'beast', 'mythic', 'divine'] as const).map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{
                  background: catFilter === c ? `${CATEGORY_COLORS[c as keyof typeof CATEGORY_COLORS] ?? '#00ffcc'}22` : 'transparent',
                  border: `1px solid ${catFilter === c ? (CATEGORY_COLORS[c as keyof typeof CATEGORY_COLORS] ?? '#00ffcc') : '#333'}`,
                  color: catFilter === c ? (CATEGORY_COLORS[c as keyof typeof CATEGORY_COLORS] ?? '#00ffcc') : '#666',
                  borderRadius: 6, padding: '5px 14px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase', fontSize: 11
                }}>{c}</button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {filtered.map(s => {
                const cc = CATEGORY_COLORS[s.category]
                const sel = selectedSpecies === s.id
                return (
                  <div key={s.id} onClick={() => setSelectedSpecies(s.id)} style={{
                    padding: 12, borderRadius: 8, cursor: 'pointer',
                    background: sel ? `${cc}15` : 'rgba(5,5,30,0.9)',
                    border: `2px solid ${sel ? cc : '#1a1a3e'}`,
                    transition: 'all 0.12s'
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 6, textAlign: 'center' }}>{s.emoji}</div>
                    <div style={{ color: sel ? cc : '#ccc', fontWeight: 700, fontSize: 12, textAlign: 'center' }}>{s.label}</div>
                    <div style={{ color: '#555', fontSize: 10, textAlign: 'center', marginTop: 3 }}>{s.bonus}</div>
                    <div style={{ color: cc + '88', fontSize: 9, textAlign: 'center', marginTop: 2, textTransform: 'uppercase' }}>{s.category}</div>
                  </div>
                )
              })}
            </div>

            {/* Selected preview */}
            <div style={{ marginTop: 16, padding: 14, background: 'rgba(5,5,30,0.9)', border: `1px solid ${CATEGORY_COLORS[species.category]}44`, borderRadius: 10 }}>
              <div style={{ color: '#fff', fontWeight: 700, marginBottom: 4 }}>{species.emoji} {species.label}</div>
              <div style={{ color: '#888', fontSize: 12, marginBottom: 4 }}>{species.desc}</div>
              <div style={{ color: CATEGORY_COLORS[species.category], fontSize: 12 }}>⚡ {species.bonus}</div>
            </div>

            <button onClick={() => setStep('face')} style={{ width: '100%', marginTop: 14, background: `${C}22`, border: `1px solid ${C}`, color: C, borderRadius: 8, padding: '12px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 14 }}>
              NEXT: FACE / PHOTO →
            </button>
          </div>
        )}

        {/* STEP 2: FACE SCAN / PHOTO */}
        {step === 'face' && (
          <div>
            <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>
              {isHuman
                ? 'Scan your face with the camera, upload 1-3 photos, or skip. Your face will be mapped as a texture mask onto your avatar head.'
                : `${species.label} uses a procedural face. You can still upload a photo to sample your skin and color tones.`}
            </p>

            {/* Mode selector */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              {[
                { id: 'camera' as const, label: '📷 SCAN FACE', desc: 'Use camera' },
                { id: 'upload' as const, label: '🖼 UPLOAD PHOTOS', desc: '1-3 photos' },
                { id: 'skip'   as const, label: '⏭ SKIP', desc: 'Use default' },
              ].map(m => (
                <div key={m.id} onClick={() => { setFaceMode(m.id); if (m.id === 'camera') startCamera(); else stopCamera() }}
                  style={{ flex: 1, padding: 12, borderRadius: 8, cursor: 'pointer', textAlign: 'center', background: faceMode === m.id ? `${C}15` : 'rgba(5,5,30,0.9)', border: `2px solid ${faceMode === m.id ? C : '#1a1a3e'}`, transition: 'all 0.12s' }}>
                  <div style={{ color: faceMode === m.id ? C : '#888', fontWeight: 700, fontSize: 12 }}>{m.label}</div>
                  <div style={{ color: '#555', fontSize: 10, marginTop: 2 }}>{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Camera view */}
            {faceMode === 'camera' && (
              <div style={{ position: 'relative', marginBottom: 14 }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', maxHeight: 240, borderRadius: 8, border: `1px solid ${C}44`, background: '#000', display: 'block' }} />
                {scanning && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                    <div ref={scanContainer} style={{ width: 120, height: 120 }} />
                    <div style={{ color: C, fontSize: 12, marginTop: 8 }}>{scanMsg}</div>
                  </div>
                )}
                <button onClick={capturePhoto} disabled={scanning}
                  style={{ width: '100%', marginTop: 8, background: '#00cc4422', border: '1px solid #00cc44', color: '#00cc44', borderRadius: 8, padding: '10px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>
                  📸 CAPTURE & SCAN
                </button>
              </div>
            )}

            {/* File upload */}
            {faceMode === 'upload' && (
              <div>
                <div onClick={() => fileRef.current?.click()}
                  style={{ border: `2px dashed ${C}44`, borderRadius: 10, padding: 24, textAlign: 'center', cursor: 'pointer', marginBottom: 12 }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>🖼</div>
                  <div style={{ color: '#888', fontSize: 12 }}>Click to upload 1-3 face photos</div>
                  <div style={{ color: '#555', fontSize: 10, marginTop: 4 }}>JPG, PNG, WEBP · Best results: clear front-facing photos</div>
                  <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files?.length) handleFiles(e.target.files) }} />
                </div>
                {photos.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    {photos.map((url, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={url} alt="face" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: `2px solid ${i === 0 ? C : '#333'}` }} />
                        {i === 0 && <div style={{ position: 'absolute', bottom: 2, left: 0, right: 0, textAlign: 'center', color: C, fontSize: 9, fontWeight: 700 }}>PRIMARY</div>}
                      </div>
                    ))}
                  </div>
                )}
                {faceData && (
                  <div style={{ padding: '8px 12px', background: '#00cc4411', border: '1px solid #00cc4433', borderRadius: 6, fontSize: 11, color: '#00cc44', marginBottom: 12 }}>
                    ✅ {faceData.landmarks ? 'Face landmarks detected and mapped to avatar' : 'Colors sampled from photo'}
                    <span style={{ color: '#555', marginLeft: 8 }}>Skin: <span style={{ color: faceData.skinColor, fontWeight: 700 }}>■</span> {faceData.skinColor}</span>
                  </div>
                )}
              </div>
            )}

            {/* Skip message */}
            {faceMode === 'skip' && (
              <div style={{ padding: 14, background: 'rgba(5,5,30,0.9)', border: '1px solid #1a1a3e', borderRadius: 8, color: '#888', fontSize: 12, marginBottom: 14 }}>
                Default avatar face will be used. You can always update this in Settings.
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setStep('species')} style={{ background: '#0a0a20', border: '1px solid #222', color: '#666', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontFamily: 'monospace' }}>← BACK</button>
              <button onClick={() => { stopCamera(); setStep('preview') }} style={{ flex: 1, background: `${C}22`, border: `1px solid ${C}`, color: C, borderRadius: 8, padding: '10px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 14 }}>
                PREVIEW AVATAR →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PREVIEW + CONFIRM */}
        {step === 'preview' && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#888', fontSize: 12, marginBottom: 16 }}>Your avatar is ready. This is how you'll appear in AMM City and all realms.</p>

            {/* Avatar preview canvas */}
            {previewCanvas && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{ position: 'relative', width: 180, height: 180 }}>
                  <div style={{ width: 180, height: 180, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${CATEGORY_COLORS[species.category]}`, boxShadow: `0 0 24px ${CATEGORY_COLORS[species.category]}44` }}>
                    <canvas ref={el => { if (el && previewCanvas) { el.width = 180; el.height = 180; el.getContext('2d')!.drawImage(previewCanvas, 0, 0, 256, 256, 0, 0, 180, 180) } }} style={{ display: 'block' }} />
                  </div>
                  <div style={{ position: 'absolute', bottom: -2, right: -2, background: '#020212', borderRadius: '50%', width: 48, height: 48, border: `2px solid ${CATEGORY_COLORS[species.category]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {species.emoji}
                  </div>
                </div>
              </div>
            )}

            <div style={{ color: '#fff', fontWeight: 900, fontSize: 20, marginBottom: 4 }}>{store.player.name}</div>
            <div style={{ color: CATEGORY_COLORS[species.category], marginBottom: 4 }}>{species.label}</div>
            <div style={{ color: '#888', fontSize: 12, marginBottom: 8 }}>{species.bonus}</div>
            {faceData?.primaryUrl && (
              <div style={{ color: '#00cc44', fontSize: 11, marginBottom: 16 }}>✅ Face texture applied from your photo</div>
            )}

            {/* Stat preview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'COMBAT', val: speciesStat(selectedSpecies, 'combat') },
                { label: 'SPEED', val: speciesStat(selectedSpecies, 'speed') },
                { label: 'FAITH', val: speciesStat(selectedSpecies, 'faith') },
                { label: 'WEALTH', val: speciesStat(selectedSpecies, 'wealth') },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(5,5,30,0.9)', border: '1px solid #1a1a3e', borderRadius: 8, padding: 10 }}>
                  <div style={{ color: '#555', fontSize: 9, marginBottom: 6 }}>{s.label}</div>
                  <div style={{ background: '#111', borderRadius: 3, height: 4, marginBottom: 4 }}>
                    <div style={{ background: CATEGORY_COLORS[species.category], height: '100%', width: `${s.val}%`, borderRadius: 3 }} />
                  </div>
                  <div style={{ color: CATEGORY_COLORS[species.category], fontSize: 12, fontWeight: 700 }}>{s.val}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep('face')} style={{ background: '#0a0a20', border: '1px solid #222', color: '#666', borderRadius: 8, padding: '10px 18px', cursor: 'pointer', fontFamily: 'monospace' }}>← BACK</button>
              <button onClick={confirm} style={{ flex: 1, background: `${CATEGORY_COLORS[species.category]}22`, border: `1px solid ${CATEGORY_COLORS[species.category]}`, color: CATEGORY_COLORS[species.category], borderRadius: 8, padding: '12px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 900, fontSize: 15 }}>
                ✅ CONFIRM AVATAR
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fileToUrl(f: File): Promise<string> {
  return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(f) })
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = url })
}

function speciesStat(species: AvatarSpecies, stat: 'combat' | 'speed' | 'faith' | 'wealth'): number {
  const table: Record<AvatarSpecies, Record<string, number>> = {
    human_male:   { combat: 60, speed: 65, faith: 60, wealth: 70 },
    human_female: { combat: 55, speed: 70, faith: 65, wealth: 80 },
    lion:         { combat: 90, speed: 75, faith: 70, wealth: 45 },
    eagle:        { combat: 70, speed: 95, faith: 75, wealth: 50 },
    wolf:         { combat: 80, speed: 85, faith: 50, wealth: 40 },
    bear:         { combat: 95, speed: 45, faith: 55, wealth: 50 },
    tiger:        { combat: 85, speed: 80, faith: 45, wealth: 50 },
    panther:      { combat: 80, speed: 85, faith: 40, wealth: 55 },
    horse:        { combat: 60, speed: 98, faith: 65, wealth: 60 },
    elephant:     { combat: 90, speed: 40, faith: 80, wealth: 70 },
    gorilla:      { combat: 95, speed: 55, faith: 40, wealth: 35 },
    owl:          { combat: 45, speed: 70, faith: 85, wealth: 75 },
    dragon:       { combat: 99, speed: 90, faith: 60, wealth: 80 },
    phoenix:      { combat: 85, speed: 95, faith: 90, wealth: 70 },
    anubis:       { combat: 80, speed: 70, faith: 99, wealth: 85 },
    seraphim:     { combat: 75, speed: 85, faith: 99, wealth: 99 },
  }
  return table[species]?.[stat] ?? 60
}
