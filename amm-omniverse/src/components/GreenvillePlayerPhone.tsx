import {useEffect,useRef,useState} from 'react'
import {getAccessToken,getSupabaseClient} from '../services/supabaseClient'
import {createPlayerPhone,type PhoneSignal} from '../runtime/GreenvillePlayerCall'
import {nextUnionLeg} from '../runtime/GreenvilleUnionRoute'

const btn={minHeight:46,margin:2,borderRadius:8,background:'#114059',color:'white',border:'1px solid #70d5e9'}
export default function GreenvillePlayerPhone({expanded,onRing}:{expanded:boolean;onRing:()=>void}){
  const [available,setAvailable]=useState(false)
  const [notice,setNotice]=useState(''),[phase,setPhase]=useState('idle')
  const [players,setPlayers]=useState<string[]>([]),[own,setOwn]=useState('')
  const [route,setRoute]=useState(''),[pin,setPin]=useState(false)
  const [audioBlocked,setAudioBlocked]=useState(false)
  const ring=useRef(onRing)
  useEffect(()=>{ring.current=onRing},[onRing])
  const leg=useRef(-1),audio=useRef<HTMLAudioElement>(null)
  const controller=useRef<ReturnType<typeof createPlayerPhone>|null>(null)
  useEffect(()=>{
    const position=(e:Event)=>{
      const {x,z,source,driveYaw}=(e as CustomEvent).detail
      if(leg.current<0||source||!Number.isFinite(x)||!Number.isFinite(z))return
      const next=nextUnionLeg(x,z,leg.current,driveYaw)
      leg.current=next.leg;setRoute(next.text)
    }
    window.addEventListener('tryamm:streetverse-player-position',position)
    return ()=>window.removeEventListener('tryamm:streetverse-player-position',position)
  },[])
  useEffect(()=>{
    if(!available)return
    const db=getSupabaseClient()
    if(!db){setNotice('Sign in to the connected game first');setAvailable(false);return}
    let disposed=false
    let roster:ReturnType<typeof db.channel>|undefined,inbox:typeof roster
    const changeUser=db.auth.onAuthStateChange((_event,session)=>{
      if(!session||session.user.id!==uid && uid){controller.current?.end();setAvailable(false)}
    })
    let uid=''
    async function connect(){
      const {data,error}=await db!.auth.getUser()
      if(disposed)return
      if(error||!data.user)throw Error('Sign in before taking calls')
      uid=data.user.id;setOwn(uid.slice(0,8))
      const token=await getAccessToken()
      const base=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'')
      const response=await fetch(base+'/api/holofon/ice',{headers:{Authorization:'Bearer '+token},cache:'no-store'})
      if(!response.ok)throw Error('Call network configuration unavailable')
      const {iceServers:servers}=await response.json() as {iceServers:RTCIceServer[]}
      if(disposed)return
      const phone=createPlayerPhone({
        iceServers:servers,
        send:async(peer,id,kind,body)=>{
          const {error}=await db!.rpc('greenville_phone_signal',{recipient:peer,call_id:id,kind,body})
          if(error)throw error
        },
        state:(status,message)=>{if(!disposed){setPhase(status);setNotice(message);if(status==='incoming')ring.current()}},
        audio:stream=>{
          const player=audio.current
          if(!player)return
          player.srcObject=stream;setAudioBlocked(false)
          if(stream)void player.play().catch(()=>setAudioBlocked(true))
        },
        pin:()=>setPin(true),
      })
      controller.current=phone
      inbox=db!.channel('gv-phone:'+uid,{config:{private:true}})
      const failed=()=>{if(!disposed){setNotice('Phone disconnected. Enable calls to retry.');setAvailable(false)}}
      inbox.on('broadcast',{event:'signal'},e=>{if(!disposed)void phone.receive(e.payload as PhoneSignal)})
      inbox.subscribe(status=>{
        if(disposed)return
        if(status==='CHANNEL_ERROR'||status==='TIMED_OUT'||status==='CLOSED'){failed();return}
        if(status!=='SUBSCRIBED'||roster)return
        roster=db!.channel('gv-phone-directory',{config:{presence:{key:uid}}})
        roster.on('presence',{event:'sync'},()=>{
          if(!disposed)setPlayers(Object.keys(roster!.presenceState()).filter(id=>id!==uid&&/^[0-9a-f-]{36}$/i.test(id)))
        }).subscribe(async state=>{
          if(disposed)return
          if(state==='SUBSCRIBED'){
            if(await roster!.track({online:true})!=='ok'){failed();return}
            if(!disposed)setNotice('Ready for calls')
          }else if(state==='CHANNEL_ERROR'||state==='TIMED_OUT'||state==='CLOSED')failed()
        })
      })
    }
    void connect().catch(err=>{if(!disposed){setNotice(err.message);setAvailable(false)}})
    return ()=>{
      disposed=true;changeUser.data.subscription.unsubscribe()
      controller.current?.end();controller.current=null
      if(inbox)void db.removeChannel(inbox)
      if(roster)void db.removeChannel(roster)
      setPlayers([]);setPhase('idle');setPin(false)
    }
  },[available])
  return <div style={{background:expanded?undefined:'#103044',borderRadius:8,maxWidth:260}}><audio ref={audio} autoPlay/>
    {expanded&&<button style={btn} onClick={()=>{setNotice('');setAvailable(!available)}}>{available?'Go offline':'Enable player calls'}</button>}
    {(expanded||phase==='incoming')&&notice&&<div role="status">{notice}</div>}
    {expanded&&available&&phase==='idle'&&<div>Your player ID · {own}
      {players.length===0&&<div>Waiting for another Greenville player to enable calls</div>}
      {players.map(id=><button key={id} style={btn} onClick={()=>void controller.current?.dial(id)}>Call player {id.slice(0,8)}</button>)}
    </div>}
    {phase==='incoming'&&<button style={btn} onClick={()=>void controller.current?.accept()}>Answer player</button>}
    {phase!=='idle'&&<button style={btn} onClick={()=>controller.current?.end()}>{phase==='incoming'?'Decline':'Hang up'}</button>}
    {audioBlocked&&<button style={btn} onClick={()=>void audio.current?.play().then(()=>setAudioBlocked(false)).catch(()=>setNotice('Allow audio playback and retry'))}>Hear player</button>}
    {expanded&&phase==='connected'&&<button style={btn} onClick={()=>void controller.current?.share()}>Share Student Union pin</button>}
    {pin&&<button style={btn} onClick={()=>{setPin(false);leg.current=0;setRoute('Finding campus route…')}}>Follow Student Union pin</button>}
    {route&&<div>{route} <button style={btn} aria-label="Close directions" onClick={()=>{leg.current=-1;setRoute('')}}>×</button></div>}
  </div>
}
