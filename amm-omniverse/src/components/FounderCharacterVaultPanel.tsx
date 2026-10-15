import {useEffect,useState} from 'react'
import {getAccessToken,getSupabaseClient} from '../services/supabaseClient'

type VaultAsset={
  id:string;assetId:string;filename:string;cityScope:string;status:string
  sourceKind:string;byteSize:number|null;meshCount:number|null;animationCount:number|null
  publicUrl?:string|null;createdAt:string
}
type VaultReply={ok:boolean;role?:string;characters?:VaultAsset[];asset?:VaultAsset
  error?:string;recordId?:string;bucket?:string;path?:string;token?:string}

const control:React.CSSProperties={minHeight:46,padding:'10px 12px',borderRadius:12,
  border:'1px solid #69cfe8',background:'#0b2331',color:'#f0fbff',fontWeight:800,fontSize:12,
  touchAction:'manipulation'}
const input:React.CSSProperties={...control,width:'100%',minWidth:0,boxSizing:'border-box'}

async function vault(action?:Record<string,unknown>):Promise<VaultReply>{
  const client=getSupabaseClient()
  const token=await getAccessToken()
  if(!client||!token)throw new Error('Sign in to TRYAMM before using the private character vault.')
  const supabaseUrl=String(import.meta.env.VITE_SUPABASE_URL||'').replace(/\/$/,'')
  if(!supabaseUrl)throw new Error('Supabase endpoint is not configured.')
  const response=await fetch(supabaseUrl+'/functions/v1/streetverse-character-vault',{
    method:action?'POST':'GET',cache:'no-store',
    headers:{authorization:'Bearer '+token,apikey:String(import.meta.env.VITE_SUPABASE_ANON_KEY||''),
      'content-type':'application/json'},
    body:action?JSON.stringify(action):undefined
  })
  const data=await response.json().catch(()=>({ok:false,error:'vault_network_error'})) as VaultReply
  if(!response.ok||!data.ok)throw new Error(data.error||'Character Vault is unavailable ('+response.status+').')
  return data
}

export default function FounderCharacterVaultPanel(){
  const [assets,setAssets]=useState<VaultAsset[]>([])
  const [role,setRole]=useState('')
  const [assetId,setAssetId]=useState('sv-bj-stubbs-v6')
  const [sourceKind,setSourceKind]=useState('manual_glb')
  const [scope,setScope]=useState('global')
  const [file,setFile]=useState<File|null>(null)
  const [busy,setBusy]=useState('')
  const [message,setMessage]=useState('')
  const [confirmId,setConfirmId]=useState('')
  const [authorized,setAuthorized]=useState(false)

  async function refresh(){
    try{
      const data=await vault()
      setAssets(data.characters||[])
      setRole(data.role||'')
      setAuthorized(true)
      setMessage('')
    }catch(error){
      setAuthorized(false)
      setMessage(error instanceof Error?error.message:String(error))
    }
  }
  useEffect(()=>{void refresh()},[])

  async function upload(){
    if(!file||busy)return
    setBusy('upload')
    setMessage('Opening a private upload slot…')
    try{
      if(file.size>50*1024*1024)throw new Error('GLB files must be smaller than 50 MB.')
      if(!/^[a-zA-Z0-9_-]{3,95}\.glb$/.test(file.name))
        throw new Error('Use a filename with letters, numbers, underscores or dashes ending .glb.')
      const client=getSupabaseClient()
      if(!client)throw new Error('Supabase is not available in this browser.')
      const intent=await vault({action:'intent',assetId,cityScope:scope,filename:file.name,
        fileSize:file.size,sourceKind})
      if(!intent.bucket||!intent.path||!intent.token||!intent.recordId)
        throw new Error('The private upload slot was incomplete.')
      setMessage('Uploading to PRIVATE drafts — not public StreetVerse…')
      const sent=await client.storage.from(intent.bucket).uploadToSignedUrl(
        intent.path,intent.token,file,{contentType:'model/gltf-binary',cacheControl:'300'})
      if(sent.error)throw sent.error
      setMessage('Checking your GLB and saving the review record…')
      await vault({action:'finalize',recordId:intent.recordId})
      setFile(null)
      setMessage('Character saved PRIVATELY. Founder review is needed before it can appear in the game.')
      const updated=await vault()
      setAssets(updated.characters||[])
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy('')}
  }
  async function review(id:string,action:'approve'|'reject'){
    if(busy)return
    if(action==='approve'&&confirmId!==id){setConfirmId(id);setMessage('Confirm publication by tapping PUBLISH THIS CHARACTER again.');return}
    setBusy(id)
    try{
      const result=await vault({action,recordId:id,...(action==='approve'?{confirm:'PUBLISH_TO_STREETVERSE'}:{})})
      setMessage(action==='approve'?'Approved GLB published to StreetVerse storage.':'Draft rejected; private file retained for audit.')
      if(result.asset)setAssets(items=>items.map(item=>item.id===id?result.asset!:item))
      setConfirmId('')
      await refresh()
    }catch(error){setMessage(error instanceof Error?error.message:String(error))}
    finally{setBusy('')}
  }

  return <section aria-label="Secure Founder Character Vault" style={{marginTop:14,padding:14,
    background:'#071921',border:'2px solid #5cb9aa',borderRadius:17,color:'#eafff7'}}>
    <h2 style={{fontSize:18,margin:'0 0 7px'}}>Founder Character Vault <small style={{fontSize:11,color:'#80eed2'}}>PRIVATE → REVIEW → GAME</small></h2>
    <p style={{fontSize:12,lineHeight:1.5,color:'#b2cfd0'}}>
      Save existing Meshy, Higgsfield or Blender GLB models without a new paid generation. Uploads remain private until a signed-in founder approves them. Only approved files become available in StreetVerse.
    </p>
    <div style={{fontSize:11,marginBottom:8,color:authorized?'#95ffbd':'#ffd6a8'}} aria-live="polite">
      {authorized?'AUTHORIZED: '+role.toUpperCase():'SIGN-IN / FOUNDER PERMISSION REQUIRED'}
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))',gap:8}}>
      <label style={{fontSize:12}}>StreetVerse character slot
        <input style={input} aria-label="Character slot" value={assetId} maxLength={90} onChange={e=>setAssetId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g,''))}/>
      </label>
      <label style={{fontSize:12}}>Asset source
        <select style={input} aria-label="Character source" value={sourceKind} onChange={e=>setSourceKind(e.target.value)}>
          <option value="manual_glb">Existing GLB file</option>
          <option value="meshy_existing">Existing Meshy task export</option>
          <option value="meshy_generated">New Meshy GLB (already exported)</option>
          <option value="higgsfield_glb">Higgsfield 3D character export</option>
        </select>
      </label>
      <label style={{fontSize:12}}>World
        <select style={input} aria-label="Character world scope" value={scope} onChange={e=>setScope(e.target.value)}>
          <option value="global">StreetVerse Global</option>
          <option value="chicago-circle-park">Chicago / Circle Park</option>
          <option value="chicago-west-side">Chicago / West Side</option>
        </select>
      </label>
      <label style={{fontSize:12}}>Character GLB (up to 50 MB)
        <input aria-label="Choose character GLB" style={{...input,padding:8}} type="file" accept=".glb,model/gltf-binary"
          onChange={e=>setFile(e.target.files?.[0]||null)}/>
      </label>
    </div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
      <button style={control} disabled={busy!==''||!file||!authorized} onClick={()=>void upload()}>
        {busy==='upload'?'SAVING PRIVATE CHARACTER…':'SAVE CHARACTER PRIVATELY'}
      </button>
      <button style={control} disabled={busy!==''} onClick={()=>void refresh()}>CHECK STATUS</button>
    </div>
    {message&&<p role="status" style={{fontSize:12,background:'#122e34',borderRadius:8,padding:9}}>{message}</p>}
    <h3 style={{fontSize:14,margin:'18px 0 9px'}}>Saved characters ({assets.length})</h3>
    {!assets.length&&<p style={{fontSize:12,color:'#b4cfd5'}}>No saved characters for this founder account yet.</p>}
    <div style={{display:'grid',gap:8}}>
      {assets.map(a=><article key={a.id} style={{padding:10,border:'1px solid #335d61',borderRadius:10,fontSize:12}}>
        <div style={{fontWeight:850}}>{a.filename}</div>
        <div style={{color:'#b6d8d8',marginTop:4}}>Slot: {a.assetId} · {a.status.toUpperCase()} · {a.meshCount??'?'} meshes · {a.animationCount??'?'} animations</div>
        {a.status==='pending_review'&&role==='founder'&&<div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
          <button style={control} disabled={busy!==''} onClick={()=>void review(a.id,'approve')}>
            {confirmId===a.id?'PUBLISH THIS CHARACTER':'REVIEW & APPROVE'}
          </button>
          <button style={control} disabled={busy!==''} onClick={()=>void review(a.id,'reject')}>REJECT</button>
        </div>}
        {a.status==='published'&&a.publicUrl&&<a href={a.publicUrl} rel="noopener noreferrer" target="_blank" style={{display:'inline-block',marginTop:9,color:'#8effc0',fontWeight:800}}>View approved GLB <span aria-hidden="true">↗</span></a>}
      </article>)}
    </div>
  </section>
}