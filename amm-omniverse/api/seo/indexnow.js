const INDEXNOW_KEY='8b7d3d04e91f4d26a67b6ad2f3f18c64'
const HOST='tryamm.online'
const KEY_LOCATION=`https://${HOST}/${INDEXNOW_KEY}.txt`
const DEFAULT_URLS=[
  `https://${HOST}/`,
  `https://${HOST}/about/`,
  `https://${HOST}/streetverse/`,
  `https://${HOST}/marketplace/`,
  `https://${HOST}/live/`,
  `https://${HOST}/archive/`,
  `https://${HOST}/accessibility/`,
]

function normalizeUrls(input){
  const urls=Array.isArray(input)&&input.length?input:DEFAULT_URLS
  return urls.filter(u=>typeof u==='string'&&u.startsWith(`https://${HOST}/`)).slice(0,10000)
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'})
  const trigger=process.env.SEO_INDEXNOW_TRIGGER_SECRET
  if(!trigger)return res.status(503).json({ok:false,error:'indexnow_trigger_not_configured'})
  if(req.headers['x-seo-secret']!==trigger)return res.status(401).json({ok:false,error:'unauthorized'})
  const urlList=normalizeUrls(req.body?.urls)
  if(!urlList.length)return res.status(400).json({ok:false,error:'no_valid_urls'})
  const response=await fetch('https://api.indexnow.org/IndexNow',{method:'POST',headers:{'Content-Type':'application/json; charset=utf-8'},body:JSON.stringify({host:HOST,key:INDEXNOW_KEY,keyLocation:KEY_LOCATION,urlList})})
  const text=await response.text().catch(()=> '')
  return res.status(response.ok?200:502).json({ok:response.ok,status:response.status,submitted:urlList.length,provider:'IndexNow',detail:text||undefined})
}
