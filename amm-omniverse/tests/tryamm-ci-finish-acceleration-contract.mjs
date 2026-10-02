import fs from 'node:fs'
import assert from 'node:assert/strict'

const read=(name)=>fs.readFileSync(new URL(`../../.github/workflows/${name}`,import.meta.url),'utf8')
const mega=read('streetverse-chicago-morning-mega-convergence.yml')
const android=read('tryamm-android-candidate.yml')
const production=read('deploy-tryamm-production.yml')

assert.match(mega,/push:\n\s+branches:\n\s+- main/,'Mega convergence must run after merge on main')
assert.ok(!/pull_request:\n\s+branches:\n\s+- main/.test(mega),'Mega convergence must not duplicate heavy release work on PRs')

assert.match(android,/on:\n\s+workflow_dispatch:/,'Standalone Android candidate must remain manually runnable')
assert.ok(!/pull_request:/.test(android),'Standalone Android candidate must not duplicate Android builds on PRs')
assert.ok(!/push:/.test(android),'Standalone Android candidate must not duplicate Android builds after every main push')

assert.match(production,/push:\n\s+branches: \[main\]/,'Production certification must auto-run after main merge')
assert.match(production,/Wait for native Vercel production deployment at exact SHA/,'Production certification must wait for the exact deployed SHA')
assert.match(production,/Run desktop and mobile E2E on production/,'Production certification must run public E2E')
assert.match(production,/npm ci --no-audit --no-fund/,'Production certification must use deterministic npm ci')

console.log('TRYAMM finish-acceleration CI routing contract: PASS')
