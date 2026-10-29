#!/usr/bin/env node
// TRYAMM Website OS: original, no-AI website-template generator.
// Preview only. Does not scrape, publish, bill or send any data.
import fs from 'node:fs';
import path from 'node:path';
const verticals=[
 ['beauty-salon','Beauty Salon','Book a consultation','Appointments','Hair, beauty and personal care'],
 ['barbershop','Barbershop','Request a chair appointment','Appointments','Cuts, fades and grooming'],
 ['logistics','Logistics','Request a freight quote','Freight quotes','Shipping, carrier and dispatch inquiries'],
 ['staffing','Staffing Agency','Request staffing help','Employer inquiries','Recruitment and placements'],
 ['music-studio','Music Studio','Request a recording session','Studio bookings','Recording, editing and mixing'],
 ['security-training','Security Training','Ask about a training course','Course inquiries','Training and security service information'],
 ['accessible-tech','Accessible Technology','Request a demonstration','Accessible demos','Technology and mobility accessibility'],
 ['church-ministry','Church and Ministry','Ask about upcoming events','Event inquiries','Teaching, events and community programs'],
 ['restaurant','Restaurant','Ask about catering','Catering inquiries','Menus, events and catering'],
 ['home-services','Home Services','Request a service quote','Service quotes','Repairs, upkeep and local service'],
 ['real-estate','Real Estate','Request property information','Property inquiries','Listings and home search'],
 ['fitness','Fitness','Request a class','Classes','Coaching, fitness and training'],
 ['education','Education','Request course information','Enrollment inquiries','Workshops, courses and student support'],
 ['nonprofit','Nonprofit','Ask about community programs','Program inquiries','Services, events and local resources'],
 ['medical-training','Medical Training','Request program information','Education inquiries','Training and professional development'],
 ['fashion','Fashion Brand','Ask about a collection','Product inquiries','Collections, apparel and custom designs'],
 ['auto-detailing','Auto Detailing','Request a detailing quote','Service quotes','Vehicle detailing and care'],
 ['construction','Construction','Request a project estimate','Project estimates','Residential and commercial services'],
 ['photography','Photography','Request a photo session','Photography bookings','Portraits, events and visual storytelling'],
 ['retail','Retail Shop','Ask about products','Product inquiries','Collections, stores and local shopping']
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9-]/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
function render(v){const [id,title,action,lead,description]=v;const name=title+' | TRYAMM template preview';
return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${esc(description+' website template preview for business owners.')}"><title>${esc(name)}</title><style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#0d1221;color:#f7f8ff;font:18px/1.5 system-ui,sans-serif}main{max-width:880px;margin:auto;padding:24px}header,footer{padding:16px 0}h1{font-size:clamp(2rem,6vw,4rem);line-height:1.12}h2{font-size:1.5rem}.tag{color:#b9e9df}.panel{padding:22px;border:1px solid #667990;border-radius:18px;background:#172337;margin:22px 0}a,button{min-height:48px;display:inline-flex;align-items:center;justify-content:center;color:#091622;background:#9af5dc;padding:10px 18px;border-radius:10px;font:inherit;font-weight:700;border:0;text-decoration:none}a:focus-visible{outline:4px solid #fcd67d;outline-offset:3px}.muted{color:#c5d4e8}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}small{color:#c5d4e8}</style></head><body><main><header><strong>TRYAMM Website OS</strong> · <span class="tag">${esc(title)} preview</span></header><section class="panel"><p class="tag">Your business, your customers</p><h1>${esc(title)} website</h1><p>${esc(description)}. An accessible starting design you can personalize with your own services, imagery and contact information.</p><a href="#contact">${esc(action)}</a></section><h2>Built for customer confidence</h2><div class="grid"><section class="panel"><h3>Explain your services</h3><p>Present verified offerings, prices and service boundaries.</p></section><section class="panel"><h3>Make contact easy</h3><p>Give visitors a clear way to request help and get a timely response.</p></section><section class="panel"><h3>Mobile and accessible</h3><p>Readable layout, large controls and keyboard navigation.</p></section></div><section id="contact" class="panel"><h2>${esc(lead)}</h2><p>This is a demonstration. Connect a customer-owned approved email or secure server form before publishing.</p><p class="muted">Contact destination not yet configured. No visitor information is collected.</p></section><footer><small>Original TRYAMM design preview · No AI subscription or checkout required · No live booking or payments enabled.</small></footer></main></body></html>`;}
if(import.meta.url===new URL('file://'+process.argv[1]).href){
const out=process.argv[2]||'preview-output';fs.mkdirSync(out,{recursive:true});
for(const v of verticals){const file=path.join(out,slug(v[0])+'.html');fs.writeFileSync(file,render(v));}
console.log('Generated '+verticals.length+' original, offline-ready HTML preview templates in '+out);
}
export {verticals,render};
