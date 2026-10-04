import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const here=path.dirname(fileURLToPath(import.meta.url))
const root=path.resolve(here,'..')
const repo=path.resolve(root,'..')
const projectFile=path.join(repo,'unreal/StreetVerseUnreal/StreetVerseUnreal.uproject')
const exampleFile=path.join(repo,'unreal/StreetVerseUnreal/.mcp.json.example')
const scriptFile=path.join(root,'scripts/export-unreal-streetverse-manifest.mjs')

for(const f of [projectFile,exampleFile,scriptFile])if(!fs.existsSync(f))throw new Error('missing '+f)

const project=JSON.parse(fs.readFileSync(projectFile,'utf8'))
if(project.EngineAssociation!=='5.8')throw new Error('Unreal 5.8 required')
const plugins=new Map((project.Plugins||[]).map(p=>[p.Name,p.Enabled]))
for(const name of ['ModelContextProtocol','AllToolsets','ToolsetRegistry','PCG'])if(!plugins.get(name))throw new Error('missing Unreal plugin '+name)

const config=JSON.parse(fs.readFileSync(exampleFile,'utf8'))
if(config.mcpServers?.['unreal-mcp']?.url!=='http://127.0.0.1:8000/mcp')throw new Error('Unexpected Unreal MCP endpoint')

const script=fs.readFileSync(scriptFile,'utf8')
for(const x of ['tryamm.unreal.interop.v1','server-ledger','campusverse','crossverse','REEL_CAPTURE_REQUEST','MISSION_COMPLETED'])if(!script.includes(x))throw new Error('interop manifest missing '+x)

console.log('Unreal MCP repository readiness contract: PASS')
