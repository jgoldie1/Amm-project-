import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const hierarchyPath=path.join(root,'config/agi-hierarchy.json')
const apiPath=path.join(root,'api/ai/agent.js')
const healthPath=path.join(root,'api/ai/hierarchy.js')
for(const file of [hierarchyPath,apiPath,healthPath])if(!fs.existsSync(file))throw new Error(`Missing intelligence hierarchy file: ${file}`)
const hierarchy=JSON.parse(fs.readFileSync(hierarchyPath,'utf8'))
const ids=hierarchy.layers.map(x=>x.id)
for(const id of ['hologpt','stubbs-ai','lyons-tech-ai','middleverse-ai','guardian'])if(!ids.includes(id))throw new Error(`Missing AI hierarchy role: ${id}`)
if(hierarchy.selfModel.literalConsciousness!==false)throw new Error('Hierarchy must not claim literal consciousness.')
for(const sense of ['sight','hearing','touch','smell','taste'])if(!hierarchy.fiveSenseAdapters[sense])throw new Error(`Missing sense adapter contract: ${sense}`)
const agent=fs.readFileSync(apiPath,'utf8')
for(const role of ['hologpt','stubbs','lyons','middleverse','guardian'])if(!agent.includes(`${role}:`))throw new Error(`Agent router missing role: ${role}`)
console.log('agi-hierarchy: canonical hierarchy and truth gates OK')
