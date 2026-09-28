const {Server}=require('socket.io')
const {createClient}=require('@supabase/supabase-js')
const http=require('http')

const port=Number(process.env.PORT||3000)
const allowed=(process.env.ALLOWED_ORIGINS||'').split(',').map(v=>v.trim()).filter(Boolean)
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_KEY,{auth:{persistSession:false}})
const httpServer=http.createServer()
const io=new Server(httpServer,{cors:{origin:allowed.length?allowed:false,credentials:true}})

io.use(async(socket,next)=>{
 try{
  const token=socket.handshake.auth?.token;if(!token)return next(new Error('unauthorized'))
  const {data,error}=await supabase.auth.getUser(token);if(error||!data.user)return next(new Error('unauthorized'))
  socket.data.userId=data.user.id;next()
 }catch{next(new Error('unauthorized'))}
})

io.on('connection',socket=>{
 socket.on('join_room',roomId=>{if(typeof roomId==='string'&&/^[a-zA-Z0-9:_-]{1,80}$/.test(roomId))socket.join(roomId)})
 socket.on('intent_tip',async(payload={},ack=()=>{})=>{
  const playerId=socket.data.userId,npcId=String(payload.npcId||''),roomId=String(payload.roomId||''),intentId=String(payload.intentId||''),amount=Number(payload.amount)
  if(!npcId||!roomId||!intentId||!Number.isSafeInteger(amount)||amount<=0||amount>100000)return ack({success:false,error:'invalid-tip'})
  if(!socket.rooms.has(roomId))return ack({success:false,error:'not-in-room'})
  // Record intent only. Existing TRYAMM server-authoritative wallet/ledger service must settle it atomically.
  const {error}=await supabase.from('streetverse_tip_intents').upsert({id:intentId,player_id:playerId,npc_id:npcId,amount,room_id:roomId,status:'pending'},{onConflict:'id',ignoreDuplicates:true})
  if(error)return ack({success:false,error:'tip-intent-failed'})
  io.to(roomId).emit('sync_npc_event',{npcId,animation:'acknowledge_tip',tipperId:playerId,intentId,pending:true})
  ack({success:true,pending:true,intentId})
 })
})
httpServer.listen(port,()=>console.log('StreetVerse realtime server listening on '+port))
