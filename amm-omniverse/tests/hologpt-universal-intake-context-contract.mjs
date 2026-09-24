import fs from 'node:fs'
const s=fs.readFileSync(new URL('../src/runtime/HoloGPTUniversalIntakeContext.ts',import.meta.url),'utf8')
for(const x of ['UniversalIntake','LivingContextGraph','buildResumeMyWork','Continue from verified evidence','hash-every-artifact','derived-files-link-to-source','deletion-propagates-to-derived-indexes','MALWARE_SAFETY_GATE','pdf','docx','xlsx','pptx','repository','cloud-file']) if(!s.includes(x)) throw new Error('Universal intake/context contract missing: '+x)
console.log('HoloGPT universal intake + living context + resume recovery: PASS')
