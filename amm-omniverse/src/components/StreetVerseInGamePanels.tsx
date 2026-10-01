import {useEffect,useMemo,useState} from 'react'

type Panel='social'|'people'|'tickets'|null
type SearchScope='people'|'live'|'families'|'agencies'|'games'
type SearchResult={id:string;label:string;subtitle?:string;scope?:SearchScope}
type TicketSummary={id:string;kind:string;status:string;label?:string}
type TicketCapabilities={admin?:boolean;youthAdmin?:boolean}

const shell:React.CSSProperties={
  position:'fixed',
  left:8,
  right:8,
  bottom:'max(184px, calc(env(safe-area-inset-bottom) + 184px))',
  zIndex:46850,
  margin:'0 auto',
  width:'min(370px,calc(100vw - 16px))',
  maxHeight:'min(46dvh,390px)',
  overflow:'hidden',
  border:'1px solid #5be7ff88',
  borderRadius:18,
  background:'rgba(3,11,18,.96)',
  boxShadow:'0 16px 44px #000c',
  color:'#fff',
  fontFamily:'system-ui,sans-serif',
  pointerEvents:'auto'
}
const button:React.CSSProperties={minHeight:42,borderRadius:11,border:'1px solid #31556a',background:'#0a1923',color:'#fff',fontWeight:900,fontSize:10,padding:'8px 10px',touchAction:'manipulation'}
const tabButton=(active:boolean):React.CSSProperties=>({...button,minHeight:38,color:active?'#061016':'#d8f8ff',background:active?'#7fe9ff':'#0a1923'})

export default function StreetVerseInGamePanels(){
  const [panel,setPanel]=useState<Panel>(null)
  const [socialTab,setSocialTab]=useState('SOCIAL')
  const [scope,setScope]=useState<SearchScope>('people')
  const [query,setQuery]=useState('')
  const [results,setResults]=useState<SearchResult[]>([])
  const [tickets,setTickets]=useState<TicketSummary[]>([])
  const [caps,setCaps]=useState<TicketCapabilities>({})
  const [message,setMessage]=useState('')

  useEffect(()=>{
    const openSocial=(e:Event)=>{const d=(e as CustomEvent<{tab?:string}>).detail||{};setPanel('social');setSocialTab(String(d.tab||'social').toUpperCase());setMessage('')}
    const openPeople=(e:Event)=>{const d=(e as CustomEvent<{scope?:SearchScope[]}>).detail||{};setPanel('people');setScope(d.scope?.[0]||'people');setMessage('')}
    const openTickets=()=>{setPanel('tickets');setMessage('')}
    const searchResults=(e:Event)=>{const d=(e as CustomEvent<{results?:SearchResult[]}>).detail||{};setResults(Array.isArray(d.results)?d.results:[])}
    const ticketResults=(e:Event)=>{const d=(e as CustomEvent<{tickets?:TicketSummary[]}>).detail||{};setTickets(Array.isArray(d.tickets)?d.tickets:[])}
    const capabilities=(e:Event)=>setCaps((e as CustomEvent<TicketCapabilities>).detail||{})
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape')setPanel(null)}
    addEventListener('tryamm:mini-panel-open',openSocial)
    addEventListener('tryamm:user-search-open',openPeople)
    addEventListener('tryamm:stream-ticket-center-open',openTickets)
    addEventListener('tryamm:user-search-results',searchResults)
    addEventListener('tryamm:stream-ticket-results',ticketResults)
    addEventListener('tryamm:stream-ticket-capabilities',capabilities)
    addEventListener('keydown',key)
    return()=>{
      removeEventListener('tryamm:mini-panel-open',openSocial)
      removeEventListener('tryamm:user-search-open',openPeople)
      removeEventListener('tryamm:stream-ticket-center-open',openTickets)
      removeEventListener('tryamm:user-search-results',searchResults)
      removeEventListener('tryamm:stream-ticket-results',ticketResults)
      removeEventListener('tryamm:stream-ticket-capabilities',capabilities)
      removeEventListener('keydown',key)
    }
  },[])

  useEffect(()=>{
    if(panel==='people')dispatchEvent(new CustomEvent('tryamm:user-search-query',{detail:{query,scope,source:'streetverse-visible-panel'}}))
    if(panel==='tickets')dispatchEvent(new CustomEvent('tryamm:stream-ticket-list-request',{detail:{source:'streetverse-visible-panel'}}))
  },[panel,query,scope])

  const scopes:SearchScope[]=useMemo(()=>['people','live','families','agencies','games'],[])

  if(!panel)return null

  const close=<button aria-label="Close StreetVerse panel" onClick={()=>setPanel(null)} style={{...button,width:44,minWidth:44,fontSize:18}}>×</button>

  if(panel==='social'){
    const socialTabs=['LIVE','PARTY','MISSIONS','SOCIAL']
    const act=(action:'like'|'follow'|'share')=>{
      dispatchEvent(new CustomEvent('tryamm:social-quick-action',{detail:{action,source:'streetverse-visible-panel'}}))
      setMessage(action.toUpperCase()+' requested • verified server response required before counts change.')
    }
    return <section aria-label="StreetVerse social panel" style={shell}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:9,borderBottom:'1px solid #294252'}}><div><b style={{fontSize:12}}>STREETVERSE SOCIAL</b><div style={{fontSize:9,color:'#8effb7'}}>Compact overlay • gameplay stays visible</div></div>{close}</header>
      <div style={{padding:9,overflowY:'auto',maxHeight:'calc(min(46dvh,390px) - 62px)'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>{socialTabs.map(t=><button key={t} onClick={()=>setSocialTab(t)} style={tabButton(socialTab===t)}>{t}</button>)}</div>
        <div style={{marginTop:9,padding:10,border:'1px solid #203848',borderRadius:12,background:'#07131c'}}>
          <b style={{fontSize:11}}>{socialTab}</b>
          <div style={{fontSize:10,color:'#a8bdca',marginTop:4}}>Use verified activity only. No bot likes, purchased engagement, or fabricated viewer counts.</div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginTop:8}}>
          <button onClick={()=>act('like')} style={button}>❤️ LIKE</button>
          <button onClick={()=>act('follow')} style={button}>＋ FOLLOW</button>
          <button onClick={()=>act('share')} style={button}>↗ SHARE</button>
        </div>
        {message&&<div aria-live="polite" style={{fontSize:9,color:'#9fe8ff',marginTop:8}}>{message}</div>}
      </div>
    </section>
  }

  if(panel==='people'){
    return <section aria-label="StreetVerse people search panel" style={shell}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:9,borderBottom:'1px solid #294252'}}><div><b style={{fontSize:12}}>FIND PEOPLE & WORLDS</b><div style={{fontSize:9,color:'#9fc8ff'}}>People • LIVE • Families • Agencies • Games</div></div>{close}</header>
      <div style={{padding:9,overflowY:'auto',maxHeight:'calc(min(46dvh,390px) - 62px)'}}>
        <input aria-label="Search StreetVerse users and groups" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search name, handle, family, agency or game" style={{boxSizing:'border-box',width:'100%',minHeight:44,borderRadius:12,border:'1px solid #3c6b84',background:'#07131d',color:'#fff',padding:'0 11px',fontSize:12}}/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,minmax(0,1fr))',gap:4,marginTop:7}}>{scopes.map(s=><button key={s} onClick={()=>setScope(s)} style={{...tabButton(scope===s),fontSize:8,padding:'6px 3px'}}>{s.toUpperCase()}</button>)}</div>
        <div style={{marginTop:8,display:'grid',gap:6}}>
          {results.length===0?<div style={{padding:12,borderRadius:12,border:'1px solid #203848',fontSize:10,color:'#9cafbb'}}>No server search results loaded yet. This panel is connected to the StreetVerse search event bus and will show only returned records.</div>:results.map(r=><button key={r.id} onClick={()=>dispatchEvent(new CustomEvent('tryamm:user-search-result-open',{detail:{...r,source:'streetverse-visible-panel'}}))} style={{...button,textAlign:'left'}}><b>{r.label}</b>{r.subtitle&&<span style={{display:'block',fontSize:9,color:'#9cafbb',marginTop:2}}>{r.subtitle}</span>}</button>)}
        </div>
      </div>
    </section>
  }

  const requestTicket=(kind:string)=>{
    dispatchEvent(new CustomEvent('tryamm:stream-ticket-request',{detail:{kind,source:'streetverse-visible-panel'}}))
    setMessage(kind.toUpperCase()+' request prepared • authoritative server approval is required.')
  }
  return <section aria-label="StreetVerse stream ticket center" style={shell}>
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:9,borderBottom:'1px solid #294252'}}><div><b style={{fontSize:12}}>STREAM TICKETS</b><div style={{fontSize:9,color:'#b7ffa2'}}>Server-issued • expiring • revocable</div></div>{close}</header>
    <div style={{padding:9,overflowY:'auto',maxHeight:'calc(min(46dvh,390px) - 62px)'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:5}}>
        <button style={tabButton(true)}>MY TICKETS</button>
        {caps.admin&&<button onClick={()=>dispatchEvent(new CustomEvent('tryamm:stream-ticket-admin-open'))} style={tabButton(false)}>ADMIN</button>}
        {caps.youthAdmin&&<button onClick={()=>dispatchEvent(new CustomEvent('tryamm:youth-stream-ticket-admin-open'))} style={tabButton(false)}>YOUTH</button>}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6,marginTop:8}}>
        {['go-live','guest-seat','pk-challenge','event-stage','support'].map(k=><button key={k} onClick={()=>requestTicket(k)} style={button}>{k.replace('-',' ').toUpperCase()}</button>)}
      </div>
      {message&&<div aria-live="polite" style={{fontSize:9,color:'#b7ffa2',marginTop:8}}>{message}</div>}
      <div style={{marginTop:8,display:'grid',gap:6}}>
        {tickets.length===0?<div style={{padding:12,borderRadius:12,border:'1px solid #203848',fontSize:10,color:'#9cafbb'}}>No authoritative ticket records loaded. The panel will not invent approvals or access.</div>:tickets.map(t=><div key={t.id} style={{padding:9,borderRadius:11,border:'1px solid #294252',background:'#07131c',fontSize:10}}><b>{t.label||t.kind}</b><span style={{float:'right',color:'#b7ffa2'}}>{t.status}</span></div>)}
      </div>
    </div>
  </section>
}
