import {useState,type CSSProperties} from 'react'
type Format='poster'|'flyer'|'bible-study'|'character-card'
const button:CSSProperties={minHeight:56,padding:'12px 14px',border:'1px solid #92bdca',borderRadius:12,background:'#193c50',color:'#fff',fontSize:16,fontWeight:800,cursor:'pointer'}
const SAFE_TITLE=/^[\p{L}\p{N}\s.,:;!?&'()\-]{1,90}$/u
function escapeXml(input:string){return input.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]||c))}
export default function TRYAMMPrintStudio(){
 const [title,setTitle]=useState('FaithVerse Bible Study')
 const [subtitle,setSubtitle]=useState('Explore • Learn • Read')
 const [format,setFormat]=useState<Format>('bible-study')
 const [notice,setNotice]=useState('Original printable artwork only. No printer device is connected by this screen.')
 const valid=SAFE_TITLE.test(title.trim())&&subtitle.length<=100
 const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1080" width="800" height="1080"><rect width="800" height="1080" fill="#112b42"/><rect x="30" y="30" width="740" height="1020" rx="18" fill="none" stroke="#c5a975" stroke-width="9"/><circle cx="400" cy="340" r="150" fill="#204e62" stroke="#d4bb8e" stroke-width="7"/><path d="M340 270 L340 410 L400 380 L460 410 L460 270 L400 300Z" fill="#eddfc3"/><text x="400" y="560" fill="#fff5da" font-family="Arial,sans-serif" font-weight="bold" font-size="43" text-anchor="middle">'+escapeXml(title.trim().slice(0,35))+'</text><text x="400" y="629" fill="#f0dba7" font-family="Arial,sans-serif" font-size="28" text-anchor="middle">'+escapeXml(subtitle.slice(0,46))+'</text><text x="400" y="975" fill="#bad8e0" font-family="Arial,sans-serif" font-size="23" text-anchor="middle">TRYAMM • '+escapeXml(format)+'</text></svg>'
 const download=()=>{
  if(!valid){setNotice('Please use a shorter title and subtitle without markup.');return}
  const blob=new Blob([svg],{type:'image/svg+xml'}),url=URL.createObjectURL(blob)
  const link=document.createElement('a');link.href=url;link.download='TRYAMM_'+format+'_print_original.svg';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),500)
  setNotice('Original SVG saved; use your device printer dialog or an authorized print shop. No hardware has been paired.')
 }
 return <section aria-label="TRYAMM 2D creator printing studio" style={{background:'#0e2638',padding:15,border:'1px solid #7394a3',borderRadius:16,color:'#fff',display:'grid',gap:11}}>
  <h2 style={{fontSize:22,margin:0}}>TRYAMM 2D Print Studio</h2>
  <p style={{lineHeight:1.5,margin:0}}>Create original posters, course handouts, creator cards and event flyers. First export an SVG or print through the device's normal printer dialog. A future printer model can be paired later; direct hardware control and print-on-demand ordering are not yet connected.</p>
  <label htmlFor="printer-title">Print title</label><input id="printer-title" value={title} onChange={e=>setTitle(e.target.value)} style={{...button,fontWeight:400}} maxLength={90}/>
  <label htmlFor="printer-subtitle">Subtitle</label><input id="printer-subtitle" value={subtitle} onChange={e=>setSubtitle(e.target.value)} style={{...button,fontWeight:400}} maxLength={100}/>
  <label htmlFor="printer-format">Print template</label><select id="printer-format" value={format} onChange={e=>setFormat(e.target.value as Format)} style={button}>{(['poster','flyer','bible-study','character-card'] as Format[]).map(s=><option key={s} value={s}>{s}</option>)}</select>
  <div style={{background:'#112b42',border:'1px solid #d4bb8e',borderRadius:13,padding:15,textAlign:'center'}}><p style={{color:'#f4e3bf',fontSize:20,fontWeight:800}}>{title}</p><p>{subtitle}</p><span style={{fontSize:12}}>Original print-preview layout · {format}</span></div>
  <button style={button} disabled={!valid} onClick={download}>EXPORT ORIGINAL SVG FOR 2D PRINT</button>
  <button style={button} disabled={!valid} onClick={()=>{setNotice('The browser print dialog will open. Confirm paper size, margins and printer before printing.');window.print()}}>OPEN BROWSER PRINTER DIALOG</button>
  <p role="status" aria-live="polite" style={{fontSize:13}}>{notice}</p>
  <p style={{fontSize:12,margin:0}}>Rights gate: no unlicensed artwork, character likeness, Bible translations or trademarks should be printed commercially without permission. File export does not establish a product order or printer connection.</p>
 </section>
}
