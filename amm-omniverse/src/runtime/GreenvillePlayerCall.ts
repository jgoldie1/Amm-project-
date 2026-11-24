export type SignalKind = 'ring'|'accept'|'offer'|'answer'|'end'|'pin'
export type PhoneSignal = {id:string;sender:string;kind:SignalKind;body:string}
type Phase = 'incoming'|'dialing'|'connecting'|'connected'
type Session = {id:string;peer:string;phase:Phase;pc?:RTCPeerConnection;stream?:MediaStream;timer?:ReturnType<typeof setTimeout>}
type PhoneIO = {
  send:(peer:string,id:string,kind:SignalKind,body:string)=>Promise<void>
  state:(phase:Phase|'idle',message:string)=>void
  audio:(stream:MediaStream|null)=>void
  pin:()=>void
  iceServers:RTCIceServer[]
}

export function createPlayerPhone(io:PhoneIO) {
  let current:Session|null=null
  const send=(s:Session,kind:SignalKind,body='')=>io.send(s.peer,s.id,kind,body)
  function end(message='Call ended',notify=true) {
    const s=current
    if (!s) return
    current=null
    clearTimeout(s.timer)
    s.pc?.close()
    s.stream?.getTracks().forEach(t=>t.stop())
    io.audio(null)
    io.state('idle',message)
    if (notify) void send(s,'end').catch(()=>{})
  }
  function start(peer:string,id:string,phase:Phase) {
    const s:Session={peer,id,phase}
    current=s
    s.timer=setTimeout(()=>end('Call timed out'),45000)
    io.state(phase,phase==='incoming'?'Incoming player call':'Calling player…')
    return s
  }
  async function publish(s:Session,kind:SignalKind,body='') {
    try { await send(s,kind,body) }
    catch { if(current===s) end('Call service unavailable',false) }
  }
  async function microphone(s:Session) {
    const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:false})
    if(current!==s){stream.getTracks().forEach(t=>t.stop());return}
    s.stream=stream
    const pc=new RTCPeerConnection({iceServers:io.iceServers})
    s.pc=pc
    stream.getAudioTracks().forEach(track=>pc.addTrack(track,stream))
    pc.ontrack=e=>{if(current===s)io.audio(new MediaStream([e.track]))}
    pc.onconnectionstatechange=()=>{
      if(current!==s)return
      if(pc.connectionState==='connected'){
        clearTimeout(s.timer);s.phase='connected';io.state('connected','Player call connected')
      } else if(pc.connectionState==='failed')end('Audio connection failed')
    }
    return pc
  }
  async function description(s:Session,pc:RTCPeerConnection,type:'offer'|'answer') {
    await pc.setLocalDescription(type==='offer'?await pc.createOffer():await pc.createAnswer())
    // Send one complete SDP, including gathered ICE candidates.
    if(pc.iceGatheringState!=='complete')await new Promise<void>(resolve=>{
      const done=()=>{clearTimeout(timer);pc.removeEventListener('icegatheringstatechange',changed);resolve()}
      const changed=()=>{if(pc.iceGatheringState==='complete')done()}
      const timer=setTimeout(done,5000)
      pc.addEventListener('icegatheringstatechange',changed)
    })
    if(current===s)await publish(s,type,pc.localDescription!.sdp)
  }
  return {
    async dial(peer:string) {
      if(current)return
      const s=start(peer,crypto.randomUUID(),'dialing')
      await publish(s,'ring')
    },
    async accept() {
      const s=current
      if(s?.phase!=='incoming')return
      s.phase='connecting';io.state('connecting','Connecting audio…')
      try{if(await microphone(s))await publish(s,'accept')}
      catch{if(current===s)end('Could not open microphone')}
    },
    async receive(m:PhoneSignal) {
      if(m.kind==='ring'){
        if(!current)start(m.sender,m.id,'incoming')
        else if(current.id!==m.id)await io.send(m.sender,m.id,'end','').catch(()=>{})
        return
      }
      const s=current
      if(!s||m.id!==s.id||m.sender!==s.peer)return
      try{
        if(m.kind==='end'){end('Player ended the call',false);return}
        if(m.kind==='pin'&&s.phase==='connected'){io.pin();return}
        if(m.kind==='accept'&&s.phase==='dialing'){
          s.phase='connecting';io.state('connecting','Connecting audio…')
          const pc=await microphone(s)
          if(pc)await description(s,pc,'offer')
        } else if(m.kind==='offer'&&s.pc&&s.phase==='connecting'&&s.pc.signalingState==='stable'){
          await s.pc.setRemoteDescription({type:'offer',sdp:m.body})
          await description(s,s.pc,'answer')
        } else if(m.kind==='answer'&&s.pc?.signalingState==='have-local-offer'){
          await s.pc.setRemoteDescription({type:'answer',sdp:m.body})
        }
      }catch{if(current===s)end('Audio setup failed. Check microphone and network.')}
    },
    share(){if(current?.phase==='connected')return publish(current,'pin')},
    end,
  }
}
