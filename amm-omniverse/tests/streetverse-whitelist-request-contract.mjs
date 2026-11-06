import assert from 'node:assert/strict'
import fs from 'node:fs'
const request=fs.readFileSync(new URL('../src/components/StreetVerseWhitelistRequest.tsx',import.meta.url),'utf8')
const city=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')
for(const token of ['status:\'draft\'','localStorage.setItem','Download for Review','NOT SUBMITTED','type="button"','StreetVerse administrator'])assert.ok(request.includes(token),'Missing whitelist safety control '+token)
assert.ok(city.includes('<StreetVerseWhitelistRequest')&&city.includes('REQUEST ACCESS'),'Whitelist UI not mounted in Chicago')
assert.ok(!request.includes('fetch('),'Demo request must not silently send data')
assert.ok(!/status\s*:\s*['"]approved['"]|setStatus\s*\(\s*['"]approved['"]\s*\)/.test(request),'No client-side access approval should be implemented')
console.log('StreetVerse whitelist request contract: PASS')
