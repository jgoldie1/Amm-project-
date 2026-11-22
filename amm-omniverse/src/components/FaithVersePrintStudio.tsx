import {useState,type CSSProperties} from 'react'
type PrintKind='study-card'|'flyer'|'rpg-receipt'
const safe=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c))
const btn:CSSProperties={minHeight:56,padding:'12px 14px',fontSize:16,fontWeight:800,color:'#fff',background:'#19394b',border:'1px solid #a4c2cf',borderRadius:12,cursor:'pointer'}
export default function FaithVersePrintStudio(){
 const [kind,setKind]=useState<PrintKind>('study-card')
 const [title,setTitle]=useState('Bible Study · Sea of Galilee')
 const [citation,setCitation]=useState('Matthew 14:22–33')
 const [note,setNote]=useState('Explore scripture and original roleplay in TRYAMM FaithVerse.')
 const [notice,setNotice]=useState('Download a paper-ready document, then choose browser Print or Save as PDF.')
 const download=()=>{
  const heading=kind==='study-card'?'Bible Study Card':kind==='flyer'?'FaithVerse Flyer':'Local RPG Study Receipt'
  const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><title>'+safe(heading)+'</title><style>@page{size:letter;margin:.6in}body{font:18px/1.6 Georgia,serif;color:#182534}h1{font-size:30px}article{border:2px solid #263f54;border-radius:12px;padding:25px;min-height:3in}footer{font-size:11px;margin-top:25px}button{font-size:18px;min-height:54px}@media print{button{display:none}}</style></head><body><h1>TRYAMM · Kingdoms Press</h1><article><h2>'+safe(title)+'</h2><h3>'+safe(citation)+'</h3><p>'+safe(note)+'</p></article><footer>Original study draft, not a verified scripture translation, school certificate, paid receipt or publisher-approved edition. Verify content rights and print proof before distribution.</footer><button onclick="window.print()">Print / Save PDF</button></body></html>'
  const file=new Blob([html],{type:'text/html;charset=utf-8'}),url=URL.createObjectURL(file),link=document.createElement('a');link.href=url;link.download='FaithVerse_'+kind+'.html';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
  setNotice('Printable HTML file generated. Open it in Chrome, then Print / Save PDF.')
 }
 return <section aria-label="FaithVerse paper print studio" style={{display:'grid',gap:12,background:'#0e2231',border:'1px solid #7ca7b7',borderRadius:16,padding:16,color:'#fff'}}>
 <h2 style={{fontSize:23,margin:0}}>Kingdoms Press · 2D Printer Studio</h2><p style={{lineHeight:1.6,margin:0}}>Create Bible cards, event flyers or simulated RPG study receipts. Standard browser printing works without direct hardware access; a specific printer integration is not yet verified.</p>
 <label htmlFor="print-kind">Document type</label><select id="print-kind" style={btn} value={kind} onChange={e=>setKind(e.target.value as PrintKind)}><option value="study-card">Bible Study Card</option><option value="flyer">FaithVerse Event Flyer</option><option value="rpg-receipt">Local RPG Receipt</option></select>
 <label htmlFor="print-title">Title</label><input id="print-title" style={btn} value={title} onChange={e=>setTitle(e.target.value.slice(0,120))}/>
 <label htmlFor="print-ref">Scripture reference</label><input id="print-ref" style={btn} value={citation} onChange={e=>setCitation(e.target.value.slice(0,120))}/>
 <label htmlFor="print-note">Original text</label><textarea id="print-note" rows={3} style={{...btn,fontWeight:400}} value={note} onChange={e=>setNote(e.target.value.slice(0,600))}/>
 <button style={btn} onClick={download}>EXPORT PRINTABLE PAGE</button>
 <p role="status" aria-live="polite" style={{fontSize:13,lineHeight:1.6,margin:0}}>{notice}</p></section>
}
