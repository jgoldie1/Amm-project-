import { useEffect, useState } from 'react'
import { getAccessToken } from '../services/supabaseClient'

type Props={onClose:()=>void}
type Passkey={id:string;label?:string;createdAt?:string;lastUsedAt?:string}
const api=async(path:string,options:RequestInit={})=>{
  const token=await getAccessToken();if(!token)throw new Error('Please sign in with a verified account first.')
  const r=await fetch(path,{...options,headers:{'content-type':'application/json',authorization:`Bearer ${token}`,...(options.headers||{})}})
  const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||'Security request failed');return data
}
const b64u=(buf:ArrayBuffer)=>{const bytes=new Uint8Array(buf);let s='';bytes.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
const fromB64u=(s:string)=>{const p=s.replace(/-/g,'+').replace(/_/g,'/');const raw=atob(p+'==='.slice((p.length+3)%4));return Uint8Array.from(raw,c=>c.charCodeAt(0))}

export default function SecurityCenter({onClose}:Props){
  const [passkeys,setPasskeys]=useState<Passkey[]>([]),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[account,setAccount]=useState<any>(null)
  const refresh=async()=>{try{const [p,a]=await Promise.all([api('/api/security/passkeys'),api('/api/security/account')]);setPasskeys(p.passkeys||[]);setAccount(a)}catch(e:any){setStatus(e.message)}}
  useEffect(()=>{refresh()},[])
  const enroll=async()=>{setBusy(true);setStatus('');try{
    if(!window.PublicKeyCredential)throw new Error('This browser does not support passkeys.')
    const o=await api('/api/security/passkeys',{method:'POST',body:JSON.stringify({op:'register-options'})})
    const credential=await navigator.credentials.create({publicKey:{challenge:fromB64u(o.challenge),rp:{name:'TRYAMM',id:o.rp.rpID},user:{id:new TextEncoder().encode(o.user.id),name:o.user.name,displayName:o.user.displayName},pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{residentKey:'preferred',userVerification:'required'},timeout:60000,attestation:'none'}}) as PublicKeyCredential|null
    if(!credential)throw new Error('Passkey creation was cancelled.')
    const response=credential.response as AuthenticatorAttestationResponse & {getPublicKey?:()=>ArrayBuffer|null;getTransports?:()=>string[]}
    const publicKey=response.getPublicKey?.();if(!publicKey)throw new Error('Browser did not expose the passkey public key.')
    await api('/api/security/passkeys',{method:'POST',body:JSON.stringify({op:'register-verify',label:'My passkey',response:{credentialId:credential.id,clientDataJSON:b64u(response.clientDataJSON),authenticatorData:b64u(response.getAuthenticatorData()),publicKey:b64u(publicKey),transports:response.getTransports?.()||[]}})})
    setStatus('Passkey enrolled successfully.');await refresh()
  }catch(e:any){setStatus(e.message)}finally{setBusy(false)}}
  const stepUp=async(action:string)=>{const o=await api('/api/security/passkeys',{method:'POST',body:JSON.stringify({op:'auth-options',action})});const assertion=await navigator.credentials.get({publicKey:{challenge:fromB64u(o.challenge),rpId:o.rp.rpID,allowCredentials:(o.allowCredentials||[]).map((c:any)=>({type:'public-key',id:fromB64u(c.id),transports:c.transports})),userVerification:'required',timeout:60000}}) as PublicKeyCredential|null;if(!assertion)throw new Error('Passkey verification cancelled.');const r=assertion.response as AuthenticatorAssertionResponse;return await api('/api/security/passkeys',{method:'POST',body:JSON.stringify({op:'auth-verify',action,response:{credentialId:assertion.id,clientDataJSON:b64u(r.clientDataJSON),authenticatorData:b64u(r.authenticatorData),signature:b64u(r.signature)}})})}
  const testProtected=async()=>{setBusy(true);try{const r=await stepUp('change-payout-destination');setStatus(`Protected-action verification passed. Step-up expires ${new Date(r.expiresAt).toLocaleTimeString()}.`)}catch(e:any){setStatus(e.message)}finally{setBusy(false)}}
  const lockdown=async()=>{if(!confirm('Emergency lockdown will freeze payouts/API access and require account recovery. Continue?'))return;setBusy(true);try{await api('/api/security/account',{method:'POST',body:JSON.stringify({op:'lockdown',reason:'User initiated from Security Center'})});setStatus('Emergency lockdown activated.');await refresh()}catch(e:any){setStatus(e.message)}finally{setBusy(false)}}
  const revoke=async(id:string)=>{setBusy(true);try{await api('/api/security/passkeys',{method:'POST',body:JSON.stringify({op:'revoke',credentialId:id})});await refresh()}catch(e:any){setStatus(e.message)}finally{setBusy(false)}}
  return <div style={{position:'fixed',inset:0,zIndex:10050,background:'#030611',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}><div style={{maxWidth:760,margin:'0 auto',padding:24}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div><div style={{color:'#4fe3ff',fontSize:11,fontWeight:900,letterSpacing:3}}>TRYAMM TRUST</div><h2 style={{margin:'6px 0'}}>Security Center</h2></div><button onClick={onClose} style={{border:'1px solid #3a475c',background:'#101522',color:'#fff',borderRadius:999,width:38,height:38}}>×</button></div>
    <p style={{color:'#a9b4c6'}}>Protect your account with phishing-resistant passkeys, step-up verification, payout freezes, and emergency lockdown.</p>
    <div style={{display:'grid',gap:12,gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',margin:'18px 0'}}>
      <Card title="Account status" body={account?.locked?'LOCKED — recovery required':account?.payoutFrozen?'Payouts temporarily frozen':'Active'} />
      <Card title="Passkeys" body={`${passkeys.length} enrolled`} />
      <Card title="Protected actions" body="Passkey step-up required for sensitive changes" />
    </div>
    <div style={{display:'flex',gap:10,flexWrap:'wrap'}}><Btn onClick={enroll} disabled={busy}>+ Add passkey</Btn><Btn onClick={testProtected} disabled={busy}>Verify protected action</Btn><button onClick={lockdown} disabled={busy} style={{padding:'11px 14px',borderRadius:10,border:'1px solid #ff506d',background:'#34101a',color:'#fff',fontWeight:800}}>Emergency lockdown</button></div>
    {status&&<div style={{marginTop:14,padding:12,border:'1px solid #294057',borderRadius:10,background:'#09131f'}}>{status}</div>}
    <h3 style={{marginTop:28}}>Your passkeys</h3>{passkeys.length===0?<p style={{color:'#8090a4'}}>No passkeys enrolled yet.</p>:passkeys.map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:13,border:'1px solid #1b2a3c',borderRadius:12,marginBottom:8}}><div><b>{p.label||'Passkey'}</b><div style={{fontSize:11,color:'#8290a4'}}>Created {p.createdAt?new Date(p.createdAt).toLocaleDateString():'—'} · Last used {p.lastUsedAt?new Date(p.lastUsedAt).toLocaleString():'never'}</div></div><button onClick={()=>revoke(p.id)} disabled={busy} style={{background:'transparent',border:'1px solid #57313b',color:'#ff9aad',borderRadius:8,padding:'7px 10px'}}>Revoke</button></div>)}
    <div style={{marginTop:28,padding:15,border:'1px solid #463c1f',borderRadius:12,background:'#151207',color:'#e5d59b',fontSize:12,lineHeight:1.5}}>TRYAMM will never ask you to send a passkey, recovery code, password, or security-vault key by message. Security actions should be performed only inside the authenticated app.</div>
  </div></div>
}
function Card({title,body}:{title:string;body:string}){return <div style={{padding:14,border:'1px solid #1c2d40',borderRadius:14,background:'#09111d'}}><div style={{fontSize:10,color:'#4fe3ff',fontWeight:900,letterSpacing:1}}>{title.toUpperCase()}</div><div style={{marginTop:8,fontWeight:800}}>{body}</div></div>}
function Btn(p:any){return <button {...p} style={{padding:'11px 14px',borderRadius:10,border:'1px solid #4fe3ff66',background:'#0d2632',color:'#fff',fontWeight:800}} />}
