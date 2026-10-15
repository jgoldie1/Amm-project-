import {createClient} from 'npm:@supabase/supabase-js@2.57.0';
// Authenticated TRYAMM founder vault. No credentials are sent to browsers.
const DRAFT='streetverse-character-drafts',LIVE='streetverse-assets',MAX=50*1024*1024;
const url=Deno.env.get('SUPABASE_URL')||'',key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
const trustedOrigins=new Set(['https://tryamm.online','https://www.tryamm.online','http://localhost:5173']);
function headers(req:Request){
  const origin=req.headers.get('origin')||'';
  const ok=trustedOrigins.has(origin)||/^https:\/\/[a-z0-9-]+-jgoldie1s-projects\.vercel\.app$/i.test(origin);
  return {'access-control-allow-origin':ok?origin:'https://tryamm.online',
    'access-control-allow-methods':'GET,POST,OPTIONS',
    'access-control-allow-headers':'apikey,authorization,content-type,x-client-info',
    'vary':'Origin','cache-control':'no-store','content-type':'application/json'};
}
function reply(req:Request,status:number,data:unknown){return new Response(JSON.stringify(data),{status,headers:headers(req)});}
function fail(status:number,code:string):never{throw Object.assign(new Error(code),{status,code});}
function safe(value:unknown,max=100){return String(value||'').trim().slice(0,max);}
function view(a:Record<string,any>){return {id:a.id,assetId:a.asset_id,filename:a.filename,
  status:a.status,cityScope:a.city_scope,sourceKind:a.source_kind,
  byteSize:a.byte_size,meshCount:a.mesh_count,animationCount:a.animation_count,
  publicUrl:a.status==='published'?a.published_url:null,createdAt:a.created_at};}
async function operator(req:Request){
 const h=req.headers.get('authorization')||'';
 if(!h.startsWith('Bearer '))fail(401,'login_required');
 const {data,error}=await db.auth.getUser(h.slice(7));
 if(error||!data.user?.id)fail(401,'invalid_session');
 const id=data.user.id;
 const x=await db.from('asset_factory_operators').select('role,revoked_at').eq('user_id',id).maybeSingle();
 if(x.error)fail(503,'role_lookup_unavailable');
 if(!x.data||x.data.revoked_at||!['founder','asset_admin'].includes(x.data.role))fail(403,'founder_permission_not_granted');
 return {id,role:x.data.role as string};
}
function uuid(x:string){return /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(x);}
function inspect(bytes:ArrayBuffer){
 const d=new DataView(bytes);
 if(bytes.byteLength<32||bytes.byteLength>MAX||d.getUint32(0,true)!==0x46546c67||
    d.getUint32(4,true)!==2||d.getUint32(8,true)!==bytes.byteLength)fail(422,'invalid_glb');
 const count=d.getUint32(12,true);
 if(count<4||count>5000000||20+count>bytes.byteLength||d.getUint32(16,true)!==0x4e4f534a)fail(422,'invalid_glb_json');
 let j:any;
 try{j=JSON.parse(new TextDecoder().decode(new Uint8Array(bytes,20,count)));}
 catch{fail(422,'invalid_glb_scene');}
 if(!Array.isArray(j.meshes)||j.meshes.length===0)fail(422,'no_3d_meshes');
 if((j.images||[]).some((i:any)=>i.uri)||(j.buffers||[]).some((b:any)=>b.uri))
   fail(422,'embed_all_textures_in_glb');
 return {meshCount:j.meshes.length,animationCount:(j.animations||[]).length,byteSize:bytes.byteLength};
}
async function load(path:string){
 const r=await db.storage.from(DRAFT).download(path);
 if(r.error||!r.data)fail(404,'uploaded_draft_missing');
 const bytes=await r.data.arrayBuffer(),info=inspect(bytes);
 const sha256=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
 return {bytes,info,sha256};
}
async function owned(id:string,userId:string){
 if(!uuid(id))fail(400,'invalid_record_id');
 const r=await db.from('asset_factory_assets').select('*').eq('id',id).single();
 if(r.error||!r.data)fail(404,'asset_not_found');
 if(r.data.owner_user_id!==userId)fail(403,'owner_required');
 return r.data;
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:headers(req)});
 if(!url||!key)return reply(req,503,{ok:false,error:'vault_not_configured'});
 if(!['GET','POST'].includes(req.method))return reply(req,405,{ok:false,error:'method_not_allowed'});
 try{
  const me=await operator(req);
  if(req.method==='GET'){
   const rows=await db.from('asset_factory_assets').select('*').eq('owner_user_id',me.id).order('created_at',{ascending:false}).limit(40);
   if(rows.error)fail(503,'assets_unavailable');
   return reply(req,200,{ok:true,role:me.role,schema:'tryamm.character-vault.v1',
     characters:(rows.data||[]).map(view),generationCreditsUsed:0});
  }
  let body:any;try{body=await req.json();}catch{fail(400,'invalid_json');}
  const action=safe(body.action,30);
  if(action==='intent'){
   const assetId=safe(body.assetId,90),scope=safe(body.cityScope||'global',80).toLowerCase();
   const filename=safe(body.filename,100),size=Number(body.fileSize);
   const sourceKind=safe(body.sourceKind||'manual_glb',30);
   if(!/^[a-z0-9][a-z0-9_-]{2,89}$/.test(assetId)||!/^[a-z0-9_-]{1,80}$/.test(scope))fail(400,'invalid_asset_scope');
   if(!/^[a-zA-Z0-9_-]{3,95}\.glb$/.test(filename))fail(400,'invalid_glb_name');
   if(!Number.isSafeInteger(size)||size<32||size>MAX)fail(413,'max_50mb_glb');
   if(!['manual_glb','meshy_existing','meshy_generated','higgsfield_glb'].includes(sourceKind))fail(400,'invalid_source_kind');
   const id=crypto.randomUUID(),path='characters/drafts/'+me.id+'/'+id+'/'+filename;
   const inserted=await db.from('asset_factory_assets').insert({id,owner_user_id:me.id,
     asset_id:assetId,filename,city_scope:scope,draft_path:path,status:'uploading',
     byte_size:size,source_kind:sourceKind});
   if(inserted.error)fail(503,'draft_record_unavailable');
   const signed=await db.storage.from(DRAFT).createSignedUploadUrl(path,{upsert:false});
   if(signed.error||!signed.data?.token){
     await db.from('asset_factory_assets').delete().eq('id',id).eq('status','uploading');
     fail(503,'signed_upload_unavailable');
   }
   return reply(req,201,{ok:true,recordId:id,bucket:DRAFT,path,token:signed.data.token,
     maxBytes:MAX,public:false,expiresInSeconds:7200});
  }
  const a=await owned(safe(body.recordId,64),me.id);
  if(action==='finalize'){
   if(!['uploading','pending_review'].includes(a.status))fail(409,'not_uploadable_draft');
   const {info,sha256}=await load(a.draft_path);
   const updated=await db.from('asset_factory_assets').update({status:'pending_review',
     sha256,byte_size:info.byteSize,mesh_count:info.meshCount,animation_count:info.animationCount,
     updated_at:new Date().toISOString()}).eq('id',a.id).in('status',['uploading','pending_review']).select().single();
   if(updated.error||!updated.data)fail(409,'draft_update_conflict');
   return reply(req,200,{ok:true,asset:view(updated.data),reviewRequired:true});
  }
  if(action==='approve'){
   if(me.role!=='founder')fail(403,'founder_only');
   if(body.confirm!=='PUBLISH_TO_STREETVERSE')fail(400,'explicit_confirmation_required');
   if(a.status==='published')return reply(req,200,{ok:true,asset:view(a),alreadyPublished:true});
   if(a.status!=='pending_review')fail(409,'not_reviewed');
   const {bytes,info,sha256}=await load(a.draft_path);
   if(sha256!==a.sha256||info.byteSize!==a.byte_size)fail(409,'draft_changed_after_review');
   const claim=await db.from('asset_factory_assets').update({status:'publishing'})
     .eq('id',a.id).eq('status','pending_review').select().maybeSingle();
   if(claim.error||!claim.data)fail(409,'publish_already_running');
   const path='characters/approved/'+a.city_scope+'/'+a.asset_id+'/'+a.id+'.glb';
   try{
    const uploaded=await db.storage.from(LIVE).upload(path,new Blob([bytes],{type:'model/gltf-binary'}),
      {upsert:false,contentType:'model/gltf-binary',cacheControl:'86400'});
    if(uploaded.error)throw uploaded.error;
    const publicUrl=db.storage.from(LIVE).getPublicUrl(path).data.publicUrl,now=new Date().toISOString();
    const done=await db.from('asset_factory_assets').update({status:'published',
      approved_by:me.id,approved_at:now,published_at:now,published_path:path,
      published_url:publicUrl,updated_at:now}).eq('id',a.id).eq('status','publishing').select().single();
    if(done.error||!done.data){
      await db.storage.from(LIVE).remove([path]);
      fail(503,'publication_registry_failed');
    }
    return reply(req,200,{ok:true,asset:view(done.data),streetverseReady:true});
   }catch(e){
    await db.from('asset_factory_assets').update({status:'pending_review'}).eq('id',a.id).eq('status','publishing');
    throw e;
   }
  }
  if(action==='reject'){
   if(me.role!=='founder')fail(403,'founder_only');
   if(a.status!=='pending_review')fail(409,'not_reviewable');
   const changed=await db.from('asset_factory_assets').update({status:'rejected'})
     .eq('id',a.id).eq('status','pending_review').select().single();
   if(changed.error||!changed.data)fail(409,'review_conflict');
   return reply(req,200,{ok:true,asset:view(changed.data)});
  }
  fail(400,'unsupported_action');
 }catch(err){
  const e=err as {status?:number;code?:string};
  console.error('asset_vault',{status:e.status||500,code:e.code||'vault_error'});
  return reply(req,e.status||500,{ok:false,error:e.code||'asset_vault_error'});
 }
});