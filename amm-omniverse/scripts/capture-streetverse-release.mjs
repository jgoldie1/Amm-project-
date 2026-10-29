import {mkdirSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import path from 'node:path'

const base=String(process.env.TRYAMM_BASE_URL||'https://tryamm.online').replace(/\/$/,'')
const url=base+'/streetverse'
const out=path.resolve(process.argv[2]||'release-evidence/visual-qa')
mkdirSync(out,{recursive:true})

const run=(args,timeoutMs=120000)=>{
  const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',args,{stdio:'inherit',env:process.env,timeout:timeoutMs})
  if(result.error)console.error('Screenshot command error:',result.error.message)
  if(result.status!==0||result.error)process.exit(result.status||1)
}

const playwright=['--yes','playwright@1.55.0']
run([...playwright,'install','chromium'],180000)

const shots=[
  {name:'streetverse-mobile-390x844.png',size:'390,844'},
  {name:'streetverse-desktop-1440x900.png',size:'1440,900'},
]
for(const shot of shots){
  run([...playwright,'screenshot','--browser','chromium','--viewport-size',shot.size,'--wait-for-timeout','7000',url,path.join(out,shot.name)],90000)
}
console.log(JSON.stringify({ok:true,url,output:out,shots:shots.map(x=>x.name)},null,2))
