import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()
const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'))
const vercel = JSON.parse(fs.readFileSync(path.join(cwd, 'vercel.json'), 'utf8'))

const failures = []
if (pkg.name !== 'amm-omniverse') failures.push('package name must remain amm-omniverse')
if (pkg.scripts?.['vercel-build'] !== 'npm run typecheck && npm run build') failures.push('vercel-build must typecheck then build')
if (vercel.framework !== 'vite') failures.push('Vercel framework must be vite')
if (vercel.outputDirectory !== 'dist') failures.push('Vercel outputDirectory must be dist')
if (vercel.buildCommand !== 'npm run vercel-build') failures.push('Vercel buildCommand must run vercel-build')

if (failures.length) {
  console.error('Vercel deployment contract failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('vercel-deployment-contract: project build contract OK')
