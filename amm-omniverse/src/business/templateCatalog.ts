import {WEBSITE_LANGUAGES,websiteLanguage,ACCESSIBLE_WEBSITE_CSS,websiteAccessibilityScript,type WebsiteLanguage} from './accessibleWebsite'
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
 {'id': '11', 'name': 'Cleaning & Home Care', 'audience': 'Residential cleaners, office cleaning & turnover services', 'headline': 'A cleaner space. A simpler day.'},
 {'id': '12', 'name': 'Home Repair & Trades', 'audience': 'Handyperson services, maintenance & qualified trades', 'headline': 'Bring your next home project into focus.'},
 {'id': '13', 'name': 'Real Estate & Property', 'audience': 'Real estate professionals & property managers', 'headline': 'Your next property conversation starts here.'},
 {'id': '14', 'name': 'Fashion & Boutique', 'audience': 'Fashion designers, clothing labels & accessories', 'headline': 'Wear your story. Make it yours.'},
 {'id': '15', 'name': 'Tutoring & Classes', 'audience': 'Tutors, music teachers & independent educators', 'headline': 'Make room for your next skill.'},
 {'id': '16', 'name': 'Fitness & Coaching', 'audience': 'Personal trainers & general fitness coaches', 'headline': 'Build a routine that fits your day.'},
 {"id":"17","name":"Nail Technician & Nail Studio","audience":"Nail artists and manicure studios","headline":"Nails worth showing off."},
 {"id":"18","name":"Hair Stylist & Salon","audience":"Hair stylists and salons","headline":"Your style deserves a home."},
 {"id":"19","name":"Braids & Locs Specialist","audience":"Braiders, locticians and natural-hair studios","headline":"Celebrate every style."},
 {"id":"20","name":"Makeup & Skincare Brand","audience":"Makeup artists and independent beauty brands","headline":"Made for your glow."},
 {"id":"21","name":"Wigs & Hair Bundle Shop","audience":"Wig brands, hair bundles and accessory sellers","headline":"Discover your next look."},
 {"id":"22","name":"Live Streamer & Influencer","audience":"Streamers, influencers and LIVE commerce hosts","headline":"Go live with your audience."},
 {"id":"23","name":"Independent Record Label","audience":"Record labels and artist rosters","headline":"Build a sound that lasts."},
 {"id":"24","name":"Recording & Podcast Studio","audience":"Recording studios, podcast and audio engineers","headline":"Bring your voice into focus."},
 {"id":"25","name":"Video & Film Production","audience":"Film crews, editors and video producers","headline":"Tell the story your way."},
 {"id":"26","name":"AI TV & Talent Network","audience":"Independent TV channels and emerging talent","headline":"Your stage starts here."},
 {"id":"27","name":"Cybersecurity & Digital Safety","audience":"Cybersecurity consultants and digital risk advisers","headline":"Protect what you build."},
 {"id":"28","name":"Real Estate Investing & Flips","audience":"Property investors, renovators and real estate projects","headline":"See your property's potential."},
 {"id":"29","name":"Vacation & Vehicle Rentals","audience":"Short-term stays and vehicle rental operators","headline":"Make your next stay easier."},
 {"id":"30","name":"Credit Repair & Education","audience":"Credit counselors and compliant education services","headline":"Understand the next financial step."},
 {"id":"31","name":"Law Office & Client Intake","audience":"Law firms and authorized legal-service providers","headline":"Make your first step clear."},
 {"id":"32","name":"Church Streaming & Scripture","audience":"Churches, ministries and scripture educators","headline":"Share faith and community."},
 {"id":"33","name":"Community Foundation","audience":"Community foundations and service initiatives","headline":"Build a lasting community impact."},
 {"id":"34","name":"Security Agency & Event Guards","audience":"Licensed security providers and event protection","headline":"Professional security starts with clarity."},
 {"id":"35","name":"Security Training & Licensing","audience":"Qualified safety and compliance educators","headline":"Training with responsibility."},
 {"id":"36","name":"Meal Prep & Local Delivery","audience":"Meal prep businesses and food delivery providers","headline":"Fresh meals, simply planned."},
 {"id":"37","name":"AI Call Center & Remote Work","audience":"Customer support firms and remote service teams","headline":"Support teams that scale thoughtfully."},
 {"id":"38","name":"AI Business Automation","audience":"Small business AI integration and workflow support","headline":"Make everyday work easier."},
 {"id":"39","name":"Cross-Border Payments Information","audience":"Global commerce and payment-navigation education","headline":"Plan your next border-crossing sale."},
 {"id":"40","name":"Trucking & Freight Dispatch","audience":"Transport brokers, dispatch and freight services","headline":"Move goods with confidence."},
 {"id":"41","name":"Auto Repair & Detailing","audience":"Auto mechanics and vehicle detailers","headline":"Care for every mile."},
 {"id":"42","name":"Home Remodeling & Construction","audience":"Construction and renovation contractors","headline":"Bring your next space to life."},
 {"id":"43","name":"Farm & Local Produce Market","audience":"Farmers, growers and agricultural sellers","headline":"Fresh from the people who grow it."},
 {"id":"44","name":"Affordable Housing Navigation","audience":"Housing navigators and community property services","headline":"Find information you can use."},
 {"id":"45","name":"Telehealth Practice Website","audience":"Licensed clinics and virtual-care providers","headline":"Connect with care information."},
 {"id":"46","name":"Prescription Savings Information","audience":"Lawful pharmacy savings and patient information services","headline":"Find clear medicine-saving resources."},
 {"id":"47","name":"Music Distribution & Publishing","audience":"Music distributors, publishers and rights administrators","headline":"Help your catalog travel."},
 {"id":"48","name":"PK LIVE & Creator Events","audience":"Live entertainment hosts and digital event producers","headline":"Turn a crowd into an experience."},
 {"id":"49","name":"Business Scout & QR Directory","audience":"Local business outreach and directory agencies","headline":"Make neighborhood businesses easier to find."},
 {"id":"50","name":"B2B Wholesale & Sourcing","audience":"Wholesale suppliers and sourcing agents","headline":"Connect supply with demand."},
 {"id":"51","name":"Drone & Robotics Services","audience":"Drone media and qualified robotic-service providers","headline":"Bring new perspectives to your work."},
 {"id":"52","name":"Restaurant Holo Menu & Catering","audience":"Restaurants, cafes and catering operators","headline":"Let your menu speak."},
 {"id":"53","name":"Local TV, News & Advertising","audience":"Community broadcasters and advertisers","headline":"Share what your city is doing."},
 {"id":"54","name":"Media & Music Academy","audience":"Creative classes and recording education","headline":"Learn the craft. Share the story."},
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
export type WebsiteDetails={name:string;headline:string;description:string;email:string;phone:string;location:string;services:string;color:string;photo:string;language?:WebsiteLanguage}
export function escapeHtml(value:string){return value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
export function generateWebsite(d:WebsiteDetails){
 const lang=websiteLanguage(d.language),words=WEBSITE_LANGUAGES[lang]
 const e=escapeHtml,color=/^#[0-9a-f]{6}$/i.test(d.color)?d.color:'#174a39'
 const photo=/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(d.photo)?`<img alt="${e(d.name)}" src="${d.photo}">`:''
 const email=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(d.email)?`<a href="mailto:${e(d.email)}">${e(words.email)}</a>`:''
 const phone=d.phone.replace(/[^+0-9]/g,'')
 return `<!doctype html><html lang="${lang}" dir="${words.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(d.name)}</title><style>*{box-sizing:border-box}body{margin:0;font:18px/1.6 system-ui,sans-serif;color:#17352f;background:#fafaf5}header,main,footer{max-width:1000px;margin:auto;padding:24px}header{font-weight:800;color:${color}}.hero{padding:40px 0}h1{font-size:clamp(32px,7vw,64px);line-height:1.1}img{max-width:100%;max-height:400px;object-fit:cover;border-radius:20px}a{display:inline-block;padding:12px 18px;background:${color};color:#fff;border-radius:8px;margin:8px}section{padding:24px 0;border-top:1px solid #ddd}.draft{background:#fff1ce;padding:12px;font-size:14px}${ACCESSIBLE_WEBSITE_CSS}</style></head><body><a class="skip-link" href="#content">${e(words.skip)}</a><div class="draft">${e(words.draft)}</div><header>${e(d.name)}</header><details style="max-width:1000px;margin:auto;padding:16px"><summary>${e(words.access)}</summary><label><input type="checkbox" data-access="large">${e(words.larger)}</label><label><input type="checkbox" data-access="contrast">${e(words.contrast)}</label><label><input type="checkbox" data-access="reduced">${e(words.motion)}</label><button id="read-page">${e(words.read)}</button><button id="stop-read">${e(words.stop)}</button></details><main id="content" tabindex="-1"><div class="hero"><h1>${e(d.headline)}</h1><p>${e(d.description)}</p>${photo}</div><section><h2>${e(words.services)}</h2><ul>${d.services.split('\n').filter(Boolean).map(s=>`<li>${e(s)}</li>`).join('')}</ul></section><section><h2>${e(words.contact)}</h2><p>${e(d.location)}</p>${email}${phone?`<a href="tel:${e(phone)}">${e(words.call)}</a>`:''}</section></main><footer>${e(d.name)} · Website draft created with TRYAMM</footer><script>${websiteAccessibilityScript(lang)}</script></body></html>`
}
