'use strict'
// Server-authoritative *ephemeral* co-op positions for FaithVerse.
// Disabled by default and requires existing authenticated Socket.IO user.
// No chat, PHI, account access, inventory mutation, payments, AI prompts or permanent rewards.
const MAX_PEERS=6
const ROOMS=new Set(['galilee-study','faithverse-water-walk'])
const ROLES=new Set(['witness','guide','fisher','student','performer'])
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n))
const validPoint=(data)=>Number.isFinite(data?.x)&&Number.isFinite(data?.z)&&Math.abs(data.x)<=25&&Math.abs(data.z)<=25
function canJoin({enabled,user,roomId,role}){
 if(!enabled)return{ok:false,code:'REALTIME_NOT_ENABLED'}
 if(!user?.id||typeof user.id!=='string')return{ok:false,code:'ACCOUNT_REQUIRED'}
 if(!ROOMS.has(roomId)||!ROLES.has(role))return{ok:false,code:'INVALID_ROOM_OR_ROLE'}
 return{ok:true}
}
function registerFaithVerseRealtime(io,options={}){
 const roomState=new Map(),now=options.now||(()=>Date.now())
 const enabled=()=>options.enabled===true||process.env.FAITHVERSE_REALTIME_ENABLED==='true'&&process.env.FAITHVERSE_AGE_POLICY_REVIEWED==='true'
 const namespace=io.of('/faithverse')
 namespace.use((socket,next)=>{
  const user=options.authenticate?.(socket)
  if(!user?.id)return next(new Error('faithverse authentication required'))
  socket.data.playerIdentity=String(user.id);next()
 })
 namespace.on('connection',socket=>{
  socket.on('faithverse:join',(body={},reply=()=>{})=>{
   const roomId=String(body.roomId||''),role=String(body.role||'witness')
   const gate=canJoin({enabled:enabled(),user:{id:socket.data.playerIdentity},roomId,role})
   if(!gate.ok)return reply(gate)
   let room=roomState.get(roomId)
   if(!room){room=new Map();roomState.set(roomId,room)}
   if(!room.has(socket.id)&&room.size>=MAX_PEERS)return reply({ok:false,code:'ROOM_FULL'})
   if(socket.data.faithverseRoom&&socket.data.faithverseRoom!==roomId){const prev=roomState.get(socket.data.faithverseRoom);prev?.delete(socket.id);socket.leave('faithverse:'+socket.data.faithverseRoom)}
   socket.data.faithverseRoom=roomId;socket.data.lastFaithverseMotion=0
   room.set(socket.id,{id:socket.id,role,x:0,z:0,lastSeen:now(),isAI:false})
   socket.join('faithverse:'+roomId)
   namespace.to('faithverse:'+roomId).emit('faithverse:presence',{roomId,players:[...room.values()].map(x=>({id:x.id,role:x.role,x:x.x,z:x.z,isAI:false}))})
   reply({ok:true,roomId,capacity:MAX_PEERS,sync:'ephemeral-single-server',serverPersistence:false,voiceConnected:false})
  })
  socket.on('faithverse:move',(body={},reply=()=>{})=>{
   const id=socket.data.faithverseRoom,room=roomState.get(id)
   if(!id||!room?.has(socket.id))return reply({ok:false,code:'NOT_IN_ROOM'})
   if(!validPoint(body))return reply({ok:false,code:'INVALID_POSITION'})
   const t=now();if(t-socket.data.lastFaithverseMotion<125)return reply({ok:false,code:'RATE_LIMITED'})
   socket.data.lastFaithverseMotion=t
   const player=room.get(socket.id),x=clamp(body.x,-25,25),z=clamp(body.z,-25,25)
   // Basic speed limit: prevent a client from teleporting an arbitrary distance.
   const dt=clamp((t-player.lastSeen)/1000,.125,2)
   if(Math.hypot(x-player.x,z-player.z)>dt*8+.3)return reply({ok:false,code:'MOVE_TOO_FAST'})
   Object.assign(player,{x,z,lastSeen:t})
   namespace.to('faithverse:'+id).emit('faithverse:presence',{roomId:id,players:[...room.values()].map(p=>({id:p.id,role:p.role,x:p.x,z:p.z,isAI:false}))})
   reply({ok:true,serverTime:t})
  })
  socket.on('disconnect',()=>{
   const id=socket.data.faithverseRoom,room=roomState.get(id)
   if(!room)return
   room.delete(socket.id)
   if(!room.size){roomState.delete(id);return}
   namespace.to('faithverse:'+id).emit('faithverse:presence',{roomId:id,players:[...room.values()].map(p=>({id:p.id,role:p.role,x:p.x,z:p.z,isAI:false}))})
  })
 })
 return{roomState,namespace,enabled}
}
module.exports={MAX_PEERS,ROOMS,ROLES,canJoin,registerFaithVerseRealtime}
