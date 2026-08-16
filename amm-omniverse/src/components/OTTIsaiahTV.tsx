import { useMemo, useState } from 'react'

type Props = { onClose: () => void }
type Lane = 'All' | 'LIVE Replays' | 'Originals' | 'Showcase' | 'StarVerse' | 'Debate' | 'Games' | 'Podcasts' | 'Music'

type Program = {
  id: string
  title: string
  lane: Exclude<Lane, 'All'>
  rating: string
  access: 'FREE' | 'MEMBER' | 'PPV'
  description: string
}

const PROGRAMS: Program[] = [
  { id:'showcase', title:'All American Showcase', lane:'Showcase', rating:'TV-PG', access:'FREE', description:'Creator, music, business and talent showcase events.' },
  { id:'starverse', title:'StarVerse', lane:'StarVerse', rating:'TV-PG', access:'MEMBER', description:'Anyone Can Be a Star auditions, performances and competition.' },
  { id:'debate', title:'Debate Arena', lane:'Debate', rating:'TV-PG', access:'FREE', description:'Moderated debates, town halls and transparent scoring.' },
  { id:'hologame', title:'Holo Game Night', lane:'Games', rating:'TV-PG', access:'FREE', description:'GameVerse competition, tournaments and interactive audience play.' },
  { id:'creator', title:'Creator Showdown', lane:'Originals', rating:'TV-PG', access:'MEMBER', description:'Original creator competition built for Isaiah AI TV.' },
  { id:'music', title:'El Saturn Sessions', lane:'Music', rating:'TV-PG', access:'FREE', description:'Original performances, studio sessions and label showcases.' },
  { id:'podcast', title:'TryAMM Podcast Network', lane:'Podcasts', rating:'TV-PG', access:'FREE', description:'Video podcasts, audio editions, transcripts and translated versions.' },
  { id:'replay', title:'Tonight on TryAMM LIVE', lane:'LIVE Replays', rating:'TV-PG', access:'FREE', description:'Replay lane for completed LIVE, Showcase, Debate and StarVerse rooms.' },
]

const LANES: Lane[] = ['All','LIVE Replays','Originals','Showcase','StarVerse','Debate','Games','Podcasts','Music']

export default function OTTIsaiahTV({ onClose }: Props) {
  const [lane, setLane] = useState<Lane>('All')
  const [selected, setSelected] = useState<Program | null>(null)
  const [captions, setCaptions] = useState(true)
  const [audioDescription, setAudioDescription] = useState(false)
  const [translation, setTranslation] = useState('Original')
  const programs = useMemo(() => lane === 'All' ? PROGRAMS : PROGRAMS.filter(p => p.lane === lane), [lane])

  function dispatch(action: string, detail: Record<string, unknown> = {}) {
    window.dispatchEvent(new CustomEvent('tryamm:ott-action', { detail: { action, ...detail } }))
  }

  return <div role="dialog" aria-modal="true" aria-label="Isaiah AI TV and OTT" style={{position:'fixed',inset:0,zIndex:12100,background:'linear-gradient(180deg,#03040b,#080d1b 48%,#02030a)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'16px 20px',background:'#050713ee',backdropFilter:'blur(14px)',borderBottom:'1px solid #25314d'}}>
      <div><div style={{fontSize:11,letterSpacing:2,color:'#8cecff'}}>TRYAMM OTT MEDIA CORE</div><h1 style={{margin:'3px 0'}}>Isaiah AI TV</h1><div style={{opacity:.68,fontSize:13}}>LIVE → replay → episode → podcast → clips → OTT distribution</div></div>
      <button onClick={onClose} aria-label="Close Isaiah AI TV" style={{width:48,height:48,borderRadius:14,border:'1px solid #53617b',background:'#11182a',color:'#fff',fontSize:28}}>×</button>
    </header>

    <main style={{maxWidth:1100,margin:'0 auto',padding:20,display:'grid',gap:18}}>
      <section style={{padding:18,border:'1px solid #26496a',borderRadius:20,background:'radial-gradient(circle at 80% 20%,#153b58,#08111f 55%)'}}>
        <div style={{fontSize:12,color:'#ff8fa4',fontWeight:900}}>● LIVE + PREMIERES</div>
        <h2 style={{fontSize:'clamp(26px,5vw,52px)',margin:'8px 0'}}>One broadcast. Many products.</h2>
        <p style={{maxWidth:760,opacity:.75,lineHeight:1.6}}>A TryAMM LIVE room can become a replay, Isaiah AI TV episode, podcast edition, captioned/translated version and short-form clip package. Recording/egress and storage providers must be configured before automatic publishing is marked live.</p>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button onClick={()=>{dispatch('open-live');(window as any).__showTryAMMLive?.()}} style={primary}>● OPEN LIVE STUDIO</button>
          <button onClick={()=>dispatch('request-publish-workflow')} style={secondary}>CREATE OTT RELEASE</button>
        </div>
      </section>

      <nav aria-label="TV categories" style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>{LANES.map(item => <button key={item} onClick={()=>setLane(item)} style={{...chip,borderColor:lane===item?'#4fe3ff':'#34405b',color:lane===item?'#8ff5ff':'#d8dcea'}}>{item}</button>)}</nav>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        {programs.map(p => <button key={p.id} onClick={()=>setSelected(p)} style={{textAlign:'left',padding:0,border:'1px solid #293650',borderRadius:18,overflow:'hidden',background:'#0a1020',color:'#fff',cursor:'pointer'}}>
          <div style={{aspectRatio:'16/9',display:'grid',placeItems:'center',background:'radial-gradient(circle,#173f59,#10162b 60%,#080b14)',fontSize:42}}>◉</div>
          <div style={{padding:14}}><div style={{fontSize:11,color:'#7eeaff'}}>{p.lane} · {p.access}</div><strong style={{display:'block',fontSize:17,margin:'4px 0'}}>{p.title}</strong><div style={{fontSize:12,opacity:.62}}>{p.rating}</div></div>
        </button>)}
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,padding:16,border:'1px solid #27344f',borderRadius:18,background:'#080d18'}}>
        <label style={control}><input type="checkbox" checked={captions} onChange={e=>setCaptions(e.target.checked)}/> Captions / transcripts</label>
        <label style={control}><input type="checkbox" checked={audioDescription} onChange={e=>setAudioDescription(e.target.checked)}/> Audio description</label>
        <label style={{...control,display:'grid'}}><span>Audio / subtitle language</span><select value={translation} onChange={e=>setTranslation(e.target.value)} style={{marginTop:6,padding:9,borderRadius:10,background:'#111a2b',color:'#fff',border:'1px solid #40506d'}}><option>Original</option><option>English</option><option>Spanish</option><option>French</option><option>Arabic</option><option>Hebrew</option><option>Amharic</option><option>Swahili</option><option>Auto / HoloLingo</option></select></label>
      </section>
    </main>

    {selected && <div style={{position:'fixed',inset:0,zIndex:3,display:'grid',placeItems:'end center',background:'#0009'}} onClick={()=>setSelected(null)}><section onClick={e=>e.stopPropagation()} style={{width:'min(760px,100%)',padding:22,borderRadius:'22px 22px 0 0',background:'#0b1222',border:'1px solid #344866'}}><div style={{fontSize:12,color:'#7eeaff'}}>{selected.lane} · {selected.access} · {selected.rating}</div><h2>{selected.title}</h2><p style={{opacity:.72,lineHeight:1.6}}>{selected.description}</p><div style={{display:'flex',gap:10,flexWrap:'wrap'}}><button onClick={()=>dispatch('play',{programId:selected.id,captions,audioDescription,translation})} style={primary}>▶ PLAY / PREVIEW</button><button onClick={()=>dispatch('add-watchlist',{programId:selected.id})} style={secondary}>＋ WATCHLIST</button><button onClick={()=>setSelected(null)} style={secondary}>CLOSE</button></div></section></div>}
  </div>
}

const primary: React.CSSProperties = {minHeight:46,padding:'0 16px',borderRadius:12,border:'1px solid #4fe3ff',background:'#0c3a49',color:'#fff',fontWeight:900,cursor:'pointer'}
const secondary: React.CSSProperties = {minHeight:46,padding:'0 16px',borderRadius:12,border:'1px solid #46536d',background:'#111827',color:'#fff',fontWeight:800,cursor:'pointer'}
const chip: React.CSSProperties = {whiteSpace:'nowrap',padding:'9px 13px',borderRadius:999,border:'1px solid',background:'#0b1020',fontWeight:800,cursor:'pointer'}
const control: React.CSSProperties = {display:'flex',gap:10,alignItems:'center',padding:12,border:'1px solid #2d3a55',borderRadius:12,background:'#0b1120'}
