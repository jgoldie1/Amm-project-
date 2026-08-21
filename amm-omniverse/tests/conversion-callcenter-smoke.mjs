import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(),read=p=>fs.readFileSync(path.join(root,p),'utf8'),must=(c,m)=>{if(!c)throw new Error(`CONVERSION SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),engine=read('src/conversion/ConversionEngine.ts'),guardian=read('src/callcenter/AntiLoopGuardian.ts'),center=read('src/components/ConversionCommandCenter.tsx'),launcher=read('src/components/ConversionCommandLauncher.tsx')
must(main.includes('<ConversionCommandLauncher />'),'global conversion launcher mounted')
must(launcher.includes('HELP • EXPLORE')&&launcher.includes('tryamm:conversion-open'),'conversion launcher contract')
for(const id of ['gameverse','immersive','university','mobile','marketplace','live','creator','property','accessibility','call-center'])must(engine.includes(`id:'${id}'`),`vertical ${id}`)
for(const token of ['primaryCTA','secondaryCTA','helpCTA','proof:'])must(engine.includes(token),`landing contract ${token}`)
for(const token of ['human agent','callback','text/chat','previous menu','start over','end call'])must(guardian.includes(token),`escape option ${token}`)
for(const token of ['repeatedIntent','repeatedAnswer','toolFailures','frustration','longSilence'])must(guardian.includes(token),`loop detector ${token}`)
must(guardian.includes('force caller to repeat known information'),'no-repeat rule')
must(guardian.includes("action:'human-handoff'")&&guardian.includes("action:'change-strategy'"),'escalation strategies')
must(center.includes('AI Call Center Anti-Loop Guardian')&&center.includes('Conversion truth'),'visible support/conversion truth')
console.log('✅ conversion + AI call-center anti-loop smoke contracts passed')
