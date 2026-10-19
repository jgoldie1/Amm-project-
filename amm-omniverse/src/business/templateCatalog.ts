export const TEMPLATE_CATALOG=[
 {id:'01',name:'Beautyverse',audience:'Beauty, hair, nails & salon',headline:'Your next look starts here.'},
 {id:'02',name:'Stubbs Mobility',audience:'Mobility services & transport',headline:'Move forward with confidence.'},
 {id:'03',name:'OmniCare 360',audience:'Care navigation & wellness information',headline:'Find the support you need.'},
 {id:'04',name:'Barber & Loctician',audience:'Barbers, loc care & appointments',headline:'Your style. Your appointment.'},
 {id:'05',name:'Food & Catering',audience:'Meal prep, catering & local food',headline:'Made with care. Ready for you.'},
 {id:'06',name:'Faith & Community',audience:'Ministries & community organizations',headline:'Connect. Serve. Grow together.'},
 {id:'07',name:'Security Services',audience:'Security service inquiries & training',headline:'Professional service. Clear communication.'},
 {id:'08',name:'Music & Creator',audience:'Artists, studios & independent labels',headline:'Your sound. Your story.'},
 {id:'09',name:'Local Professional',audience:'Consultants & professional services',headline:'Make your next step a clear one.'},
 {id:'10',name:'Marketplace Seller',audience:'Product collections & small retailers',headline:'Discover something made for you.'},
] as const
export const WEBSITE_PACKAGES=[
 {id:'template',name:'DIY template',price:49,description:'One business, responsive starter page and editable content. Hosting and domain separate.'},
 {id:'launch',name:'Assisted launch',price:149,description:'Starter page, supplied content setup, one revision and domain connection. Hosting and domain separate.'},
 {id:'commerce',name:'Commerce setup',price:299,description:'Up to 10 supplied products and checkout setup after provider verification. Hosting, domain and transaction fees separate.'},
] as const
export const AI_PACKAGES=[
 {id:'none',name:'No AI add-on',monthly:0,description:'Website only.'},
 {id:'starter',name:'Stubbs AI Starter',monthly:19,description:'Proposed: 200 short text replies/month, one business FAQ. No video, voice or medical advice.'},
 {id:'growth',name:'Stubbs AI Growth',monthly:49,description:'Proposed: 800 short text replies/month, FAQ and lead-question flows. No video or voice.'},
] as const
export type WebsiteDetails={name:string;headline:string;description:string;email:string;phone:string;location:string;services:string;color:string;photo:string}
export function escapeHtml(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
export function generateWebsite(d:WebsiteDetails){
 const e=escapeHtml,color=/^#[0-9a-f]{6}$/i.test(d.color)?d.color:'#174a39'
 const photo=/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(d.photo)?`<img alt="${e(d.name)}" src="${d.photo}">`:''
 const email=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(d.email)?`<a href="mailto:${e(d.email)}">Email us</a>`:''
 const phone=d.phone.replace(/[^+0-9]/g,'')
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(d.name)}</title><style>*{box-sizing:border-box}body{margin:0;font:18px/1.6 system-ui,sans-serif;color:#17352f;background:#fafaf5}header,main,footer{max-width:1000px;margin:auto;padding:24px}header{font-weight:800;color:${color}}.hero{padding:40px 0}h1{font-size:clamp(32px,7vw,64px);line-height:1.1}img{max-width:100%;max-height:400px;object-fit:cover;border-radius:20px}a{display:inline-block;padding:12px 18px;background:${color};color:#fff;border-radius:8px;margin:8px}section{padding:24px 0;border-top:1px solid #ddd}.draft{background:#fff1ce;padding:12px;font-size:14px}</style></head><body><div class="draft">Preview draft — contact details and services supplied by the business. Booking, checkout and AI are not activated.</div><header>${e(d.name)}</header><main><div class="hero"><h1>${e(d.headline)}</h1><p>${e(d.description)}</p>${photo}</div><section><h2>Our services</h2><ul>${d.services.split('\n').filter(Boolean).map(s=>`<li>${e(s)}</li>`).join('')}</ul></section><section><h2>Get in touch</h2><p>${e(d.location)}</p>${email}${phone?`<a href="tel:${e(phone)}">Call us</a>`:''}</section></main><footer>${e(d.name)} · Website draft created with TRYAMM</footer></body></html>`
}
