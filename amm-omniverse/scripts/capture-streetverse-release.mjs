import {mkdirSync,openSync,readSync,closeSync,statSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import path from 'node:path'

const base=String(process.env.TRYAMM_BASE_URL||'https://tryamm.online').replace(/\/$/,'')
const url=base+'/streetverse'
const out=path.resolve(process.argv[2]||'release-evidence/visual-qa')
mkdirSync(out,{recursive:true})

const run=(args,timeoutMs=120000)=>{
  const result=spawnSync(process.platform==='win32'?'npx.cmd':'npx',args,{stdio:'inherit',env:process.env,timeout:timeoutMs})
  if(result.error)console.error('Screenshot command error:',result.error.message)
  return result
}

const isCompletePng=(filename)=>{
  let fd
  try{
    const size=statSync(filename).size
    if(size<1000)return false
    fd=openSync(filename,'r')
    const header=Buffer.alloc(8),tail=Buffer.alloc(12)
    readSync(fd,header,0,8,0)
    readSync(fd,tail,0,12,size-12)
    return header.equals(Buffer.from([137,80,78,71,13,10,26,10]))&&
      tail.subarray(4,8).toString('ascii')==='IEND'&&tail.readUInt32BE(0)===0
  }catch{return false}
  finally{if(fd!==undefined)closeSync(fd)}
}

const playwright=['--yes','playwright@1.55.0']
const install=run([...playwright,'install','chromium'],180000)
if(install.status!==0||install.error)process.exit(install.status||1)

const shots=[
  {name:'streetverse-mobile-390x844.png',size:'390,844'},
  {name:'streetverse-desktop-1440x900.png',size:'1440,900'},
]
for(const shot of shots){
  const filename=path.join(out,shot.name)
  const result=run([...playwright,'screenshot','--browser','chromium','--viewport-size',shot.size,'--wait-for-timeout','7000',url,filename],45000)
  // Playwright CLI can leave a child process running after the image is fully written.
  // Only tolerate a nonzero/timeout exit if a complete PNG including its IEND chunk exists.
  if(!isCompletePng(filename)){
    console.error('Screenshot missing or incomplete:',filename,'exit:',result.status)
    process.exit(result.status||1)
  }
  if(result.status!==0||result.error)console.warn('Screenshot saved and PNG-validated despite CLI exit:',shot.name)
}
console.log(JSON.stringify({ok:true,url,output:out,shots:shots.map(x=>x.name)},null,2))
