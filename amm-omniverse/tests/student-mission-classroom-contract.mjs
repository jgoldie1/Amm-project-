import fs from 'node:fs'
const ui=fs.readFileSync(new URL('../src/components/StudentMissionClassroom.tsx',import.meta.url),'utf8')
const main=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
for(const x of ['TODAY','HOMEWORK','MISSIONS','TEST','PROGRESS','Ask Benny / JARVIS','one-hand-controls','Learning Passport','Student authors the submitted work']) if(!ui.includes(x)) throw new Error('Student classroom missing: '+x)
for(const x of ["'/learn'","'/student'","'/academy/classroom'",'StudentMissionClassroom']) if(!main.includes(x)) throw new Error('Student classroom route missing: '+x)
console.log('Student mission classroom route contract: PASS')
