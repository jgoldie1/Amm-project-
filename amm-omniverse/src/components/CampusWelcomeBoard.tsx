import { FormEvent, useEffect, useState } from 'react'
import { getSupabaseClient } from '../services/supabaseClient'

type WelcomeMessage={
  id:string
  user_id:string|null
  author_name:string
  university_name:string
  class_year:number|null
  message:string
  status:'pending'|'approved'|'rejected'
  is_platform_seed:boolean
  created_at:string
}

const DEFAULT_MESSAGE='Welcome to Greenville University, Class of 2031. Wishing Jacobie and every new student a strong beginning, meaningful friendships, and a successful college journey.'

export default function CampusWelcomeBoard(){
  const [open,setOpen]=useState(false)
  const [messages,setMessages]=useState<WelcomeMessage[]>([])
  const [author,setAuthor]=useState('')
  const [message,setMessage]=useState(DEFAULT_MESSAGE)
  const [notice,setNotice]=useState('Signed-in students, family and friends can submit a welcome message. New messages are moderated before public display.')
  const [sending,setSending]=useState(false)

  async function load(){
    const sb=getSupabaseClient()
    if(!sb){setNotice('Cloud community features are not configured on this build.');return}
    const {data,error}=await sb.from('campus_welcome_messages').select('id,user_id,author_name,university_name,class_year,message,status,is_platform_seed,created_at').eq('university_name','Greenville University').eq('class_year',2031).order('created_at',{ascending:false}).limit(50)
    if(error){setNotice(error.message);return}
    setMessages((data||[]) as WelcomeMessage[])
  }

  useEffect(()=>{if(open)void load()},[open])

  async function submit(e:FormEvent){
    e.preventDefault()
    const sb=getSupabaseClient()
    if(!sb){setNotice('Secure sign-in is required.');return}
    setSending(true)
    try{
      const {data:{user}}=await sb.auth.getUser()
      if(!user)throw new Error('Please sign in before posting a university welcome message.')
      const display=author.trim()||user.user_metadata?.full_name||user.user_metadata?.name||user.email?.split('@')[0]||'TRYAMM Community Member'
      const text=message.trim()
      if(text.length<3)throw new Error('Write a welcome message first.')
      if(text.length>800)throw new Error('Keep the welcome message under 800 characters.')
      const {error}=await sb.from('campus_welcome_messages').insert({user_id:user.id,author_name:display,university_name:'Greenville University',class_year:2031,message:text,status:'pending',is_platform_seed:false})
      if(error)throw error
      setNotice('Welcome message submitted. You can see your pending message now; it becomes public after moderation.')
      setMessage(DEFAULT_MESSAGE)
      await load()
    }catch(error){setNotice(error instanceof Error?error.message:'Could not submit the message.')}
    finally{setSending(false)}
  }

  if(!open)return <button type="button" onClick={()=>setOpen(true)} aria-label="Open Greenville University Class of 2031 welcome board" style={{position:'fixed',left:12,bottom:122,zIndex:8993,border:'1px solid #e8b94499',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#17130a,#0b1c25)',color:'#ffe08a',fontSize:10,fontWeight:950,letterSpacing:1,cursor:'pointer'}}>🎓 CAMPUS WELCOME</button>

  return <div role="dialog" aria-label="Greenville University Class of 2031 community welcome board" style={{position:'fixed',inset:0,zIndex:15020,background:'#02050bf2',color:'#fff',overflow:'auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:900,margin:'0 auto',padding:'24px 14px 80px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'flex-start',marginBottom:18}}>
        <div><div style={{fontSize:10,fontWeight:950,letterSpacing:3,color:'#e8b944'}}>TRYAMM COMMUNITY • CAMPUS WELCOME</div><h1 style={{margin:'6px 0'}}>Welcome to Greenville University</h1><div style={{color:'#4FE3FF',fontWeight:900}}>Class of 2031</div></div>
        <button onClick={()=>setOpen(false)} aria-label="Close campus welcome board" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #3d536c',background:'#0c1520',color:'#fff',fontSize:22}}>×</button>
      </header>

      <div style={{padding:16,border:'1px solid #e8b94466',borderRadius:18,background:'linear-gradient(135deg,#151105,#071521)',marginBottom:16}}>
        <div style={{fontSize:12,color:'#c9d6e2',lineHeight:1.7}}>{DEFAULT_MESSAGE}</div>
        <div style={{marginTop:8,fontSize:9,color:'#7f8e9b'}}>Community-created welcome inside TRYAMM. This is not an official Greenville University announcement.</div>
      </div>

      <form onSubmit={submit} style={{display:'grid',gap:10,padding:16,border:'1px solid #294058',borderRadius:18,background:'#08111c',marginBottom:16}}>
        <strong>Add your welcome</strong>
        <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Your name (optional if your profile has one)" maxLength={120} style={input}/>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} maxLength={800} rows={5} aria-label="Welcome message" style={{...input,resize:'vertical'}}/>
        <button disabled={sending} style={{border:0,borderRadius:12,padding:'12px 14px',background:'linear-gradient(135deg,#e8b944,#4FE3FF)',color:'#08111c',fontWeight:950,opacity:sending?.6:1}}>{sending?'SUBMITTING…':'SUBMIT WELCOME MESSAGE'}</button>
        <div aria-live="polite" style={{fontSize:10,color:'#aebccc',lineHeight:1.5}}>{notice}</div>
      </form>

      <section style={{display:'grid',gap:10}}>
        <div style={{fontSize:11,fontWeight:950,letterSpacing:2,color:'#4FE3FF'}}>CLASS OF 2031 MESSAGES</div>
        {messages.length?messages.map(item=><article key={item.id} style={{padding:14,border:'1px solid #26394c',borderRadius:15,background:'#07101a'}}><div style={{display:'flex',justifyContent:'space-between',gap:10,marginBottom:7}}><b>{item.author_name}</b><span style={{fontSize:9,color:item.status==='approved'?'#6df5a1':'#e8b944'}}>{item.status==='approved'?'PUBLIC':'PENDING MODERATION'}</span></div><div style={{fontSize:12,lineHeight:1.65,color:'#c5d2df'}}>{item.message}</div></article>):<div style={{fontSize:11,color:'#8194a8'}}>Loading community welcomes…</div>}
      </section>
    </div>
  </div>
}

const input:React.CSSProperties={border:'1px solid #33495e',borderRadius:11,padding:11,background:'#07101a',color:'#fff',fontFamily:'inherit'}
