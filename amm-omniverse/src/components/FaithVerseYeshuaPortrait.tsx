import {YESHUA_HIGH_PRIEST_ART_DIRECTION as design} from '../data/FaithVerseYeshuaCharacterDirection'

export default function FaithVerseYeshuaPortrait(){
 return <figure aria-label="Stylized artistic portrayal of Yeshua as a Black Hebrew high priest" style={{margin:'0 auto',width:'min(100%,310px)',display:'grid',gap:7,textAlign:'center'}}>
 <svg viewBox="0 0 320 330" width="100%" height="auto" role="img" aria-label="Original two-dimensional portrait: dark-brown-skinned Hebrew high priest figure wearing a royal blue and ivory ceremonial robe and a patterned breastpiece">
  <defs>
   <linearGradient id="faith-robes" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#faf1de"/><stop offset="1" stopColor="#d5be8d"/></linearGradient>
   <linearGradient id="faith-blue" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#244d92"/><stop offset="1" stopColor="#101f52"/></linearGradient>
   <radialGradient id="faith-glow"><stop stopColor="#bda875" stopOpacity=".45"/><stop offset="1" stopColor="#bda875" stopOpacity="0"/></radialGradient>
  </defs>
  <circle cx="160" cy="150" r="139" fill="url(#faith-glow)"/>
  <path d="M37 322 Q49 232 103 224 L126 197 L194 197 L217 224 Q270 236 283 322Z" fill="url(#faith-robes)" stroke="#dec693" strokeWidth="4"/>
  <path d="M44 321 Q54 258 107 227 L131 214 L122 322Z M276 321 Q264 256 211 227 L189 215 L199 322Z" fill="url(#faith-blue)" stroke="#e8ca74" strokeWidth="5"/>
  <path d="M137 197 L137 227 Q160 244 183 227 L183 197" fill="#613b2b"/>
  <ellipse cx="160" cy="132" rx="70" ry="87" fill="#6e402b" stroke="#48291e" strokeWidth="3"/>
  <path d="M92 112 Q80 54 113 47 Q124 28 150 32 Q182 15 204 39 Q240 47 231 107 L219 117 Q215 69 193 68 Q160 82 116 68 Q105 88 104 115Z" fill="#1c1719"/>
  {Array.from({length:14},(_,i)=>{const angle=Math.PI+(Math.PI*i/13);const x=160+65*Math.cos(angle),y=81+39*Math.sin(angle);return <circle key={i} cx={x} cy={y} r="10" fill="#21191a"/>})}
  <path d="M94 87 Q155 45 224 87 L216 111 Q161 91 102 111Z" fill="#e8d3aa" stroke="#c0a064" strokeWidth="4"/>
  <path d="M103 102 Q161 83 216 102" fill="none" stroke="#d1a655" strokeWidth="5"/>
  <path d="M120 126 Q136 120 151 127 M170 127 Q185 120 201 126" stroke="#231a19" strokeWidth="5" strokeLinecap="round" fill="none"/>
  <ellipse cx="136" cy="136" rx="7" ry="5" fill="#17191d"/><ellipse cx="184" cy="136" rx="7" ry="5" fill="#17191d"/>
  <path d="M160 135 L153 164 Q160 171 168 163" stroke="#48291e" strokeWidth="3" fill="none"/>
  <path d="M114 166 Q122 210 160 225 Q201 210 207 166 Q185 190 160 180 Q135 189 114 166Z" fill="#23191b"/>
  <path d="M139 182 Q160 190 181 182" fill="none" stroke="#905b45" strokeWidth="3" strokeLinecap="round"/>
  <path d="M124 229 Q159 249 195 229 L218 247 L201 318 L120 318 L101 247Z" fill="#1f366b" stroke="#e6c26c" strokeWidth="5"/>
  <path d="M128 245 L192 245 L202 313 L118 313Z" fill="#d6bb7a" stroke="#ffecac" strokeWidth="3"/>
  {['#8b305c','#2471a8','#6b3e96','#398d6c','#b65c32','#5a6db2','#4d915d','#bb8a37','#85509c','#3c8f9b','#8b4343','#41679b'].map((color,i)=><rect key={i} x={126+(i%3)*24} y={254+Math.floor(i/3)*15} width="19" height="12" rx="3" fill={color} stroke="#f9edc3" strokeWidth="1.6"/>)}
  <path d="M119 237 L95 320 M201 237 L225 320" fill="none" stroke="#c7a75b" strokeWidth="6"/>
 </svg>
 <figcaption style={{fontSize:13,lineHeight:1.5,color:'#f4e0b4'}}><strong>{design.displayName}</strong><span style={{display:'block',color:'#d3d9df'}}>Original stylized 2D concept, not a verified historical likeness or a production-ready humanoid GLB.</span></figcaption>
 </figure>
}
