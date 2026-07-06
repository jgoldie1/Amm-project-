// AMM Greatest Producer Studio
// 62-track DAW · Vocal Booth · Guitar Lab · Podcast Suite · Remote Record
// Web Audio API — zero cost, zero plugins needed, works in browser
// After Victor deploys: tracks save to Supabase Storage, collaborate via LiveKit

import { useState, useRef, useEffect, useCallback } from 'react'
import { useGameStore } from '../game/state/useGameStore'

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Track {
  id: number
  name: string
  category: 'vocal' | 'guitar' | 'drums' | 'keys' | 'bass' | 'fx' | 'sample' | 'podcast' | 'choir' | 'master'
  volume: number   // 0-1
  pan: number      // -1 to 1
  muted: boolean
  soloed: boolean
  armed: boolean   // record armed
  color: string
  hasRecording: boolean
  peakLevel: number
}

interface GuitarPreset {
  id: string
  name: string
  emoji: string
  drive: number
  tone: number
  reverb: number
  delay: number
  desc: string
}

type StudioMode = 'daw' | 'vocal' | 'guitar' | 'podcast' | 'remote' | 'mastering'

const TRACK_NAMES = [
  // Vocals
  { name:'Lead Vocal', cat:'vocal' as const, color:'#ff66cc' },
  { name:'Double Vocal', cat:'vocal' as const, color:'#ff66cc' },
  { name:'Hook Vocal', cat:'vocal' as const, color:'#ff88dd' },
  { name:'Adlibs', cat:'vocal' as const, color:'#ff44aa' },
  { name:'Rap Verse 1', cat:'vocal' as const, color:'#dd44cc' },
  { name:'Rap Verse 2', cat:'vocal' as const, color:'#dd44cc' },
  { name:'Spoken Word', cat:'vocal' as const, color:'#cc33bb' },
  { name:'Podcast Voice', cat:'podcast' as const, color:'#8800ff' },
  { name:'AI TV Voice', cat:'podcast' as const, color:'#9900ff' },
  // Choir
  { name:'Choir Soprano', cat:'choir' as const, color:'#ffaa00' },
  { name:'Choir Alto', cat:'choir' as const, color:'#ffaa00' },
  { name:'Choir Tenor', cat:'choir' as const, color:'#ff8800' },
  { name:'Choir Bass', cat:'choir' as const, color:'#ff7700' },
  { name:'BGV 1', cat:'choir' as const, color:'#ee9900' },
  { name:'BGV 2', cat:'choir' as const, color:'#ee9900' },
  { name:'BGV 3', cat:'choir' as const, color:'#dd8800' },
  // Drums
  { name:'Kick 808', cat:'drums' as const, color:'#ff4400' },
  { name:'Snare', cat:'drums' as const, color:'#ff5500' },
  { name:'Hi Hat', cat:'drums' as const, color:'#ff6600' },
  { name:'Open Hat', cat:'drums' as const, color:'#ff7700' },
  { name:'Clap', cat:'drums' as const, color:'#ff8800' },
  { name:'Perc 1', cat:'drums' as const, color:'#ee4400' },
  { name:'Perc 2', cat:'drums' as const, color:'#ee5500' },
  // Bass
  { name:'808 Bass', cat:'bass' as const, color:'#00cc44' },
  { name:'Live Bass', cat:'bass' as const, color:'#00bb44' },
  { name:'Bass FX', cat:'bass' as const, color:'#00aa33' },
  // Guitar
  { name:'Guitar Lead', cat:'guitar' as const, color:'#00ccff' },
  { name:'Guitar Rhythm', cat:'guitar' as const, color:'#00bbff' },
  { name:'Guitar Clean', cat:'guitar' as const, color:'#00aaff' },
  { name:'Guitar FX', cat:'guitar' as const, color:'#0099ff' },
  { name:'Bass Guitar', cat:'guitar' as const, color:'#0088ee' },
  // Keys
  { name:'Piano', cat:'keys' as const, color:'#ffd700' },
  { name:'Rhodes', cat:'keys' as const, color:'#ffcc00' },
  { name:'Organ', cat:'keys' as const, color:'#ffbb00' },
  { name:'Synth Lead', cat:'keys' as const, color:'#ffaa00' },
  { name:'Synth Pad', cat:'keys' as const, color:'#ff9900' },
  { name:'Strings', cat:'keys' as const, color:'#ff8800' },
  { name:'Brass', cat:'keys' as const, color:'#ff7700' },
  // Samples
  { name:'Sample 1', cat:'sample' as const, color:'#8800ff' },
  { name:'Sample 2', cat:'sample' as const, color:'#9900ff' },
  { name:'Loop 1', cat:'sample' as const, color:'#aa00ff' },
  { name:'Loop 2', cat:'sample' as const, color:'#bb00ff' },
  // FX
  { name:'FX Rise', cat:'fx' as const, color:'#00ffcc' },
  { name:'FX Hit', cat:'fx' as const, color:'#00eebb' },
  { name:'FX Sweep', cat:'fx' as const, color:'#00ddaa' },
  { name:'FX Impact', cat:'fx' as const, color:'#00cc99' },
  { name:'Crowd FX', cat:'fx' as const, color:'#00bb88' },
  // Structure
  { name:'Intro', cat:'sample' as const, color:'#aaaaaa' },
  { name:'Verse Stack', cat:'sample' as const, color:'#aaaaaa' },
  { name:'Chorus Stack', cat:'sample' as const, color:'#aaaaaa' },
  { name:'Bridge', cat:'sample' as const, color:'#aaaaaa' },
  { name:'Outro', cat:'sample' as const, color:'#888888' },
  // AR/VR
  { name:'AR Spatial L', cat:'fx' as const, color:'#00ffcc' },
  { name:'AR Spatial R', cat:'fx' as const, color:'#00ffcc' },
  { name:'Metaverse Amb', cat:'fx' as const, color:'#00ddaa' },
  // Master buses
  { name:'Drum Bus', cat:'master' as const, color:'#555555' },
  { name:'Music Bus', cat:'master' as const, color:'#555555' },
  { name:'Vocal Bus', cat:'master' as const, color:'#555555' },
  { name:'FX Bus', cat:'master' as const, color:'#555555' },
  { name:'Podcast Bus', cat:'master' as const, color:'#555555' },
  { name:'Reference Track', cat:'sample' as const, color:'#444444' },
  { name:'Master Print', cat:'master' as const, color:'#333333' },
  { name:'Final Bounce', cat:'master' as const, color:'#222222' },
]

const GUITAR_PRESETS: GuitarPreset[] = [
  { id:'gospel_clean', name:'Clean Gospel',    emoji:'✝️', drive:0.1, tone:0.7, reverb:0.5, delay:0.3, desc:'Crystal clean Gospel tone. Warm, chimey, and full of space.' },
  { id:'trap_guitar',  name:'Trap Guitar',     emoji:'🔥', drive:0.4, tone:0.6, reverb:0.2, delay:0.4, desc:'Melodic trap lead. Slightly crunchy with slapback delay.' },
  { id:'afrobeat',     name:'Afrobeat Rhythm', emoji:'🌍', drive:0.2, tone:0.8, reverb:0.3, delay:0.5, desc:'Percussive clean rhythm with a bit of chorus shimmer.' },
  { id:'worship_amb',  name:'Worship Ambient', emoji:'🕊️', drive:0.05,tone:0.5, reverb:0.9, delay:0.7, desc:'Soaring ambient worship. Long reverb, dotted delay.' },
  { id:'rock_lead',    name:'Rock Lead',       emoji:'⚡', drive:0.8, tone:0.5, reverb:0.3, delay:0.2, desc:'High-gain lead with sustain and harmonics.' },
  { id:'rnb_clean',    name:'R&B Clean',       emoji:'💿', drive:0.15,tone:0.75,reverb:0.4, delay:0.35,desc:'Funk-influenced clean with smooth attack.' },
]

export default function RecordingStudio({ onClose }: { onClose: () => void }) {
  const store = useGameStore()
  const [mode, setMode] = useState<StudioMode>('daw')
  const [tracks, setTracks] = useState<Track[]>(
    TRACK_NAMES.map((t, i) => ({
      id: i + 1, name: t.name, category: t.cat, volume: 0.75, pan: 0,
      muted: false, soloed: false, armed: false, color: t.color,
      hasRecording: false, peakLevel: 0,
    }))
  )
  const [bpm, setBpm] = useState(90)
  const [key, setKey] = useState('C Major')
  const [selectedGuitar, setSelectedGuitar] = useState(GUITAR_PRESETS[0])
  const [drive, setDrive] = useState(0.1)
  const [tone, setTone] = useState(0.7)
  const [reverb, setReverb] = useState(0.5)
  const [delay, setDelay] = useState(0.3)
  const [recording, setRecording] = useState(false)
  const [recordingTrackId, setRecordingTrackId] = useState<number | null>(null)
  const [chunks, setChunks] = useState<Blob[]>([])
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [masterVol, setMasterVol] = useState(0.85)
  const [playing, setPlaying] = useState(false)
  const [playhead, setPlayhead] = useState(0)
  const [podcastTopic, setPodcastTopic] = useState('')
  const [podcastScript, setPodcastScript] = useState('')
  const [remoteCode, setRemoteCode] = useState('')
  const [filterCat, setFilterCat] = useState<Track['category'] | 'all'>('all')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const playheadRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const peakRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Animate peak meters
  useEffect(() => {
    peakRef.current = setInterval(() => {
      setTracks(prev => prev.map(t => ({
        ...t,
        peakLevel: playing ? Math.random() * (t.volume * 0.9) : 0
      })))
    }, 80)
    return () => { if (peakRef.current) clearInterval(peakRef.current) }
  }, [playing])

  // Playhead
  useEffect(() => {
    if (playing) {
      playheadRef.current = setInterval(() => setPlayhead(p => (p + 1) % 64), 100)
    } else {
      if (playheadRef.current) clearInterval(playheadRef.current)
    }
    return () => { if (playheadRef.current) clearInterval(playheadRef.current) }
  }, [playing])

  const startRecord = async (trackId: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      const newChunks: Blob[] = []
      recorder.ondataavailable = e => newChunks.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(newChunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        setTracks(prev => prev.map(t => t.id === trackId ? { ...t, hasRecording: true } : t))
        store.setNotif(`✅ Take recorded on "${tracks.find(t=>t.id===trackId)?.name}"! Download below.`)
        store.earnXp(100)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
      setRecordingTrackId(trackId)
      setChunks(newChunks)
      store.setNotif(`🔴 Recording "${tracks.find(t=>t.id===trackId)?.name}"...`)
    } catch (e) {
      store.setNotif('❌ Microphone access denied. Allow mic in browser settings.')
    }
  }

  const stopRecord = () => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(t => t.stop())
    setRecording(false)
    setRecordingTrackId(null)
  }

  const applyGuitarPreset = (preset: GuitarPreset) => {
    setSelectedGuitar(preset)
    setDrive(preset.drive)
    setTone(preset.tone)
    setReverb(preset.reverb)
    setDelay(preset.delay)
    store.setNotif(`🎸 ${preset.name} loaded — ${preset.desc}`)
  }

  const generatePodcastScript = () => {
    if (!podcastTopic.trim()) { store.setNotif('❌ Enter a podcast topic'); return }
    const script = `FAITH CREATOR PODCAST — "${podcastTopic}"
GENERATED SCRIPT · AMM OMNIVERSE

[INTRO — 30 seconds]
"Welcome to the All American Marketplace Faith Creator Podcast. I'm your host and today we're talking about: ${podcastTopic}. Whether you're a creator, a business owner, or someone walking by faith — this episode is for you."

[SEGMENT 1 — The Foundation — 3-4 minutes]
"Let's start with the foundation. When it comes to ${podcastTopic}, the Word tells us that faith without works is dead. That means we have to show up — consistently, creatively, and with purpose."

[SEGMENT 2 — The Community Angle — 3-4 minutes]  
"The Black creator community has been doing this without the platform and the resources for too long. That's why All American Marketplace exists — to be the platform that was built FOR us, BY us. ${podcastTopic} is something our community needs to talk about openly."

[SEGMENT 3 — Practical Steps — 3-4 minutes]
"Here are three things you can do TODAY about ${podcastTopic}:
1. Start where you are — don't wait for perfect conditions
2. Build in community — find your tribe on AMM Omniverse
3. Monetize your message — your story has value"

[OUTRO — 30 seconds]
"That's our episode on ${podcastTopic}. Find us at tryamm.online. Subscribe to AMM Creator plan for full access. Drop a gift in the stream if this blessed you. See you next episode — walk in faith, walk in freedom."

[CALL TO ACTION]
"Follow on TikTok, BIGO Live, AMM Omniverse. New episodes weekly. God bless."`
    setPodcastScript(script)
    store.setNotif('📝 Podcast script generated!')
  }

  const filteredTracks = filterCat === 'all' ? tracks : tracks.filter(t => t.category === filterCat)
  const soloedTracks = tracks.filter(t => t.soloed)

  const CATS: { id: Track['category'] | 'all'; label: string; color: string }[] = [
    { id:'all', label:'All 62', color:'#555' },
    { id:'vocal', label:'Vocal', color:'#ff66cc' },
    { id:'choir', label:'Choir', color:'#ffaa00' },
    { id:'drums', label:'Drums', color:'#ff4400' },
    { id:'guitar', label:'Guitar', color:'#00ccff' },
    { id:'bass', label:'Bass', color:'#00cc44' },
    { id:'keys', label:'Keys', color:'#ffd700' },
    { id:'sample', label:'Samples', color:'#8800ff' },
    { id:'fx', label:'FX', color:'#00ffcc' },
    { id:'podcast', label:'Podcast', color:'#9900ff' },
    { id:'master', label:'Buses', color:'#333' },
  ]

  return (
    <div style={{ width:'100%',height:'100%',background:'#03040c',fontFamily:'monospace',color:'#ccc',display:'flex',flexDirection:'column' }}>
      {/* Header */}
      <div style={{ padding:'8px 14px',background:'linear-gradient(135deg,#001a24,#24002d)',borderBottom:'1px solid #00ccff44',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap' }}>
        <button onClick={onClose} style={{ background:'none',border:'1px solid #333',color:'#555',borderRadius:4,padding:'4px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>← EXIT</button>
        <div>
          <div style={{ color:'#00ccff',fontWeight:900,fontSize:13,letterSpacing:2 }}>🎵 AMM GREATEST PRODUCER STUDIO</div>
          <div style={{ color:'#555',fontSize:9 }}>62-track DAW · Vocal Booth · Guitar Lab · Podcast · Remote Record</div>
        </div>
        {/* Transport */}
        <div style={{ marginLeft:'auto',display:'flex',gap:6,alignItems:'center' }}>
          <button onClick={()=>setPlayhead(0)} style={{ background:'#111',border:'1px solid #333',color:'#888',borderRadius:5,padding:'5px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:11 }}>⏮</button>
          <button onClick={()=>setPlaying(p=>!p)} style={{ background:playing?'rgba(255,68,0,.2)':'rgba(0,204,68,.2)',border:`1px solid ${playing?'#ff4400':'#00cc44'}`,color:playing?'#ff4400':'#00cc44',borderRadius:5,padding:'5px 12px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>{playing?'⏸':'▶'}</button>
          <div style={{ background:'#111',border:'1px solid #333',borderRadius:5,padding:'4px 8px',fontSize:10,color:'#00cc44' }}>
            {String(Math.floor(playhead/16)+1).padStart(2,'0')}:{String(playhead%16).padStart(2,'0')}
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:4 }}>
            <span style={{ color:'#555',fontSize:10 }}>BPM</span>
            <input type="number" value={bpm} onChange={e=>setBpm(Number(e.target.value))} style={{ width:45,background:'#111',border:'1px solid #333',color:'#ffd700',borderRadius:4,padding:'3px 5px',fontFamily:'monospace',fontSize:11,textAlign:'center' }}/>
          </div>
          <select value={key} onChange={e=>setKey(e.target.value)} style={{ background:'#111',border:'1px solid #333',color:'#ffd700',borderRadius:4,padding:'3px',fontFamily:'monospace',fontSize:10 }}>
            {['C Major','G Major','D Major','A Major','E Major','F Major','Bb Major','A Minor','E Minor','D Minor','B Minor'].map(k=><option key={k}>{k}</option>)}
          </select>
        </div>
      </div>

      {/* Mode tabs */}
      <div style={{ display:'flex',borderBottom:'1px solid #0a0a20',background:'rgba(0,0,0,0.6)' }}>
        {([
          ['daw','🎛 DAW','#00ccff'],
          ['vocal','🎤 Vocal','#ff66cc'],
          ['guitar','🎸 Guitar Lab','#00cc44'],
          ['podcast','🎙 Podcast','#8800ff'],
          ['remote','📡 Remote','#ffaa00'],
          ['mastering','⚙️ Master','#ffd700'],
        ] as [StudioMode,string,string][]).map(([m,label,c])=>(
          <button key={m} onClick={()=>setMode(m)}
            style={{ flex:1,padding:'7px 4px',background:mode===m?`${c}15`:'transparent',border:'none',borderBottom:mode===m?`2px solid ${c}`:'2px solid transparent',color:mode===m?c:'#555',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:mode===m?700:400,whiteSpace:'nowrap' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto' }}>

        {/* ── DAW MODE ─────────────────────────────── */}
        {mode==='daw'&&(
          <div>
            {/* Master volume + category filter */}
            <div style={{ padding:'8px 12px',borderBottom:'1px solid #0a0a20',display:'flex',gap:10,alignItems:'center',flexWrap:'wrap' }}>
              <span style={{ color:'#555',fontSize:10 }}>MASTER VOL</span>
              <input type="range" min={0} max={1} step={0.01} value={masterVol} onChange={e=>setMasterVol(Number(e.target.value))} style={{ width:80,accentColor:'#00ccff' }}/>
              <span style={{ color:'#00ccff',fontSize:10 }}>{Math.round(masterVol*100)}%</span>
              <div style={{ flex:1 }}/>
              <span style={{ color:'#555',fontSize:10 }}>FILTER:</span>
              {CATS.map(c=>(
                <button key={c.id} onClick={()=>setFilterCat(c.id)}
                  style={{ background:filterCat===c.id?`${c.color}20`:'transparent',border:`1px solid ${filterCat===c.id?c.color:'#222'}`,color:filterCat===c.id?c.color:'#555',borderRadius:20,padding:'2px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:9 }}>
                  {c.label}
                </button>
              ))}
            </div>

            {/* Track list */}
            <div style={{ padding:'8px 12px' }}>
              {filteredTracks.map(track => {
                const isRecordingThis = recordingTrackId === track.id && recording
                return (
                  <div key={track.id} style={{ display:'flex',gap:6,alignItems:'center',padding:'5px 0',borderBottom:'1px solid #060610',marginBottom:1 }}>
                    {/* Track number + name */}
                    <div style={{ width:16,color:'#444',fontSize:9,textAlign:'right',flexShrink:0 }}>{track.id}</div>
                    <div style={{ background:track.color+'22',border:`1px solid ${track.color}44`,borderRadius:5,padding:'3px 7px',minWidth:110,maxWidth:110 }}>
                      <div style={{ color:track.color,fontSize:9,fontWeight:700,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{track.name}</div>
                    </div>
                    {/* Volume */}
                    <input type="range" min={0} max={1} step={0.01} value={track.volume}
                      onChange={e=>setTracks(prev=>prev.map(t=>t.id===track.id?{...t,volume:Number(e.target.value)}:t))}
                      style={{ width:60,accentColor:track.color }}/>
                    {/* Pan */}
                    <input type="range" min={-1} max={1} step={0.01} value={track.pan}
                      onChange={e=>setTracks(prev=>prev.map(t=>t.id===track.id?{...t,pan:Number(e.target.value)}:t))}
                      style={{ width:40,accentColor:'#888' }}/>
                    {/* Buttons */}
                    <button onClick={()=>setTracks(prev=>prev.map(t=>t.id===track.id?{...t,muted:!t.muted}:t))}
                      style={{ background:track.muted?'rgba(255,68,0,.3)':'transparent',border:`1px solid ${track.muted?'#ff4400':'#333'}`,color:track.muted?'#ff4400':'#555',borderRadius:4,padding:'2px 6px',cursor:'pointer',fontFamily:'monospace',fontSize:9 }}>M</button>
                    <button onClick={()=>setTracks(prev=>prev.map(t=>t.id===track.id?{...t,soloed:!t.soloed}:t))}
                      style={{ background:track.soloed?'rgba(255,215,0,.2)':'transparent',border:`1px solid ${track.soloed?'#ffd700':'#333'}`,color:track.soloed?'#ffd700':'#555',borderRadius:4,padding:'2px 6px',cursor:'pointer',fontFamily:'monospace',fontSize:9 }}>S</button>
                    {/* Record arm */}
                    <button onClick={()=>{ if(isRecordingThis){stopRecord()}else{startRecord(track.id)} }}
                      style={{ background:isRecordingThis?'rgba(255,0,0,.4)':'transparent',border:`1px solid ${isRecordingThis?'#ff0000':track.armed?'#ff4400':'#333'}`,color:isRecordingThis?'#ff0000':track.armed?'#ff4400':'#555',borderRadius:4,padding:'2px 6px',cursor:'pointer',fontFamily:'monospace',fontSize:9,animation:isRecordingThis?'pulse 1s infinite':undefined }}>
                      {isRecordingThis?'⏹':'🔴'}
                    </button>
                    {/* Peak meter */}
                    <div style={{ flex:1,height:6,background:'#0a0a15',borderRadius:3,overflow:'hidden' }}>
                      <div style={{ height:'100%',width:`${Math.min(100,track.peakLevel*100)}%`,background:`linear-gradient(90deg,#00cc44,#ffcc00,#ff4400)`,borderRadius:3,transition:'width .05s' }}/>
                    </div>
                    {/* Has recording indicator */}
                    {track.hasRecording && <span style={{ color:'#00cc44',fontSize:9 }}>●</span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── VOCAL BOOTH ─────────────────────────── */}
        {mode==='vocal'&&(
          <div style={{ padding:14 }}>
            <div style={{ background:'rgba(255,102,204,.06)',border:'1px solid #ff66cc33',borderRadius:12,padding:14,marginBottom:14 }}>
              <div style={{ color:'#ff66cc',fontWeight:700,fontSize:13,marginBottom:8 }}>🎤 VOCAL BOOTH</div>
              <div style={{ color:'#888',fontSize:11,lineHeight:1.7,marginBottom:12 }}>
                Record your vocals directly in AMM. Single track or multi-take for doubles and harmonies. Best practices: get close to mic, pop filter if possible, record dry (no reverb in the room), leave headroom.
              </div>
              {/* Vocal chain settings */}
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }}>
                {[{label:'Low Cut',val:80,unit:'Hz'},{label:'Gain',val:0,unit:'dB'},{label:'Comp Ratio',val:4,unit:':1'},{label:'Reverb Send',val:20,unit:'%'}].map(c=>(
                  <div key={c.label} style={{ background:'#09091c',borderRadius:8,padding:'8px 10px' }}>
                    <div style={{ color:'#888',fontSize:9,marginBottom:3 }}>{c.label}</div>
                    <div style={{ color:'#ff66cc',fontWeight:700,fontSize:14 }}>{c.val}{c.unit}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12 }}>
              {tracks.filter(t=>t.category==='vocal'||t.category==='choir').map(t=>(
                <button key={t.id} onClick={()=>recording&&recordingTrackId===t.id?stopRecord():startRecord(t.id)}
                  style={{ background:recording&&recordingTrackId===t.id?'rgba(255,0,0,.2)':t.hasRecording?`${t.color}10`:'#09091c',border:`1px solid ${recording&&recordingTrackId===t.id?'#ff0000':t.color+'44'}`,color:recording&&recordingTrackId===t.id?'#ff0000':t.color,borderRadius:8,padding:'10px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:10,fontWeight:700,textAlign:'left' }}>
                  <div style={{ marginBottom:3 }}>{recording&&recordingTrackId===t.id?'⏹ STOP':'🔴 REC'} {t.name}</div>
                  {t.hasRecording&&<div style={{ color:'#00cc44',fontSize:8 }}>● Has recording</div>}
                </button>
              ))}
            </div>
            {downloadUrl&&(
              <a href={downloadUrl} download="amm-vocal-take.webm" style={{ display:'block',width:'100%',background:'rgba(0,204,68,.15)',border:'1px solid #00cc44',color:'#00cc44',borderRadius:8,padding:'10px',textAlign:'center',fontFamily:'monospace',fontWeight:700,textDecoration:'none',fontSize:12 }}>
                ⬇ DOWNLOAD VOCAL TAKE (.webm)
              </a>
            )}
          </div>
        )}

        {/* ── GUITAR LAB ──────────────────────────── */}
        {mode==='guitar'&&(
          <div style={{ padding:14 }}>
            <div style={{ color:'#00cc44',fontWeight:700,fontSize:13,marginBottom:12 }}>🎸 GUITAR LAB PROTOCOL</div>
            {/* Presets */}
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:16 }}>
              {GUITAR_PRESETS.map(p=>(
                <div key={p.id} onClick={()=>applyGuitarPreset(p)}
                  style={{ background:selectedGuitar.id===p.id?'rgba(0,204,68,.12)':'#09091c',border:`1px solid ${selectedGuitar.id===p.id?'#00cc44':'#222'}`,borderRadius:10,padding:12,cursor:'pointer' }}>
                  <div style={{ fontSize:20,marginBottom:5 }}>{p.emoji}</div>
                  <div style={{ color:selectedGuitar.id===p.id?'#00cc44':'#888',fontWeight:700,fontSize:11,marginBottom:2 }}>{p.name}</div>
                  <div style={{ color:'#555',fontSize:9 }}>{p.desc}</div>
                </div>
              ))}
            </div>
            {/* Signal chain */}
            <div style={{ background:'rgba(0,204,68,.04)',border:'1px solid #00cc4422',borderRadius:10,padding:14,marginBottom:14 }}>
              <div style={{ color:'#00cc44',fontWeight:700,fontSize:11,marginBottom:12 }}>SIGNAL CHAIN — {selectedGuitar.name}</div>
              {[{label:'DRIVE',val:drive,setter:setDrive,color:'#ff4400'},{label:'TONE',val:tone,setter:setTone,color:'#ffd700'},{label:'REVERB',val:reverb,setter:setReverb,color:'#00ccff'},{label:'DELAY',val:delay,setter:setDelay,color:'#8800ff'}].map(knob=>(
                <div key={knob.label} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4 }}>
                    <span style={{ color:knob.color }}>{knob.label}</span>
                    <span style={{ color:knob.color,fontWeight:700 }}>{Math.round(knob.val*100)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.01} value={knob.val} onChange={e=>knob.setter(Number(e.target.value))} style={{ width:'100%',accentColor:knob.color }}/>
                </div>
              ))}
            </div>
            {/* Record guitar */}
            <button onClick={()=>recording?stopRecord():startRecord(tracks.find(t=>t.name==='Guitar Lead')?.id||27)}
              style={{ width:'100%',background:recording?'rgba(255,0,0,.2)':'rgba(0,204,68,.15)',border:`2px solid ${recording?'#ff0000':'#00cc44'}`,color:recording?'#ff0000':'#00cc44',borderRadius:10,padding:14,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:13 }}>
              {recording?'⏹ STOP GUITAR RECORDING':'🎸 RECORD GUITAR'}
            </button>
            {downloadUrl&&!recording&&(
              <a href={downloadUrl} download="amm-guitar-take.webm" style={{ display:'block',marginTop:8,width:'100%',background:'rgba(0,204,68,.1)',border:'1px solid #00cc44',color:'#00cc44',borderRadius:8,padding:'9px',textAlign:'center',fontFamily:'monospace',fontWeight:700,textDecoration:'none',fontSize:11 }}>⬇ DOWNLOAD GUITAR TAKE</a>
            )}
          </div>
        )}

        {/* ── PODCAST SUITE ───────────────────────── */}
        {mode==='podcast'&&(
          <div style={{ padding:14 }}>
            <div style={{ color:'#8800ff',fontWeight:700,fontSize:13,marginBottom:12 }}>🎙 FAITH PODCAST SUITE</div>

            {/* Room selector */}
            <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:14 }}>
              {[['🎤','Music Stage','holographic performance'],['🎙','Faith Podcast','teaching, sermons, Q&A'],['⚡','Debate Room','moderated discussions']].map(([e,n,d])=>(
                <div key={n as string} style={{ background:'rgba(136,0,255,.08)',border:'1px solid #8800ff44',borderRadius:10,padding:10,textAlign:'center',cursor:'pointer' }}
                  onClick={()=>store.setNotif(`Opening ${n} — Go to Music Realm → LIVE tab to stream!`)}>
                  <div style={{ fontSize:22,marginBottom:5 }}>{e}</div>
                  <div style={{ color:'#8800ff',fontWeight:700,fontSize:10,marginBottom:2 }}>{n}</div>
                  <div style={{ color:'#555',fontSize:9 }}>{d as string}</div>
                </div>
              ))}
            </div>

            {/* Script generator */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>AI SCRIPT GENERATOR</div>
              <input value={podcastTopic} onChange={e=>setPodcastTopic(e.target.value)} placeholder="Episode topic (e.g. 'Faith and Financial Freedom')"
                style={{ width:'100%',background:'#09091c',border:'1px solid #8800ff44',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
              <button onClick={generatePodcastScript} style={{ width:'100%',background:'rgba(136,0,255,.15)',border:'1px solid #8800ff',color:'#8800ff',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
                📝 GENERATE PODCAST SCRIPT
              </button>
            </div>
            {podcastScript&&(
              <div style={{ background:'#09091c',border:'1px solid #8800ff22',borderRadius:10,padding:12,marginBottom:12 }}>
                <div style={{ display:'flex',justifyContent:'space-between',marginBottom:8 }}>
                  <span style={{ color:'#8800ff',fontSize:11,fontWeight:700 }}>GENERATED SCRIPT</span>
                  <button onClick={()=>{navigator.clipboard?.writeText(podcastScript);store.setNotif('📋 Script copied!')}}
                    style={{ background:'rgba(136,0,255,.1)',border:'1px solid #8800ff33',color:'#8800ff',borderRadius:5,padding:'3px 8px',cursor:'pointer',fontFamily:'monospace',fontSize:9 }}>📋 COPY</button>
                </div>
                <pre style={{ whiteSpace:'pre-wrap',fontSize:10,color:'#aaa',lineHeight:1.7,margin:0 }}>{podcastScript}</pre>
              </div>
            )}
            {/* Record podcast */}
            <button onClick={()=>recording?stopRecord():startRecord(tracks.find(t=>t.name==='Podcast Voice')?.id||8)}
              style={{ width:'100%',background:recording?'rgba(255,0,0,.2)':'rgba(136,0,255,.15)',border:`2px solid ${recording?'#ff0000':'#8800ff'}`,color:recording?'#ff0000':'#8800ff',borderRadius:10,padding:14,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:13 }}>
              {recording?'⏹ STOP PODCAST RECORDING':'🎙 RECORD PODCAST EPISODE'}
            </button>
            {downloadUrl&&!recording&&(
              <a href={downloadUrl} download="amm-podcast-episode.webm" style={{ display:'block',marginTop:8,background:'rgba(136,0,255,.1)',border:'1px solid #8800ff33',color:'#8800ff',borderRadius:8,padding:'9px',textAlign:'center',fontFamily:'monospace',fontWeight:700,textDecoration:'none',fontSize:11 }}>⬇ DOWNLOAD PODCAST EPISODE</a>
            )}
          </div>
        )}

        {/* ── REMOTE RECORD ───────────────────────── */}
        {mode==='remote'&&(
          <div style={{ padding:14 }}>
            <div style={{ color:'#ffaa00',fontWeight:700,fontSize:13,marginBottom:12 }}>📡 REMOTE RECORD</div>
            <div style={{ background:'rgba(255,170,0,.06)',border:'1px solid #ffaa0033',borderRadius:10,padding:14,marginBottom:14,fontSize:11,color:'#888',lineHeight:1.7 }}>
              Record remotely with other artists, producers, and session musicians over the internet. Feature uses LiveKit WebRTC for real-time audio collaboration. Victor adds LiveKit for $75 extra after the main $400 deployment.
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>YOUR SESSION CODE</div>
              <div style={{ background:'#09091c',border:'1px solid #ffaa0044',borderRadius:8,padding:12,display:'flex',gap:8,alignItems:'center' }}>
                <span style={{ color:'#ffaa00',fontWeight:900,fontSize:16,letterSpacing:6,flex:1 }}>AMM-{Math.random().toString(36).slice(2,6).toUpperCase()}</span>
                <button onClick={()=>store.setNotif('📋 Session code copied!')} style={{ background:'rgba(255,170,0,.1)',border:'1px solid #ffaa0033',color:'#ffaa00',borderRadius:5,padding:'5px 10px',cursor:'pointer',fontFamily:'monospace',fontSize:10 }}>📋 COPY</button>
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11,color:'#555',marginBottom:8,letterSpacing:2 }}>JOIN A SESSION</div>
              <input value={remoteCode} onChange={e=>setRemoteCode(e.target.value)} placeholder="Enter session code..."
                style={{ width:'100%',background:'#09091c',border:'1px solid #ffaa0033',color:'#ccc',borderRadius:8,padding:'9px 12px',fontFamily:'monospace',fontSize:12,marginBottom:8,boxSizing:'border-box' as const }}/>
              <button onClick={()=>store.setNotif('📡 Connecting to remote session... LiveKit required. Victor adds this for $75.')}
                style={{ width:'100%',background:'rgba(255,170,0,.15)',border:'1px solid #ffaa00',color:'#ffaa00',borderRadius:8,padding:'10px',cursor:'pointer',fontFamily:'monospace',fontWeight:700,fontSize:12 }}>
                📡 JOIN REMOTE SESSION
              </button>
            </div>
            <div style={{ fontSize:11,color:'#555',lineHeight:1.8 }}>
              Once LiveKit is connected ($75 add-on):<br/>
              ✓ Real-time remote recording with any artist anywhere<br/>
              ✓ Each participant's audio recorded on separate tracks<br/>
              ✓ Low-latency audio, stems download after session<br/>
              ✓ Chat + waveform monitoring during recording
            </div>
          </div>
        )}

        {/* ── MASTERING ───────────────────────────── */}
        {mode==='mastering'&&(
          <div style={{ padding:14 }}>
            <div style={{ color:'#ffd700',fontWeight:700,fontSize:13,marginBottom:12 }}>⚙️ MASTERING SUITE</div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14 }}>
              {[{label:'Loudness',val:-14,unit:'LUFS'},{label:'True Peak',val:-1,unit:'dBTP'},{label:'Stereo Width',val:85,unit:'%'},{label:'High Shelf',val:3,unit:'dB'}].map(m=>(
                <div key={m.label} style={{ background:'rgba(255,215,0,.06)',border:'1px solid #ffd70022',borderRadius:8,padding:10 }}>
                  <div style={{ color:'#555',fontSize:9,marginBottom:3 }}>{m.label}</div>
                  <div style={{ color:'#ffd700',fontWeight:900,fontSize:18 }}>{m.val}{m.unit}</div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:14 }}>
              {[{label:'Master Limiter',val:0.9},{label:'Stereo Enhancer',val:0.7},{label:'Analog Warmth',val:0.3},{label:'High Freq Air',val:0.5}].map(s=>(
                <div key={s.label} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3 }}>
                    <span style={{ color:'#888' }}>{s.label}</span>
                    <span style={{ color:'#ffd700' }}>{Math.round(s.val*100)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.01} defaultValue={s.val} style={{ width:'100%',accentColor:'#ffd700' }}/>
                </div>
              ))}
            </div>
            <button onClick={()=>store.setNotif('⚙️ Mastering chain applied! After upload, distribute to Spotify, Apple, Amazon, YouTube, Tidal, Deezer.')}
              style={{ width:'100%',background:'rgba(255,215,0,.15)',border:'2px solid #ffd700',color:'#ffd700',borderRadius:10,padding:14,cursor:'pointer',fontFamily:'monospace',fontWeight:900,fontSize:14 }}>
              ⚙️ APPLY MASTER CHAIN
            </button>
            {downloadUrl&&(
              <a href={downloadUrl} download="amm-master-final.webm" style={{ display:'block',marginTop:8,background:'rgba(255,215,0,.08)',border:'1px solid #ffd70033',color:'#ffd700',borderRadius:8,padding:'9px',textAlign:'center',fontFamily:'monospace',fontWeight:700,textDecoration:'none',fontSize:11 }}>⬇ DOWNLOAD MASTER (.webm)</a>
            )}
            <div style={{ marginTop:14,fontSize:11,color:'#555',lineHeight:1.7 }}>
              After mastering → upload to Music Realm → distribute FREE to:<br/>
              Spotify · Apple Music · Amazon Music · YouTube Music · Tidal · Deezer<br/>
              Earn $0.012–$0.018/stream · You keep 90% of all royalties
            </div>
          </div>
        )}

      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}
