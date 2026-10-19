import {useEffect,useState} from 'react'
import {getSupabaseClient} from '../services/supabaseClient'

export default function MeshyFactorySignIn({onSession}:{onSession:(signedIn:boolean)=>void}){
  const [signedIn,setSignedIn]=useState(false),[checking,setChecking]=useState(true)
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
  const [creating,setCreating]=useState(false)
  const client=getSupabaseClient()
  useEffect(()=>{
    if(!client){setChecking(false);onSession(false);return}
    const {data:{subscription}}=client.auth.onAuthStateChange((_event,session)=>{
      const active=Boolean(session?.user&&!session.user.is_anonymous)
      setSignedIn(active);setChecking(false);onSession(active)
    })
    return()=>subscription.unsubscribe()
  },[client,onSession])
  const login=async(event:React.FormEvent)=>{
    event.preventDefault();if(!client)return
    setBusy(true);setMessage('')
    try{
      const result=creating
        ?await client.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:window.location.origin+'/asset-factory'}})
        :await client.auth.signInWithPassword({email:email.trim(),password})
      if(result.error)throw result.error
      setPassword('')
      if(creating)setMessage('Check your email to confirm the account. Factory permission must then be assigned to your verified account.')
    }
    catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy(false)}
  }
  const oauth=async(provider:'google'|'apple')=>{
    if(!client)return;setBusy(true);setMessage('')
    try{const {error}=await client.auth.signInWithOAuth({provider,options:{redirectTo:window.location.origin+'/asset-factory'}});if(error)throw error}
    catch(error){setMessage(error instanceof Error?error.message:String(error));setBusy(false)}
  }
  const input:React.CSSProperties={minHeight:48,borderRadius:10,padding:'8px 12px',background:'#091823',color:'#fff',border:'1px solid #6590aa',fontSize:16,width:'100%',boxSizing:'border-box'}
  return <section aria-label="Factory sign-in" style={{padding:16,border:'1px solid #6590aa',borderRadius:14,marginTop:16}}>
    <h2 style={{margin:'0 0 8px',fontSize:20}}>{checking?'Checking sign-in…':signedIn?'Signed in — checking factory permissions':'Sign in to the asset factory'}</h2>
    {!client?<p role="alert">Secure sign-in is not configured for this build. The deployment needs its Supabase public configuration.</p>:!signedIn&&!checking?<>
      <p>Sign in with your TRYAMM account, or create one if you have never registered. Factory permission is checked separately by the server.</p>
      <form onSubmit={login} style={{display:'grid',gap:10,maxWidth:440}}>
        <label>Email<input style={input} type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
        <label>Password<input style={input} type="password" autoComplete={creating?"new-password":"current-password"} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <button style={input} disabled={busy} type="submit">{busy?'Working…':creating?'CREATE ACCOUNT':'SIGN IN'}</button>
      </form>
      <button style={{...input,maxWidth:440,marginTop:10}} disabled={busy} onClick={()=>{setCreating(!creating);setMessage('')}}>{creating?'Use existing account':'Create a TRYAMM account'}</button>
      <div style={{display:'flex',gap:10,marginTop:10,maxWidth:440}}><button style={input} disabled={busy} onClick={()=>void oauth('google')}>Google</button><button style={input} disabled={busy} onClick={()=>void oauth('apple')}>Apple</button></div>
    </>:null}
    {message&&<p role="alert">{message}</p>}
  </section>
}
