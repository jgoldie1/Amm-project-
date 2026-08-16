const express=require('express')

function createMediaRouter({supabase,stripe}){
 const router=express.Router()
 async function optionalUser(req){
  const auth=req.headers.authorization||''; const token=auth.startsWith('Bearer ')?auth.slice(7):''
  if(!token)return null
  const {data}=await supabase.auth.getUser(token); return data?.user||null
 }
 async function requireUser(req,res,next){const u=await optionalUser(req);if(!u)return res.status(401).json({error:'Authentication required'});req.user=u;next()}

 router.get('/catalog',async(_req,res)=>{
  const {data,error}=await supabase.from('media_catalog').select('id,slug,title,description,media_kind,lane,access_type,ppv_price_cents,currency,poster_url,rating,duration_seconds,metadata').eq('published',true).order('created_at',{ascending:false}).limit(200)
  if(error)return res.status(500).json({error:'Could not load media catalog'})
  res.json({items:data||[]})
 })

 router.post('/:id/checkout',requireUser,async(req,res)=>{
  try{
   if(!stripe)return res.status(503).json({error:'Stripe is not configured'})
   const {data:item,error}=await supabase.from('media_catalog').select('id,title,access_type,ppv_price_cents,currency,published,creator_user_id').eq('id',req.params.id).eq('published',true).maybeSingle()
   if(error)throw error
   if(!item)return res.status(404).json({error:'Media not found'})
   if(String(item.access_type||'').toUpperCase()!=='PPV')return res.status(409).json({error:'This title is not PPV'})
   const price=Math.floor(Number(item.ppv_price_cents||0))
   if(!Number.isFinite(price)||price<50)return res.status(409).json({error:'PPV price is not configured'})
   const currency=String(item.currency||'usd').toLowerCase()
   const base=process.env.FRONTEND_URL||'https://tryamm.online'
   const metadata={userId:req.user.id,type:'media-ppv',mediaId:item.id,creatorUserId:item.creator_user_id||'',creatorShareBps:String(Math.max(0,Math.min(10000,Number(process.env.MEDIA_CREATOR_SHARE_BPS||7000))))}
   const session=await stripe.checkout.sessions.create({
    mode:'payment',customer_email:req.user.email||undefined,
    line_items:[{price_data:{currency,product_data:{name:item.title},unit_amount:price},quantity:1}],
    success_url:`${base}/?media_purchase=success&media_id=${encodeURIComponent(item.id)}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:`${base}/?media_purchase=cancelled&media_id=${encodeURIComponent(item.id)}`,
    metadata
   })
   res.status(201).json({checkoutUrl:session.url,sessionId:session.id,mediaId:item.id})
  }catch(err){res.status(500).json({error:err.message||'Could not create PPV checkout'})}
 })

 router.post('/:id/playback',async(req,res)=>{
  try{
   const user=await optionalUser(req)
   const {data:item,error}=await supabase.from('media_catalog').select('*').eq('id',req.params.id).eq('published',true).maybeSingle()
   if(error)throw error
   if(!item)return res.status(404).json({error:'Media not found'})
   const access=String(item.access_type||'FREE').toUpperCase()
   let allowed=access==='FREE'

   if(!allowed&&user&&access==='MEMBER'){
    const {data:profile,error:profileError}=await supabase.from('users').select('subscription_active,subscription_tier').eq('id',user.id).maybeSingle()
    if(profileError)throw profileError
    allowed=Boolean(profile?.subscription_active)&&String(profile?.subscription_tier||'free')!=='free'
   }

   if(!allowed&&user){
    const now=new Date().toISOString()
    const {data:ent,error:entError}=await supabase.from('media_entitlements').select('id,expires_at,revoked_at').eq('user_id',user.id).eq('media_id',item.id).is('revoked_at',null).limit(20)
    if(entError)throw entError
    allowed=(ent||[]).some(e=>!e.expires_at||e.expires_at>now)
   }

   if(!allowed)return res.status(user?403:401).json({error:'Entitlement required',access})
   let url=item.external_stream_url||null
   let expiresInSeconds=null
   if(item.storage_bucket&&item.storage_path){
    const {data:signed,error:signError}=await supabase.storage.from(item.storage_bucket).createSignedUrl(item.storage_path,900)
    if(signError)throw signError
    url=signed?.signedUrl||null
    expiresInSeconds=900
   }
   if(!url)return res.status(409).json({error:'Media is published but no playable source is configured'})
   res.setHeader('Cache-Control','no-store')
   res.json({media:{id:item.id,title:item.title,kind:item.media_kind,poster:item.poster_url,captions:item.captions_url,rating:item.rating,metadata:item.metadata},playback:{url,expiresInSeconds},access:{type:access,allowed:true}})
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
