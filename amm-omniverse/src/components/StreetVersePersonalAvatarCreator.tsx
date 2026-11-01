import {Suspense,lazy,useState} from 'react';
const StreetVersePersonalAvatarPreview=lazy(()=>import('./StreetVersePersonalAvatarPreview'));
import {createPersonalAvatar,validatePersonalAvatar,avatarDescription,type AvatarPresentation,type AvatarHair,type AvatarOutfit} from '../game/creator/StreetVersePersonalAvatar';
const key='streetverse:personal-avatar:demo-v1';
function initial(){try{const raw=localStorage.getItem(key);if(raw)return validatePersonalAvatar(JSON.parse(raw))}catch{/* demo */}return createPersonalAvatar('local-player','My StreetVerse Character')}
export default function StreetVersePersonalAvatarCreator(){
 const [avatar,setAvatar]=useState(initial);
 const [saved,setSaved]=useState(false);
 const update=(patch:Partial<typeof avatar>)=>{setAvatar(p=>validatePersonalAvatar({...p,...patch}));setSaved(false)};
 const field=(label:string,value:string,onChange:(s:string)=>void)=><label style={{display:'grid',gap:5}}>{label}<input value={value} onChange={e=>onChange(e.target.value)} style={{padding:12,minHeight:44}}/></label>;
 return <section aria-label="StreetVerse personal character creator" style={{padding:16,maxWidth:600,margin:'auto',display:'grid',gap:12}}>
 <h2>Create your StreetVerse character</h2>
 <p>This saves a local character profile. A realistic 3D face, body and clothing still require a compatible rigged GLB and rendering pipeline.</p>
 {field('Character name',avatar.displayName,v=>update({displayName:v}))}
 <label>Presentation<select value={avatar.presentation} onChange={e=>update({presentation:e.target.value as AvatarPresentation})}>{['masculine','feminine','androgynous'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Hair style<select value={avatar.hair} onChange={e=>update({hair:e.target.value as AvatarHair})}>{['short','natural-curls','braids','locs','long','bald'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Outfit<select value={avatar.outfit} onChange={e=>update({outfit:e.target.value as AvatarOutfit})}>{['streetwear','business','athletic','formal'].map(x=><option key={x}>{x}</option>)}</select></label>
 <label>Height (cm)<input type="number" min={120} max={215} value={avatar.heightCm} onChange={e=>update({heightCm:Number(e.target.value)})}/></label>
 {(['skinTone','hairColor','eyeColor','outfitPrimary','outfitAccent'] as const).map(k=><label key={k}>{k}<input type="color" value={avatar[k]} onChange={e=>update({[k]:e.target.value})}/></label>)}
 <label><input type="checkbox" checked={avatar.accessibility.oneHandControls} onChange={e=>update({accessibility:{...avatar.accessibility,oneHandControls:e.target.checked}})}/> One-hand controls</label>
 <label><input type="checkbox" checked={avatar.accessibility.captions} onChange={e=>update({accessibility:{...avatar.accessibility,captions:e.target.checked}})}/> Captions</label>
 <button style={{minHeight:52}} onClick={()=>{try{localStorage.setItem(key,JSON.stringify(avatar));setSaved(true)}catch{setSaved(false)}}}>Save character profile on this device</button>
 <p role="status">{saved?'Saved locally. Not yet synchronized with your account.':avatarDescription(avatar)}</p>
 <Suspense fallback={<p>Loading 3D preview…</p>}><StreetVersePersonalAvatarPreview modelUrl={avatar.approvedModelPath}/></Suspense>
 </section>;
}
