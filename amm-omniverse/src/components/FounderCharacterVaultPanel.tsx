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
  const [existingTaskId,setExistingTaskId]=useState('')
  const [existingTaskType,setExistingTaskType]=useState('image-to-3d')
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
  async function importCompletedMeshyTask(){
    if(!authorized||busy)return
    if(!/^[A-Za-z0-9_-]{8,120}$/.test(existingTaskId)){
      setMessage('Choose a valid existing Meshy task ID. This does not create a new paid task.')
      return
    }
    setBusy('meshy-existing')
    setMessage('Importing previously completed Meshy model into private storage…')
    try{
      const token=await getAccessToken()
      if(!token)throw new Error('Sign in first.')
      const res=await fetch('/api/meshy/vault-import',{
        method:'POST',cache:'no-store',
        headers:{authorization:'Bearer '+token,'content-type':'application/json'},
        body:JSON.stringify({assetId,cityScope:scope,type:existingTaskType,taskId:existingTaskId})
      })
      const data=await res.json().catch(()=>({}))
      if(!res.ok||!data.ok)throw new Error(data.error||'Could not import completed Meshy task.')
      const list=await vault()
      setAssets(list.characters||[])
      setMessage('Existing Meshy character saved PRIVATELY. No generation credits used. Founder approval is next.')
    }catch(e){setMessage(e instanceof Error?e.message:String(e))}
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
    <div style={{marginTop:16,padding:10,border:'1px solid #3f6774',borderRadius:12,background:'#0a1f2b'}}>
      <b style={{fontSize:13}}>Reuse a finished Meshy API task — no new generation</b>
      <p style={{fontSize:11,color:'#b2d6db'}}>Paste the ID of a completed Meshy task. TRYAMM fetches its existing GLB, stores it privately, and queues it for your approval. This does not create or pay for another model.</p>
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
        <input style={{...input,flex:'1 1 190px'}} aria-label="Completed Meshy task ID" placeholder="Completed task ID"
          value={existingTaskId} onChange={e=>setExistingTaskId(e.target.value.trim())}/>
        <select style={{...input,flex:'1 1 150px'}} aria-label="Existing task generation type" value={existingTaskType}
          onChange={e=>setExistingTaskType(e.target.value)}>
          <option value="image-to-3d">Image to 3D</option>
          <option value="multi-image-to-3d">Multiple images to 3D</option>
          <option value="text-to-3d">Text to 3D</option>
        </select>
      </div>
      <button style={{...control,marginTop:8,width:'100%'}} disabled={!authorized||busy!==''||!existingTaskId}
        onClick={()=>void importCompletedMeshyTask()}>
        {busy==='meshy-existing'?'IMPORTING EXISTING GLB…':'IMPORT COMPLETED MESHY MODEL PRIVATELY'}
      </button>
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