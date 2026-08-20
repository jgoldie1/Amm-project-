import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd(),exists=(p)=>fs.existsSync(path.join(root,p)),read=(p)=>fs.readFileSync(path.join(root,p),'utf8'),must=(c,m)=>{if(!c){console.error(`❌ ${m}`);process.exit(1)}else console.log(`✅ ${m}`)}
must(exists('src/main.tsx'),'frontend entrypoint exists')
must(exists('src/App.tsx'),'app shell exists')
must(exists('api'),'API directory exists')
must(exists('.env.example'),'.env.example exists')
must(exists('vercel.json'),'vercel.json exists')
const env=read('.env.example');for(const k of ['VITE_SUPABASE_URL','VITE_SUPABASE_ANON_KEY','VITE_API_URL'])must(env.includes(k),`environment contract contains ${k}`)
const pkg=JSON.parse(read('package.json'));must(Boolean(pkg.scripts?.typecheck),'typecheck script exists');must(Boolean(pkg.scripts?.build),'build script exists');must(Boolean(pkg.scripts?.e2e),'e2e script exists');must(Boolean(pkg.scripts?.['vercel-build']),'vercel-build script exists')
must(exists('api/streetverse/life/[action].ts'),'StreetVerse life API exists')
must(exists('src/components/StreetVerseBiographyProofHub.tsx'),'StreetVerse biography proof UI exists')
must(exists('src/services/streetVerseLifeApi.ts'),'StreetVerse life API client exists')
must(exists('supabase/migrations/20260820253000_streetverse_life_world_memory.sql'),'StreetVerse life persistence migration exists')
const life=read('api/streetverse/life/[action].ts');for(const a of ['biography-save','return-world','archive-progress','creator-work','rejoin'])must(life.includes(`action==='${a}'`),`StreetVerse life action ${a}`)
console.log('✅ production readiness contracts passed')
