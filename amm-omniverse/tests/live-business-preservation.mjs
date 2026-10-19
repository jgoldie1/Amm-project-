import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import assert from 'node:assert/strict'
const baseline='397b73c6cb399aa253adbb1e0006c2f212b20e4f'
const changes=execFileSync('git',['diff',baseline,'HEAD','--name-only'],{encoding:'utf8'}).trim().split('\n').filter(Boolean)
assert.deepEqual(changes.filter(path=>/src\/(components\/StreetVerse|runtime\/StreetVerse|main\.tsx|bootstrap\.ts)|public\/streetverse|streetverse-safe\.html/.test(path)),[],'Working StreetVerse source must be preserved')
const routes=JSON.parse(fs.readFileSync('vercel.json','utf8')).routes
assert.equal(routes.find(route=>route.src==='/')?.dest,'/business-app.html')
assert.equal(JSON.parse(fs.readFileSync('public/manifest.business.json','utf8')).start_url,'/app')
console.log('Live baseline preserved; root opens business; separate app icon opens /app.')
