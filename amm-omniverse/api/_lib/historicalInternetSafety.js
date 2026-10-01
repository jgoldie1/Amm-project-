import net from 'node:net'

const clean=(v,n=1800)=>String(v||'').trim().slice(0,n)

function blockedIp(host){
  const h=String(host||'').toLowerCase().replace(/^\[|\]$/g,'')
  if(!h||h==='localhost'||h.endsWith('.localhost')||h.endsWith('.local'))return true
  const kind=net.isIP(h)
  if(!kind)return false
  if(kind===4){
    const p=h.split('.').map(Number)
    return p[0]===10||p[0]===127||p[0]===0||(p[0]===169&&p[1]===254)||(p[0]===192&&p[1]===168)||(p[0]===172&&p[1]>=16&&p[1]<=31)
  }
  return h==='::1'||h.startsWith('fc')||h.startsWith('fd')||h.startsWith('fe8')||h.startsWith('fe9')||h.startsWith('fea')||h.startsWith('feb')
}

export function normalizeHistoricalUrl(raw){
  let value=clean(raw)
  if(!value)throw new Error('historical_url_required')
  if(!/^https?:\/\//i.test(value))value='https://'+value
  const u=new URL(value)
  if(!['http:','https:'].includes(u.protocol)||u.username||u.password||blockedIp(u.hostname))throw new Error('unsupported_historical_url')
  u.hash=''
  for(const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'])u.searchParams.delete(key)
  u.hostname=u.hostname.toLowerCase()
  return u.toString()
}

export function validHistoricalUrl(raw){
  try{normalizeHistoricalUrl(raw);return true}catch{return false}
}
