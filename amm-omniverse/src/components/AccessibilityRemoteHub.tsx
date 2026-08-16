import { useEffect, useMemo, useState } from 'react'
import { useGameStore, type Screen } from '../game/state/useGameStore'
import { getAccessToken } from '../services/supabaseClient'
import { askStubbsAI } from '../services/omniverseApi'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || ''

type Prefs = {
  preferredLanguage: string
  captions: boolean
  textScale: 'normal'|'large'|'extra-large'
  highContrast: boolean
  reducedMotion: boolean
  oneHandMode: boolean
  screenReaderOptimized: boolean
  speechToText: boolean
  textToSpeech: boolean
  plainLanguage: boolean
  voiceNavigation: boolean
  switchNavigation: boolean
  largeTargets: boolean
  audioDescriptions: boolean
  vibrationFeedback: boolean
  remoteMode: 'standard'|'one-hand-left'|'one-hand-right'|'switch'|'voice'|'large-target'
}

const defaults: Prefs = {
  preferredLanguage:'en', captions:true, textScale:'normal', highContrast:false, reducedMotion:false,
  oneHandMode:false, screenReaderOptimized:false, speechToText:false, textToSpeech:false,
  plainLanguage:false, voiceNavigation:false, switchNavigation:false, largeTargets:true,
  audioDescriptions:false, vibrationFeedback:true, remoteMode:'standard'
}

const destinations: Array<{screen: Screen; label: string; icon: string}> = [
  {screen:'city',label:'Home / City',icon:'🏙️'}, {screen:'sports',label:'Sports',icon:'🏆'},
  {screen:'marketplace',label:'Marketplace',icon:'🛒'}, {screen:'music',label:'Music',icon:'🎵'},
  {screen:'faith',label:'Faith',icon:'✡️'}, {screen:'blockchain',label:'Wallet / Chain',icon:'◈'}
]

const commonLanguages = [
  ['en','English'],['es','Spanish'],['fr','French'],['de','German'],['it','Italian'],['pt','Portuguese'],
  ['ar','Arabic'],['he','Hebrew'],['am','Amharic'],['sw','Swahili'],['ha','Hausa'],['yo','Yoruba'],['ig','Igbo'],
  ['zh','Chinese'],['ja','Japanese'],['ko','Korean'],['hi','Hindi'],['bn','Bengali'],['ur','Urdu'],['pa','Punjabi'],
  ['ru','Russian'],['uk','Ukrainian'],['pl','Polish'],['tr','Turkish'],['vi','Vietnamese'],['th','Thai'],['id','Indonesian'],
  ['tl','Filipino/Tagalog'],['nl','Dutch'],['el','Greek'],['ro','Romanian'],['cs','Czech'],['so','Somali']
]

async function authFetch(path:string, init:RequestInit={}) {
  if(!API_URL) throw new Error('Backend URL is not configured')
  const token = await getAccessToken()
  const headers = new Headers(init.headers || {})
  headers.set('Content-Type','application/json')
  if(token) headers.set('Authorization',`Bearer ${token}`)
  const response = await fetch(`${API_URL}${path}`,{...init,headers})
  const body = await response.json().catch(()=>({}))
  if(!response.ok) throw new Error(body?.error || `Request failed (${response.status})`)
  return body
}

export default function AccessibilityRemoteHub({onClose}:{onClose:()=>void}) {
  const store = useGameStore()
  const [tab,setTab] = useState<'remote'|'access'|'language'>('remote')
  const [prefs,setPrefs] = useState<Prefs>(defaults)
  const [status,setStatus] = useState('')
  const [source,setSource] = useState('')
  const [target,setTarget] = useState('es')
  const [translation,setTranslation] = useState('')
  const [listening,setListening] = useState(false)

  useEffect(()=>{
    authFetch('/api/omniverse/profile').then((body:any)=>{
      if(body?.profile?.accessibility) setPrefs({...defaults,...body.profile.accessibility})
    }).catch(()=>{})
  },[])

  useEffect(()=>{
    document.documentElement.dataset.ammContrast = prefs.highContrast ? 'high' : 'normal'
    document.documentElement.dataset.ammTextScale = prefs.textScale
    document.documentElement.dataset.ammReducedMotion = prefs.reducedMotion ? 'true' : 'false'
  },[prefs])

  const buttonSize = prefs.largeTargets || prefs.remoteMode==='large-target' ? 66 : 54
  const align = prefs.remoteMode==='one-hand-left' ? 'flex-start' : prefs.remoteMode==='one-hand-right' ? 'flex-end' : 'center'

  async function savePrefs(next=prefs){
    setStatus('Saving…')
    try{
      const current:any = await authFetch('/api/omniverse/profile').catch(()=>({profile:null}))
      await authFetch('/api/omniverse/profile',{method:'POST',body:JSON.stringify({
        avatar_name: current?.profile?.avatar_name || store.player.name || 'Creator',
        accessibility: next
      })})
      setStatus('Saved to Omni ID')
    }catch(e:any){ setStatus(e.message || 'Could not save') }
  }

  function command(screen:Screen){
    store.setScreen(screen)
    if(prefs.vibrationFeedback && navigator.vibrate) navigator.vibrate(20)
  }

  function speak(text:string){
    if(!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text))
  }

  function startVoice(){
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if(!Recognition){ setStatus('Voice navigation is not available in this browser.'); return }
    const r = new Recognition(); r.lang = prefs.preferredLanguage || 'en-US'; r.interimResults=false
    setListening(true)
    r.onresult=(e:any)=>{
      const phrase=String(e.results?.[0]?.[0]?.transcript||'').toLowerCase()
      const match=destinations.find(d=>phrase.includes(d.label.split(' ')[0].toLowerCase()))
      if(match){ command(match.screen); speak(`Opening ${match.label}`) }
      else if(phrase.includes('close')) onClose()
      else setStatus(`Voice command not matched: ${phrase}`)
    }
    r.onerror=()=>setListening(false); r.onend=()=>setListening(false); r.start()
  }

  async function translate(){
    if(!source.trim()) return
    setTranslation('Translating…')
    try{
      const languageName = commonLanguages.find(([code])=>code===target)?.[1] || target
      const result = await askStubbsAI(`Translate the text below faithfully into ${languageName} (${target}). Preserve names, numbers, URLs and meaning. Return only the translation.\n\n${source}`,{screen:'accessibility-language'})
      setTranslation(result.answer)
      if(prefs.textToSpeech) speak(result.answer)
    }catch(e:any){ setTranslation(e.message || 'Translation unavailable') }
  }

  const toggles = useMemo(()=>[
    ['captions','Captions + transcripts'],['highContrast','High contrast'],['reducedMotion','Reduced motion'],
    ['screenReaderOptimized','Screen-reader optimized'],['speechToText','Speech → text'],['textToSpeech','Text → speech'],
    ['plainLanguage','Plain-language mode'],['voiceNavigation','Voice navigation'],['switchNavigation','Switch navigation'],
    ['largeTargets','Large touch targets'],['audioDescriptions','Audio descriptions'],['oneHandMode','One-hand mode'],
    ['vibrationFeedback','Vibration feedback']
  ] as const,[])

  return <div role="dialog" aria-modal="true" aria-label="Omni Access and Remote" style={{position:'fixed',inset:0,zIndex:12000,background:'#050816',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',background:'#090d20',borderBottom:'1px solid #24304d'}}>
      <div><strong style={{fontSize:20}}>♿ OMNI ACCESS + REMOTE</strong><div style={{fontSize:12,opacity:.7}}>Universal control · disability access · language</div></div>
      <button onClick={onClose} aria-label="Close" style={{fontSize:26,width:48,height:48,borderRadius:14,border:'1px solid #667',background:'#151b30',color:'#fff'}}>×</button>
    </header>

    <nav aria-label="Accessibility center sections" style={{display:'flex',gap:8,padding:12,flexWrap:'wrap'}}>
      {([['remote','🎮 Omni Remote'],['access','♿ Accessibility'],['language','🌍 Language']] as const).map(([id,label])=><button key={id} onClick={()=>setTab(id)} style={{padding:'12px 16px',minHeight:48,borderRadius:12,border:tab===id?'2px solid #4fe3ff':'1px solid #39405a',background:tab===id?'#102b3b':'#101528',color:'#fff',fontWeight:800}}>{label}</button>)}
    </nav>

    <main style={{maxWidth:900,margin:'0 auto',padding:16}}>
      {tab==='remote' && <section>
        <h2>Omni Remote</h2>
        <p style={{opacity:.75}}>One control surface for TryAMM now, with the same command contract intended for Omni Box, Volcano, TV receivers, GameVerse and Living Worlds.</p>
        <div style={{display:'flex',justifyContent:align}}><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(130px,1fr))',gap:12,width:'min(100%,520px)'}}>
          {destinations.map(d=><button key={d.screen} onClick={()=>command(d.screen)} aria-label={`Open ${d.label}`} style={{minHeight:buttonSize,borderRadius:18,border:'1px solid #4fe3ff66',background:'#101a32',color:'#fff',fontSize:16,fontWeight:800}}>{d.icon} {d.label}</button>)}
          <button onClick={startVoice} style={{minHeight:buttonSize,borderRadius:18,border:'1px solid #e8b94488',background:'#2c2411',color:'#fff',fontWeight:800}}>🎙 {listening?'Listening…':'Voice Remote'}</button>
          <button onClick={()=>{ window.dispatchEvent(new CustomEvent('tryamm:remote-command',{detail:{action:'play-pause'}})); if(prefs.vibrationFeedback&&navigator.vibrate)navigator.vibrate(20)}} style={{minHeight:buttonSize,borderRadius:18,border:'1px solid #8cf',background:'#16243b',color:'#fff',fontWeight:800}}>⏯ Play / Pause</button>
        </div></div>
        <label style={{display:'block',marginTop:20}}>Remote layout
          <select value={prefs.remoteMode} onChange={e=>setPrefs({...prefs,remoteMode:e.target.value as Prefs['remoteMode']})} style={{display:'block',width:'100%',maxWidth:420,marginTop:6,padding:12,borderRadius:10}}>
            <option value="standard">Standard</option><option value="one-hand-left">One hand — left</option><option value="one-hand-right">One hand — right</option><option value="large-target">Extra-large controls</option><option value="switch">Switch control</option><option value="voice">Voice-first</option>
          </select>
        </label>
      </section>}

      {tab==='access' && <section>
        <h2>Accessibility profile</h2>
        <p style={{opacity:.75}}>The same profile follows the user through LIVE, games, OTT, Marketplace and Living Worlds.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10}}>
          {toggles.map(([key,label])=><label key={key} style={{display:'flex',alignItems:'center',gap:12,minHeight:54,padding:'10px 14px',border:'1px solid #303a58',borderRadius:14,background:'#0c1225'}}><input type="checkbox" checked={Boolean(prefs[key])} onChange={e=>setPrefs({...prefs,[key]:e.target.checked})} style={{width:24,height:24}}/><span>{label}</span></label>)}
        </div>
        <label style={{display:'block',marginTop:16}}>Text size<select value={prefs.textScale} onChange={e=>setPrefs({...prefs,textScale:e.target.value as Prefs['textScale']})} style={{display:'block',marginTop:6,padding:12,borderRadius:10,minWidth:220}}><option value="normal">Normal</option><option value="large">Large</option><option value="extra-large">Extra large</option></select></label>
        <button onClick={()=>void savePrefs()} style={{marginTop:18,minHeight:52,padding:'0 22px',borderRadius:14,border:'1px solid #4fe3ff',background:'#0b3940',color:'#fff',fontWeight:900}}>SAVE TO OMNI ID</button>
      </section>}

      {tab==='language' && <section>
        <h2>HoloLingo universal language</h2>
        <p style={{opacity:.75}}>Auto-detect the source and translate into a selected language. Any valid language name or BCP-47 code can be entered, so the system is not limited to this quick list.</p>
        <textarea value={source} onChange={e=>setSource(e.target.value)} rows={7} placeholder="Type or paste text…" style={{width:'100%',boxSizing:'border-box',padding:14,borderRadius:14,background:'#091022',color:'#fff',border:'1px solid #394566',fontSize:16}}/>
        <div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:10}}>
          <select value={target} onChange={e=>setTarget(e.target.value)} style={{flex:'1 1 220px',padding:12,borderRadius:10}}>{commonLanguages.map(([code,name])=><option key={code} value={code}>{name} — {code}</option>)}</select>
          <input aria-label="Custom language code" placeholder="or language/code e.g. zu, fa, km" onChange={e=>{if(e.target.value.trim())setTarget(e.target.value.trim())}} style={{flex:'1 1 220px',padding:12,borderRadius:10,border:'1px solid #666'}}/>
          <button onClick={()=>void translate()} style={{minHeight:48,padding:'0 20px',borderRadius:12,border:'1px solid #e8b944',background:'#352b0e',color:'#fff',fontWeight:900}}>TRANSLATE</button>
        </div>
        <div aria-live="polite" style={{marginTop:16,minHeight:100,padding:16,borderRadius:14,background:'#0b1428',border:'1px solid #2f4264',whiteSpace:'pre-wrap'}}>{translation || 'Translation will appear here.'}</div>
        <p style={{fontSize:12,opacity:.65}}>For legal, medical, financial or emergency decisions, machine translation should be reviewed by a qualified human. Original text should always remain available.</p>
      </section>}

      {status && <div aria-live="polite" style={{marginTop:18,padding:12,borderRadius:12,background:'#14213c'}}>{status}</div>}
    </main>
  </div>
}
