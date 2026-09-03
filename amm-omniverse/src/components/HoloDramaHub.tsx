import { useEffect,useMemo,useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const url=import.meta.env.VITE_SUPABASE_URL as string|undefined
const key=(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||import.meta.env.VITE_SUPABASE_ANON_KEY) as string|undefined
const supabase=url&&key?createClient(url,key):null

type Episode={id:string;title:string;caption:string;media_path:string|null;status:string;monetization_mode:string;unlock_price_cents:number;created_at:string}
type Earnings={source:string;gross_cents:number;platform_fee_cents:number;net_cents:number;settlement_status:string}

const tabs=['For You','Following','Series','Create','Earnings','Library'] as const

export default function HoloDramaHub(){
  const [tab,setTab]=useState<(typeof tabs)[number]>('For You')
  const [episodes,setEpisodes]=useState<Episode[]>([])
  const [earnings,setEarnings]=useState<Earnings[]>([])
  const [status,setStatus]=useState('Checking account…')
  const [userId,setUserId]=useState<string|null>(null)
  const [title,setTitle]=useState('')
  const [caption,setCaption]=useState('')
  const [mode,setMode]=useState('free')
  const [audienceLane,setAudienceLane]=useState('all_ages')
  const [guardianRequired,setGuardianRequired]=useState(false)
  const [file,setFile]=useState<File|null>(null)

  async function refresh(){
    if(!supabase){setStatus('Cloud is not configured on this build.');return}
    const {data:{user}}=await supabase.auth.getUser()
    setUserId(user?.id||null)
    if(!user){setStatus('Sign in to publish, save, or view creator earnings.');return}
    setStatus('Creator cloud connected.')
    const feed=await supabase.from('holo_drama_episodes').select('id,title,caption,media_path,status,monetization_mode,unlock_price_cents,created_at').order('created_at',{ascending:false}).limit(30)
    if(!feed.error)setEpisodes((feed.data||[]) as Episode[])
    const money=await supabase.from('holo_drama_creator_earnings').select('source,gross_cents,platform_fee_cents,net_cents,settlement_status').order('created_at',{ascending:false}).limit(100)
    if(!money.error)setEarnings((money.data||[]) as Earnings[])
  }
  useEffect(()=>{void refresh()},[])

  const totals=useMemo(()=>earnings.reduce((a,e)=>{a.gross+=Number(e.gross_cents||0);a.net+=Number(e.net_cents||0);if(e.settlement_status==='payable')a.payable+=Number(e.net_cents||0);return a},{gross:0,net:0,payable:0}),[earnings])
  const money=(cents:number)=>new Intl.NumberFormat(undefined,{style:'currency',currency:'USD'}).format(cents/100)

  async function publishDraft(){
    if(!supabase||!userId){setStatus('Sign in before creating an episode.');return}
    if(!title.trim()){setStatus('Add an episode title first.');return}
    setStatus('Saving episode…')
    let mediaPath:string|null=null
    if(file){
      const safe=file.name.replace(/[^a-zA-Z0-9._-]+/g,'-')
      mediaPath=`${userId}/holo-drama/${Date.now()}-${safe}`
      const up=await supabase.storage.from('creator-media').upload(mediaPath,file,{upsert:false})
      if(up.error){setStatus(`Upload failed: ${up.error.message}`);return}
    }
    const blockedByGuardian=guardianRequired
    const ins=await supabase.from('holo_drama_episodes').insert({owner_id:userId,title:title.trim(),caption:caption.trim(),media_path:mediaPath,visibility:'public',monetization_mode:mode,guardian_approval_required:guardianRequired,status:blockedByGuardian?'draft':'published',published_at:blockedByGuardian?null:new Date().toISOString()}).select('id').single()
    if(ins.error){setStatus(`Save failed: ${ins.error.message}`);return}
    setTitle('');setCaption('');setFile(null)
    setStatus(blockedByGuardian?'Saved as draft pending guardian approval.':'Episode published to Holo Drama.')
    await refresh();setTab('For You')
  }

  async function share(){
    const data={title:'Holo Drama on TRYAMM',text:'Watch and create vertical stories on Holo Drama.',url:window.location.href}
    try{if(navigator.share)await navigator.share(data);else{await navigator.clipboard.writeText(window.location.href);setStatus('Holo Drama link copied.')}}catch{}
  }

  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at top,#2b0a3b,#090711 45%,#050505)',color:'#fff',fontFamily:'system-ui,sans-serif',padding:'20px 16px 110px'}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
        <div><div style={{fontSize:12,fontWeight:950,letterSpacing:2,color:'#ff9df5'}}>TRYAMM ORIGINAL</div><h1 style={{fontSize:'clamp(34px,7vw,72px)',margin:'3px 0'}}>HOLO DRAMA</h1><p style={{margin:0,color:'#d6c8df'}}>Vertical stories • mini-series • creator earnings • OmniReel • StreetVerse</p></div>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={share} style={button}>SHARE</button><a href='/omni-cash' style={{...button,textDecoration:'none'}}>OMNI CASH</a><a href='/' style={{...button,textDecoration:'none'}}>HOME</a></div>
      </header>

      <div role='status' aria-live='polite' style={{margin:'16px 0',padding:'10px 13px',border:'1px solid #564066',borderRadius:12,background:'#120d18',color:'#e8dff0'}}>{status}</div>

      <nav aria-label='Holo Drama sections' style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:10}}>{tabs.map(t=><button key={t} onClick={()=>setTab(t)} style={{...pill,background:tab===t?'#ff4fd8':'#17101d',color:tab===t?'#190019':'#fff'}}>{t.toUpperCase()}</button>)}</nav>

      {(tab==='For You'||tab==='Following'||tab==='Series'||tab==='Library')&&<section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:14}}>
        {episodes.length===0&&<article style={card}><h2>Your Holo Drama feed is ready.</h2><p style={muted}>No published episodes are visible to this signed-in account yet. Create the first episode, or connect more creators to populate For You.</p><button onClick={()=>setTab('Create')} style={primary}>CREATE FIRST EPISODE</button></article>}
        {episodes.map(ep=><article key={ep.id} style={{...card,minHeight:360,display:'flex',flexDirection:'column',justifyContent:'flex-end',background:'linear-gradient(180deg,#23112f,#0b0910)'}}>
          <div style={{fontSize:11,fontWeight:950,color:'#ff9df5'}}>{ep.status.toUpperCase()} • {ep.monetization_mode.toUpperCase()}</div>
          <h2 style={{fontSize:28,margin:'8px 0'}}>{ep.title}</h2><p style={muted}>{ep.caption||'Vertical episode'}</p>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button style={button}>♡ LIKE</button><button style={button}>💬 COMMENT</button><button style={button}>↗ SHARE</button><button style={button}>🎁 GIFT</button></div>
        </article>)}
      </section>}

      {tab==='Create'&&<section style={{...card,maxWidth:760}}>
        <h2>Create a vertical episode</h2><p style={muted}>Upload to Omni Box storage, publish into the Holo Drama feed, and route earnings to the verified creator ledger. Youth/guardian-required content stays draft until approval.</p>
        <label style={label}>Episode title<input value={title} onChange={e=>setTitle(e.target.value)} style={input}/></label>
        <label style={label}>Caption / description<textarea value={caption} onChange={e=>setCaption(e.target.value)} style={{...input,minHeight:90}}/></label>
        <label style={label}>Video<input type='file' accept='video/*' onChange={e=>setFile(e.target.files?.[0]||null)} style={input}/></label>
        <label style={label}>Monetization<select value={mode} onChange={e=>setMode(e.target.value)} style={input}><option value='free'>Free</option><option value='ad_supported'>Ad supported</option><option value='unlock'>Paid unlock</option><option value='subscriber'>Subscribers</option></select></label>
        <label style={label}>Audience lane<select value={audienceLane} onChange={e=>setAudienceLane(e.target.value)} style={input}><option value='all_ages'>All ages</option><option value='teen'>Teen</option><option value='adult'>Adult</option></select></label>
        <label style={{display:'flex',gap:10,alignItems:'center',margin:'14px 0'}}><input type='checkbox' checked={guardianRequired} onChange={e=>setGuardianRequired(e.target.checked)}/> Guardian approval required before publication</label>
        <div style={{padding:12,border:'1px solid #66582b',borderRadius:12,background:'#1a160a',color:'#ffe4a1',marginBottom:14}}>Real monetization remains settlement-gated. A displayed balance is not withdrawable until payment verification, fraud/chargeback controls and applicable guardian rules pass.</div>
        <button onClick={publishDraft} style={primary}>{guardianRequired?'SAVE FOR GUARDIAN APPROVAL':'PUBLISH EPISODE'}</button>
      </section>}

      {tab==='Earnings'&&<section>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12,marginBottom:14}}>
          <Metric label='Gross recorded' value={money(totals.gross)}/><Metric label='Net recorded' value={money(totals.net)}/><Metric label='Payable now' value={money(totals.payable)}/><Metric label='Payout destination' value='Omni Cash'/>
        </div>
        <article style={card}><h2>Creator money lanes</h2><p style={muted}>Ads • gifts • episode unlocks • subscriptions • sponsorships • commerce • LIVE. Each record must move through pending → verified → payable before payout.</p>{earnings.length===0?<p style={muted}>No verified earning records yet.</p>:earnings.slice(0,20).map((e,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',gap:10,padding:'10px 0',borderTop:'1px solid #2c2431'}}><span>{e.source.toUpperCase()} • {e.settlement_status}</span><strong>{money(e.net_cents)}</strong></div>)}</article>
      </section>}
    </div>
  </main>
}

function Metric({label,value}:{label:string,value:string}){return <div style={card}><div style={{fontSize:12,color:'#c9b8d2'}}>{label.toUpperCase()}</div><strong style={{fontSize:26}}>{value}</strong></div>}
const card={padding:18,border:'1px solid #44334f',borderRadius:20,background:'#100c15e8'} as const
const muted={color:'#c9b8d2',lineHeight:1.5} as const
const button={border:'1px solid #5b4867',borderRadius:999,padding:'10px 12px',background:'#18101f',color:'#fff',fontWeight:900,cursor:'pointer'} as const
const primary={...button,background:'#ff4fd8',color:'#190019',border:'1px solid #ff8fe9'} as const
const pill={...button,whiteSpace:'nowrap'} as const
const label={display:'grid',gap:6,fontWeight:850,margin:'12px 0'} as const
const input={width:'100%',boxSizing:'border-box',border:'1px solid #594568',borderRadius:12,padding:'12px 13px',background:'#0a080d',color:'#fff',font:'inherit'} as const
