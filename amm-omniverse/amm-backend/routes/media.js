const express=require('express')

function createMediaRouter({supabase}){
 const router=express.Router()
 async function optionalUser(req){
  const auth=req.headers.authorization||''; const token=auth.startsWith('Bearer ')?auth.slice(7):''
  if(!token)return null
  const {data}=await supabase.auth.getUser(token); return data?.user||null
 }
 async function requireUser(req,res,next){const u=await optionalUser(req);if(!u)return res.status(401).json({error:'Authentication required'});req.user=u;next()}

 router.get('/catalog',async(_req,res)=>{
  const {data,error}=await supabase.from('media_catalog').select('id,slug,title,description,media_kind,lane,access_type,poster_url,rating,metadata').eq('published',true).order('created_at',{ascending:false}).limit(200)
  if(error)return res.status(500).json({error:'Could not load media catalog'})
  res.json({items:data||[]})
 })

 router.post('/:id/playback',async(req,res)=>{
  try{
   const user=await optionalUser(req)
   const {data:item,error}=await supabase.from('media_catalog').select('*').eq('id',req.params.id).eq('published',true).maybeSingle()
   if(error)throw error
   if(!item)return res.status(404).json({error:'Media not found'})
   let allowed=item.access_type==='FREE'
   if(!allowed&&user){
    const now=new Date().toISOString()
    const {data:ent}=await supabase.from('media_entitlements').select('id,expires_at,revoked_at').eq('user_id',user.id).eq('media_id',item.id).is('revoked_at',null).limit(20)
    allowed=(ent||[]).some(e=>!e.expires_at||e.expires_at>now)
   }
   if(!allowed)return res.status(user?403:401).json({error:'Entitlement required',access:item.access_type})
   let url=item.external_stream_url||null
   if(item.storage_bucket&&item.storage_path){
    const {data:signed,error:signError}=await supabase.storage.from(item.storage_bucket).createSignedUrl(item.storage_path,900)
    if(signError)throw signError
    url=signed?.signedUrl||null
   }
   if(!url)return res.status(409).json({error:'Media is published but no playable source is configured'})
   res.json({media:{id:item.id,title:item.title,kind:item.media_kind,poster:item.poster_url,captions:item.captions_url},playback:{url,expiresInSeconds:item.storage_path?900:null},access:item.access_type})
  }catch(err){res.status(500).json({error:err.message||'Playback authorization failed'})}
 })

 router.put('/:id/progress',requireUser,async(req,res)=>{
  const position=Math.max(0,Number(req.body?.positionSeconds||0));const completed=Boolean(req.body?.completed)
  const {error}=await supabase.from('media_watch_history').upsert({user_id:req.user.id,media_id:req.params.id,position_seconds:position,completed,last_watched_at:new Date().toISOString()},{onConflict:'user_id,media_id'})
  if(error)return res.status(500).json({error:'Could not save watch progress'})
  res.json({ok:true})
 })
 return router
}
module.exports={createMediaRouter}
