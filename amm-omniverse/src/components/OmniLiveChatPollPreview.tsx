import {useMemo,useState} from 'react'

/** Host-only local chat poll preview. Do not treat it as a verified audience vote. */
export default function OmniLiveChatPollPreview(){
 const [question,setQuestion]=useState('Where should BJ go next?')
 const [one,setOne]=useState('Circle Park')
 const [two,setTwo]=useState('Taylor Street')
 const [open,setOpen]=useState(false)
 const [votes,setVotes]=useState<Record<'1'|'2',number>>({'1':0,'2':0})
 const [chat,setChat]=useState('')
 const [history,setHistory]=useState<string[]>([])
 const total=votes['1']+votes['2']
 const leader=useMemo(()=>votes['1']===votes['2']?'Tied':votes['1']>votes['2']?one:two,[votes,one,two])
 const submit=(entry:string)=>{
  const text=entry.trim().slice(0,240)
  if(!text)return
  // Preview-only. Each command is an example, NOT a genuine viewer identity.
  const match=text.match(/^(?:!vote\s*)?([12])$/i)
  if(match&&open){
   const choice=match[1] as '1'|'2'
   setVotes(v=>({...v,[choice]:v[choice]+1}))
   setHistory(v=>[...v.slice(-7),`Demo vote: option ${choice}`])
  }else{
   setHistory(v=>[...v.slice(-7),text.replace(/[<>]/g,'')])
  }
  setChat('')
 }
 const field:React.CSSProperties={minHeight:44,background:'#08192c',color:'#fff',border:'1px solid #83dff488',borderRadius:10,padding:'8px',fontSize:14,width:'100%',boxSizing:'border-box'}
 const button:React.CSSProperties={minHeight:44,padding:'8px 12px',borderRadius:10,border:'1px solid #79e3fa88',background:'#12354a',color:'#fff',fontWeight:750,touchAction:'manipulation'}
 return <section aria-label="Creator chat poll preview" data-no-realm-swipe="true" style={{border:'1px solid #67e8f977',borderRadius:14,padding:12,marginTop:12}}>
  <h3 style={{fontSize:16,margin:'0 0 8px'}}>📊 LIVE CHAT POLL · OPTIONS 1 / 2</h3>
  <p style={{fontSize:11,color:'#bad2e4'}}>Local chat simulator. No real chat, audience identity, streaming API or persistent voting is connected.</p>
  <label style={{display:'block',fontSize:12}}>Question<input value={question} onChange={e=>setQuestion(e.target.value.slice(0,120))} disabled={open} style={field}/></label>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8,marginTop:8}}>
   <label style={{fontSize:12}}>Option 1<input value={one} disabled={open} onChange={e=>setOne(e.target.value.slice(0,60))} style={field}/></label>
   <label style={{fontSize:12}}>Option 2<input value={two} disabled={open} onChange={e=>setTwo(e.target.value.slice(0,60))} style={field}/></label>
  </div>
  <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:10}}>
   <button style={button} onClick={()=>setOpen(v=>!v)}>{open?'Close poll':'Open poll'}</button>
   <button style={button} onClick={()=>{setVotes({'1':0,'2':0});setHistory([]);setOpen(false)}}>New poll / reset</button>
  </div>
  <div role="status" aria-live="polite" style={{marginTop:10,fontSize:13}}>{question||'Untitled poll'} · {open?'Voting open':'Voting closed'} · {total} demo votes · {leader}</div>
  <div style={{display:'grid',gap:7,marginTop:8}}>
   {(['1','2'] as const).map(id=><div key={id}>
    <div style={{display:'flex',justifyContent:'space-between',gap:8,fontSize:12}}><span>{id}. {id==='1'?one:two}</span><strong>{votes[id]} ({total?Math.round(votes[id]/total*100):0}%)</strong></div>
    <div role="meter" aria-label={`Option ${id} vote share`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={total?Math.round(votes[id]/total*100):0} style={{height:8,background:'#28415a',borderRadius:6,overflow:'hidden',marginTop:3}}><div style={{height:'100%',width:`${total?votes[id]/total*100:0}%`,background:'#67e8f9'}}/></div>
   </div>)}
  </div>
  <form onSubmit={e=>{e.preventDefault();submit(chat)}} style={{display:'flex',gap:6,marginTop:12}}>
   <input aria-label="Test chat command" value={chat} onChange={e=>setChat(e.target.value)} placeholder="Type 1, 2, !vote 1, or chat" style={{...field,flex:1,minWidth:0}}/>
   <button type="submit" style={button}>Send</button>
  </form>
  <div aria-label="Local simulated chat" style={{fontSize:12,marginTop:6}}>{history.map((msg,i)=><div key={i}>{msg}</div>)}</div>
  <p style={{fontSize:11,color:'#bad2e4'}}>Future LIVE implementation: authenticated one-vote-per-viewer, chat moderation, server-side tally, closing deadline, and optional host-approved RP mission selection. Demo counts must never affect game rewards.</p>
 </section>
}
