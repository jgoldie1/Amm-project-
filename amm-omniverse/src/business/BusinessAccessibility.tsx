import {useEffect,useState} from 'react'
const KEY='tryamm-business-access-v1'
type Preferences={large:boolean;contrast:boolean;motion:boolean;spacing:boolean;simple:boolean}
const DEFAULT:Preferences={large:false,contrast:false,motion:false,spacing:false,simple:false}
function load():Preferences{try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');return Object.fromEntries(Object.keys(DEFAULT).map(k=>[k,saved[k]===true])) as Preferences}catch{return DEFAULT}}
export default function BusinessAccessibility(){
 const [prefs,setPrefs]=useState(load),[text,setText]=useState(''),[notice,setNotice]=useState('')
 const [speechAvailable,setSpeechAvailable]=useState(false)
 useEffect(()=>{setSpeechAvailable('speechSynthesis'in window);return()=>{window.speechSynthesis?.cancel()}},[])
 useEffect(()=>{for(const [key,value]of Object.entries(prefs))document.documentElement.classList.toggle('business-'+key,value);try{localStorage.setItem(KEY,JSON.stringify(prefs))}catch{}},[prefs])
 function speak(value:string){if(!speechAvailable)return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(value.slice(0,12000));utterance.lang='en';utterance.onerror=()=>setNotice('Speech could not play. Your device may need an installed voice.');window.speechSynthesis.speak(utterance)}
 return <details className="access-panel"><summary>Language & accessibility assistance</summary><p>Choose what helps you. Settings stay on this browser. No diagnosis or disability information is requested.</p><div className="access-options">
 {([['large','Larger text'],['contrast','High contrast'],['motion','Reduced motion'],['spacing','More reading space'],['simple','Simpler page — hide beta diagnostics']] as const).map(([key,label])=><label key={key}><input type="checkbox" checked={prefs[key]} onChange={e=>setPrefs(old=>({...old,[key]:e.target.checked}))}/>{label}</label>)}</div>
 <button disabled={!speechAvailable} onClick={()=>speak(document.querySelector('main')?.innerText||'')}>Read page aloud</button><button disabled={!speechAvailable} onClick={()=>window.speechSynthesis.cancel()}>Stop reading</button><button onClick={()=>setPrefs({...DEFAULT})}>Reset display settings</button>
 <label>Type a message to speak<textarea maxLength={2000} value={text} onChange={e=>setText(e.target.value)}/></label><button disabled={!speechAvailable||!text.trim()} onClick={()=>speak(text)}>Speak my message</button>
 <p role="status">{notice||(!speechAvailable?'Read-aloud is unavailable in this browser. Text remains available.':'Speech depends on your browser and installed device voices.')}</p>
 <p>Keyboard, screen-reader and switch users can use standard controls and visible focus. No drag-only actions or timed forms are required. Website language and translation controls are in the template builder below. Sign-language interpretation and live captions are not included in this beta.</p></details>
}
