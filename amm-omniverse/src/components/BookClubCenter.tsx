import { useEffect, useState } from 'react'
import { getSupabaseClient } from '../services/supabaseClient'

type Club={id:string;name:string;description:string;visibility:string;category:string}
type Selection={id:string;club_id:string;publication_id:string|null;title:string;status:string;starts_at:string|null;ends_at:string|null}
type Discussion={id:string;club_id:string;publication_id:string|null;user_id:string;body:string;created_at:string}

type Props={onClose:()=>void}

export default function BookClubCenter({onClose}:Props){
  const [clubs,setClubs]=useState<Club[]>([])
  const [selected,setSelected]=useState<Club|null>(null)
  const [selections,setSelections]=useState<Selection[]>([])
  const [discussion,setDiscussion]=useState<Discussion[]>([])
  const [message,setMessage]=useState('')
  const [body,setBody]=useState('')
  const [busy,setBusy]=useState(false)

  async function loadClubs(){
    const sb=getSupabaseClient(); if(!sb){setMessage('Supabase is not configured in this build.');return}
    const {data,error}=await sb.from('book_clubs').select('*').order('updated_at',{ascending:false})
    if(error){setMessage(error.message);return}
    setClubs((data||[]) as Club[])
  }

  async function openClub(club:Club){
    const sb=getSupabaseClient(); if(!sb)return
    setSelected(club);setBusy(true);setMessage('')
    try{
      const [s,d]=await Promise.all([
        sb.from('book_club_selections').select('*').eq('club_id',club.id).order('created_at',{ascending:false}),
        sb.from('book_club_discussions').select('*').eq('club_id',club.id).eq('status','visible').order('created_at',{ascending:true}).limit(100),
      ])
      if(s.error)throw s.error;if(d.error)throw d.error
      setSelections((s.data||[]) as Selection[]);setDiscussion((d.data||[]) as Discussion[])
    }catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }

  async function join(){
    if(!selected)return;const sb=getSupabaseClient();if(!sb)return
    setBusy(true);try{
      const {data:{user},error:uerr}=await sb.auth.getUser();if(uerr||!user)throw uerr||new Error('Sign in required')
      const {error}=await sb.from('book_club_memberships').upsert({club_id:selected.id,user_id:user.id,role:'member'},{onConflict:'club_id,user_id'})
      if(error)throw error;setMessage('Joined book club.')
    }catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }

  async function post(){
    if(!selected||!body.trim())return;const sb=getSupabaseClient();if(!sb)return
    setBusy(true);try{
      const {data:{user},error:uerr}=await sb.auth.getUser();if(uerr||!user)throw uerr||new Error('Sign in required')
      const {data,error}=await sb.from('book_club_discussions').insert({club_id:selected.id,user_id:user.id,body:body.trim(),publication_id:selections[0]?.publication_id||null}).select('*').single()
      if(error)throw error;setDiscussion(x=>[...x,data as Discussion]);setBody('');setMessage('Discussion posted.')
    }catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false)}
  }

  useEffect(()=>{loadClubs()},[])

  return <div role="dialog" aria-modal="true" aria-label="Kingdoms Press Book Club" style={{position:'fixed',inset:0,zIndex:12240,background:'#050510',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:2,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 18px',background:'#09091bed',borderBottom:'1px solid #ff9ee855'}}>
      <div><div style={{fontSize:10,letterSpacing:2,color:'#ff9ee8'}}>KINGDOMS PRESS</div><h1 style={{margin:'3px 0'}}>Book Club</h1><div style={{fontSize:12,opacity:.65}}>Read → discuss → review → attend → publish → adapt</div></div>
      <button onClick={onClose} style={btn}>CLOSE</button>
    </header>
    <main style={{maxWidth:1100,margin:'0 auto',padding:18,display:'grid',gridTemplateColumns:'minmax(230px,1fr) minmax(320px,2fr)',gap:14}}>
      <section style={panel}><h2 style={{marginTop:0}}>Clubs</h2>{clubs.map(c=><button key={c.id} onClick={()=>openClub(c)} style={{...btn,width:'100%',textAlign:'left',marginBottom:8}}><b>{c.name}</b><br/><small>{c.category} · {c.visibility}</small></button>)}{!clubs.length&&<p style={{opacity:.6}}>No visible clubs yet. Create one from the publishing/admin workflow.</p>}</section>
      <section style={panel}>{selected?<><div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div><h2 style={{margin:'0 0 4px'}}>{selected.name}</h2><div style={{fontSize:12,opacity:.65}}>{selected.description}</div></div><button disabled={busy} onClick={join} style={btn}>JOIN</button></div><h3>Current Selections</h3>{selections.map(s=><div key={s.id} style={item}><b>{s.title}</b><span style={{float:'right',fontSize:10,color:'#e8b944'}}>{s.status}</span></div>)}{!selections.length&&<p style={{opacity:.6}}>No selection scheduled yet.</p>}<h3>Discussion</h3><div style={{display:'grid',gap:7}}>{discussion.map(d=><article key={d.id} style={item}><div style={{fontSize:11,lineHeight:1.45}}>{d.body}</div><div style={{fontSize:9,opacity:.45,marginTop:5}}>{new Date(d.created_at).toLocaleString()}</div></article>)}</div><textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Join the club, then add to the discussion…" style={{width:'100%',minHeight:90,marginTop:10,padding:10,borderRadius:10,border:'1px solid #4b3550',background:'#0c0b18',color:'#fff',boxSizing:'border-box'}}/><button disabled={busy||!body.trim()} onClick={post} style={{...btn,marginTop:8}}>POST DISCUSSION</button></>:<p style={{opacity:.6}}>Select a book club.</p>}{message&&<div style={{marginTop:12,color:'#e8b944',fontSize:12}}>{message}</div>}</section>
    </main>
  </div>
}
const panel:React.CSSProperties={padding:16,border:'1px solid #342541',borderRadius:16,background:'#0a0915'}
const item:React.CSSProperties={padding:10,border:'1px solid #2f2740',borderRadius:10,background:'#0d0c19'}
const btn:React.CSSProperties={minHeight:40,padding:'0 12px',border:'1px solid #ff9ee866',borderRadius:10,background:'#17132a',color:'#fff',fontWeight:900,cursor:'pointer'}
