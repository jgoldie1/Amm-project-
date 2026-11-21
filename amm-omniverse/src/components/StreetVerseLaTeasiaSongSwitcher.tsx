import {useEffect,useRef,useState} from 'react'

type SongId='my-chains'|'whos-your-daddy'
const SONGS:ReadonlyArray<{id:SongId;title:string;url:string}>=[
 {id:'my-chains',title:'My Chains',url:import.meta.env.VITE_LATEASIA_MY_CHAINS_AUDIO_URL||''},
 {id:'whos-your-daddy',title:"Who's Your Daddy",url:import.meta.env.VITE_LATEASIA_WHOS_YOUR_DADDY_AUDIO_URL||''}
]
const button={minHeight:48,borderRadius:10,padding:'9px 12px',fontWeight:800,fontSize:14,cursor:'pointer'} as const

/** Explicit, user-initiated song playback only. No audio is generated or fabricated. */
export default function StreetVerseLaTeasiaSongSwitcher(){
 const [selected,setSelected]=useState<SongId>('my-chains')
 const [playing,setPlaying]=useState(false)
 const [status,setStatus]=useState('Choose a song. Audio must be connected before playback.')
 const audio=useRef<HTMLAudioElement|null>(null)
 const song=SONGS.find(item=>item.id===selected)!
 useEffect(()=>()=>{audio.current?.pause();audio.current=null},[])
 const select=(id:SongId)=>{
  audio.current?.pause();audio.current=null;setPlaying(false);setSelected(id)
  const next=SONGS.find(item=>item.id===id)!
  setStatus(next.url?'Ready: '+next.title:'Audio not connected for '+next.title)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-lateasia-song-selected',{detail:{songId:id,title:next.title}}))
 }
 const stop=()=>{audio.current?.pause();audio.current=null;setPlaying(false);setStatus('Stopped')}
 const play=async()=>{
  if(!song.url){setStatus('Audio not connected: '+song.title);return}
  if(!song.url.startsWith('/')&&!/^https:\/\//.test(song.url)){setStatus('Invalid audio URL');return}
  stop()
  const element=new Audio(song.url);audio.current=element
  element.onended=()=>{setPlaying(false);setStatus('Song ended')}
  element.onerror=()=>{setPlaying(false);setStatus('Audio failed to load')}
  try{await element.play();setPlaying(true);setStatus('Playing '+song.title)}
  catch{setPlaying(false);setStatus('Playback unavailable. Check the audio file or browser permission.')}
 }
 return <section aria-label="LaTeasia Monroe song switcher" style={{position:'absolute',right:12,top:80,zIndex:32,width:'min(270px,60vw)',padding:12,borderRadius:12,background:'rgba(8,21,37,.96)',border:'1px solid #92eaff',color:'white'}}>
  <strong>🎤 LaTeasia Monroe • Songs</strong>
  <div style={{display:'grid',gap:7,marginTop:9}}>
   {SONGS.map(item=><button type="button" key={item.id} aria-pressed={selected===item.id} onClick={()=>select(item.id)} style={{...button,border:selected===item.id?'3px solid #f7cb68':'1px solid #8cdfff'}}>{item.title}</button>)}
   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
    <button type="button" onClick={()=>{void play()}} style={button}>▶ PLAY</button>
    <button type="button" onClick={stop} style={button}>■ STOP</button>
   </div>
  </div>
  <div role="status" aria-live="polite" style={{fontSize:12,marginTop:8}}>{status}{playing?' ♪':''}</div>
 </section>
}
