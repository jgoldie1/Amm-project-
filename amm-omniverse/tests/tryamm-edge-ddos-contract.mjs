import fs from 'node:fs'

const vercel=JSON.parse(fs.readFileSync(new URL('../vercel.json',import.meta.url),'utf8'))
const proxy=fs.readFileSync(new URL('../api/_lib/origin-shield-proxy.js',import.meta.url),'utf8')
const firewall=fs.readFileSync(new URL('../scripts/stage-vercel-ddos-firewall.sh',import.meta.url),'utf8')
const firewallWorkflow=fs.readFileSync(new URL('../../.github/workflows/tryamm-edge-ddos-firewall-stage.yml',import.meta.url),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM EDGE DDoS CONTRACT FAIL: '+msg)}

const serialized=JSON.stringify(vercel)
must(!serialized.includes('onrender.com'),'vercel.json must not directly rewrite public routes to Render origin')
for(const route of [
  'api/payments/status.js',
  'api/checkout.js',
  'api/payments/verify-checkout.js',
  'api/creator/earnings.js',
  'api/stripe/webhook.js',
]){
  must(fs.existsSync(new URL('../'+route,import.meta.url)),'missing protected Vercel proxy function '+route)
}
must(proxy.includes('TRYAMM_EDGE_ORIGIN_SECRET'),'edge proxy must require shared origin secret')
must(proxy.includes("createHmac('sha256'"),'edge proxy must sign origin requests')
must(proxy.includes("AbortController"),'edge proxy must enforce origin timeout')
must(proxy.includes("12_000"),'origin timeout budget missing')
must(serialized.includes('Strict-Transport-Security'),'Vercel frontend HSTS header missing')
must(serialized.includes('X-Content-Type-Options'),'Vercel frontend nosniff header missing')
console.log('TRYAMM EDGE DDoS CONTRACT PASS: Vercel front door + signed origin proxies + no direct Render rewrites')

must(firewall.includes('LOG-FIRST'),'firewall staging must be explicitly log-first')
must(firewall.includes('--rate-limit-action log'),'rate-limit rules must begin in observation mode')
must(!firewall.includes('firewall publish'),'staging script must never publish firewall drafts')
must(firewallWorkflow.includes('stage-log-rules'),'manual staging workflow input missing')
must(!firewallWorkflow.includes('vercel firewall publish'),'workflow must never auto-publish firewall rules')
must(firewallWorkflow.includes('Attack Mode remains a human-confirmed emergency action.'),'human-confirmed Attack Mode boundary missing')
console.log('TRYAMM VERCEL WAF SAFETY CONTRACT PASS: log-first staging with no automatic publish')
