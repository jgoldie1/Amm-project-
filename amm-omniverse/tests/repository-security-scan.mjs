import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const skip=new Set(['node_modules','dist','.git','.next','coverage','build'])
const textExt=/\.(js|jsx|ts|tsx|mjs|cjs|json|yml|yaml|sh|ps1|bat|cmd|md)$/i
const findings=[]

const rules=[
  ['remote-shell-pipe',/(curl|wget)[^\n|]{0,500}\|\s*(sh|bash|zsh|powershell)/i,'Remote download piped directly to a shell'],
  ['destructive-root-delete',/rm\s+-rf\s+\/(?:\s|$)|Remove-Item\s+[^\n]*-Recurse[^\n]*[A-Z]:\\/i,'Destructive root filesystem deletion'],
  ['encoded-eval',/(atob|Buffer\.from)\([^\n]{0,300}(base64|['"]base64['"])[^\n]{0,300}(eval|Function\s*\()/i,'Encoded payload executed dynamically'],
  ['crypto-miner',/(xmrig|stratum\+tcp|coinhive|cryptonight|minerd)/i,'Known crypto-mining indicator'],
  ['credential-exfil',/(process\.env|Deno\.env)[^\n]{0,300}(fetch|axios|http\.request)[^\n]{0,300}(webhook|discord|telegram|pastebin)/i,'Possible environment-secret exfiltration'],
  ['reverse-shell',/(\/dev\/tcp\/|nc\s+-e\s+|bash\s+-i\s+>&|powershell[^\n]{0,120}-enc\s+)/i,'Reverse-shell or encoded PowerShell indicator'],
  ['unsafe-world-write',/chmod\s+777\s+\//i,'World-writable root path'],
]

function walk(dir){
  for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
    if(skip.has(ent.name))continue
    const p=path.join(dir,ent.name)
    if(ent.isDirectory())walk(p)
    else if(textExt.test(ent.name))scan(p)
  }
}
function scan(file){
  let text=''
  try{text=fs.readFileSync(file,'utf8')}catch{return}
  const rel=path.relative(root,file)
  for(const [id,re,desc] of rules){if(re.test(text))findings.push({id,file:rel,desc})}
  const secretPatterns=[
    [/sk_live_[A-Za-z0-9]{20,}/,'Stripe live secret'],
    [/shpat_[A-Za-z0-9_-]{20,}/,'Shopify access token'],
    [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,'Private key'],
  ]
  for(const [re,desc] of secretPatterns){
    const match=text.match(re)
    if(match && !/x{8,}|example|placeholder/i.test(match[0]))findings.push({id:'secret',file:rel,desc})
  }
}

walk(root)
if(findings.length){
  console.error('❌ repository security scan found blocking indicators')
  for(const f of findings)console.error(`- ${f.id}: ${f.file} — ${f.desc}`)
  process.exit(1)
}
console.log('✅ repository security scan passed: no blocking malware/exfiltration indicators found in scanned text source')
