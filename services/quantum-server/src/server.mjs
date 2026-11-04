import {createServer as createHttpServer} from 'node:http'
import {randomInt,randomUUID,timingSafeEqual} from 'node:crypto'

const MAX_BODY_BYTES=16_384
const MAX_ROOMS=50
const ROOM_TTL_MS=2*60*60*1000
const MAX_CUES=100
const MAX_SHOTS=2048
const SQRT_HALF=Math.SQRT1_2

const send=(res,status,payload)=>{
  res.writeHead(status,{
    'content-type':'application/json; charset=utf-8',
    'cache-control':'no-store',
    'x-content-type-options':'nosniff',
    'referrer-policy':'no-referrer'
  })
  res.end(JSON.stringify(payload))
}
const int=(value,min,max)=>Number.isInteger(value)&&value>=min&&value<=max

function error(message,status=400){
  const e=new Error(message)
  e.status=status
  return e
}
async function readBody(req){
  const type=String(req.headers['content-type']||'').split(';')[0].trim().toLowerCase()
  if(type!=='application/json')throw error('content_type_must_be_application_json',415)
  let size=0
  const chunks=[]
  for await(const chunk of req){
    size+=chunk.length
    if(size>MAX_BODY_BYTES)throw error('request_too_large',413)
    chunks.push(chunk)
  }
  let body
  try{body=JSON.parse(Buffer.concat(chunks).toString('utf8'))}
  catch{throw error('invalid_json')}
  if(!body||typeof body!=='object'||Array.isArray(body))throw error('expected_json_object')
  return body
}
function isAuthorized(req,token){
  if(!token)return false
  const header=String(req.headers.authorization||'')
  if(!header.startsWith('Bearer '))return false
  const value=Buffer.from(header.slice(7))
  const expected=Buffer.from(token)
  return value.length===expected.length&&timingSafeEqual(value,expected)
}

/**
 * Small, real classical state-vector *simulation* of a quantum circuit.
 * No physical qubits, quantum RNG, quantum network, or hardware acceleration.
 * Qubit 0 is the rightmost (least-significant) bit of a displayed state.
 */
export function simulateCircuit({qubits,gates,shots=128}){
  if(!int(qubits,1,4))throw error('qubits_must_be_1_to_4')
  if(!Array.isArray(gates)||gates.length>48)throw error('gates_must_be_array_max_48')
  if(!int(shots,1,MAX_SHOTS))throw error('shots_must_be_1_to_2048')
  const width=1<<qubits
  const real=new Float64Array(width)
  const imag=new Float64Array(width)
  real[0]=1

  for(const gate of gates){
    if(!gate||typeof gate!=='object'||Array.isArray(gate))throw error('invalid_gate')
    const type=gate.type
    if(!['H','X','Z','S','T','CX'].includes(type))throw error('unsupported_gate')
    if(!int(gate.target,0,qubits-1))throw error('invalid_target')
    const bit=1<<gate.target
    if(type==='CX'&&(!int(gate.control,0,qubits-1)||gate.control===gate.target)){
      throw error('invalid_control')
    }
    const controlBit=type==='CX'?1<<gate.control:0
    for(let i=0;i<width;i++){
      if(type==='H'&&!(i&bit)){
        const j=i|bit
        const ar=real[i],ai=imag[i],br=real[j],bi=imag[j]
        real[i]=(ar+br)*SQRT_HALF;imag[i]=(ai+bi)*SQRT_HALF
        real[j]=(ar-br)*SQRT_HALF;imag[j]=(ai-bi)*SQRT_HALF
      }else if((type==='X'||type==='CX')&&!(i&bit)&&
        (type==='X'||Boolean(i&controlBit))){
        const j=i|bit
        const r=real[i],im=imag[i]
        real[i]=real[j];imag[i]=imag[j]
        real[j]=r;imag[j]=im
      }else if((i&bit)&&type==='Z'){
        real[i]=-real[i];imag[i]=-imag[i]
      }else if((i&bit)&&type==='S'){
        const r=real[i]
        real[i]=-imag[i];imag[i]=r
      }else if((i&bit)&&type==='T'){
        const r=real[i],im=imag[i]
        real[i]=(r-im)*SQRT_HALF
        imag[i]=(r+im)*SQRT_HALF
      }
    }
  }
  const raw=Array.from(real,(r,i)=>r*r+imag[i]*imag[i])
  const sum=raw.reduce((a,b)=>a+b,0)
  const normalized=raw.map(p=>p/sum)
  const counts=new Array(width).fill(0)
  for(let shot=0;shot<shots;shot++){
    const sample=randomInt(0,2**32)/2**32
    let cumulative=0,index=width-1
    for(let i=0;i<width;i++){
      cumulative+=normalized[i]
      if(sample<cumulative){index=i;break}
    }
    counts[index]++
  }
  return {
    backend:'classical-statevector-simulator',
    physicalQuantumHardware:false,
    qubits,shots,
    results:normalized.map((p,i)=>({
      state:i.toString(2).padStart(qubits,'0'),
      probability:Number(p.toFixed(12)),
      counts:counts[i]
    }))
  }
}

/**
 * In-memory session coordinator for the Soul Ascension dance line.
 * Clock timestamps are authoritative only for this single server process.
 */
export function createApp({token=process.env.TRYAMM_QUANTUM_TOKEN||'',now=Date.now}={}){
  const rooms=new Map()
  const recentRequests=new Map()
  const prune=()=>{
    const time=now()
    for(const [id,room] of rooms)if(room.expiresAt<=time)rooms.delete(id)
    for(const [key,item] of recentRequests)if(item.resetAt<=time)recentRequests.delete(key)
  }

  const handler=async(req,res)=>{
    const time=now()
    const key=req.socket.remoteAddress||'unknown'
    const entry=recentRequests.get(key)
    if(!entry||entry.resetAt<=time){
      recentRequests.set(key,{count:1,resetAt:time+60_000})
    }else if(++entry.count>90){
      return send(res,429,{error:'rate_limit',retryAfterMs:entry.resetAt-time})
    }
    const pathname=new URL(req.url||'/', 'http://127.0.0.1').pathname
    if(req.method==='GET'&&pathname==='/healthz'){
      return send(res,200,{status:'ok',service:'tryamm-quantum-server',store:'ephemeral-memory',mode:'classical-simulation'})
    }
    if(req.method==='GET'&&pathname==='/v1/capabilities'){
      return send(res,200,{
        service:'tryamm-quantum-server',
        quantumMode:'classical-statevector-simulator',
        physicalQubits:0,
        maxSimulationQubits:4,
        maxShots:MAX_SHOTS,
        danceCueSync:'single-instance-server-clock',
        persistentStorage:false,
        realQuantumProviderConnected:false,
        liveStreamingConnected:false
      })
    }
    if(!token)return send(res,503,{error:'server_token_not_configured'})
    if(!isAuthorized(req,token))return send(res,401,{error:'unauthorized'})
    prune()
    try{
      if(req.method==='POST'&&pathname==='/v1/quantum/simulate'){
        return send(res,200,simulateCircuit(await readBody(req)))
      }
      if(req.method==='POST'&&pathname==='/v1/dance/rooms'){
        const body=await readBody(req)
        const name=String(body.name||'').trim()
        if(name.length<3||name.length>80)throw error('room_name_must_be_3_to_80_characters')
        if(rooms.size>=MAX_ROOMS)throw error('room_limit',429)
        const id=randomUUID()
        const room={id,name,sequence:0,createdAt:now(),expiresAt:now()+ROOM_TTL_MS,cues:[]}
        rooms.set(id,room)
        return send(res,201,{roomId:id,name,serverTime:now(),expiresAt:room.expiresAt})
      }
      const match=pathname.match(/^\/v1\/dance\/rooms\/([0-9a-f-]{36})(?:\/cues)?$/)
      if(match){
        const room=rooms.get(match[1])
        if(!room)return send(res,404,{error:'room_not_found_or_expired'})
        if(req.method==='GET'&&pathname.endsWith(match[1])){
          return send(res,200,{roomId:room.id,name:room.name,sequence:room.sequence,
            cues:room.cues,serverTime:now(),expiresAt:room.expiresAt})
        }
        if(req.method==='POST'&&pathname.endsWith('/cues')){
          const body=await readBody(req)
          if(typeof body.moveId!=='string'||!/^[a-z0-9][a-z0-9-]{2,79}$/.test(body.moveId)){
            throw error('invalid_move_id')
          }
          const delayMs=body.delayMs??1200
          if(!int(delayMs,0,30_000))throw error('invalid_delay_ms')
          if(room.cues.length>=MAX_CUES)throw error('room_cue_limit',429)
          const cue={sequence:++room.sequence,moveId:body.moveId,
            startAt:now()+Math.max(delayMs,250)}
          room.cues.push(cue)
          return send(res,201,{roomId:room.id,serverTime:now(),cue})
        }
      }
      return send(res,404,{error:'route_not_found'})
    }catch(e){
      return send(res,e.status||500,{error:e.status?e.message:'internal_error'})
    }
  }
  return createHttpServer((req,res)=>{void handler(req,res)})
}

if(process.argv[1]&&import.meta.url===new URL('file://'+process.argv[1]).href){
  const port=Number(process.env.PORT||8787)
  if(!Number.isInteger(port)||port<1||port>65535){
    process.stderr.write('PORT must be a valid TCP port\n')
    process.exitCode=1
  }else{
    const server=createApp()
    server.listen(port,'0.0.0.0',()=>console.log('TRYAMM Quantum Server listening on port '+port))
  }
}
