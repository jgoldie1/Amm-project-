import assert from 'node:assert/strict'
import fs from 'node:fs'
const camera=fs.readFileSync(new URL('../src/components/StreetVersePhotoCamera.tsx',import.meta.url),'utf8')
const city=fs.readFileSync(new URL('../src/components/StreetVerse3D.tsx',import.meta.url),'utf8')
for(const key of ['getUserMedia','videoWidth','drawImage','toDataURL','Upload Photo','Save Photo','getTracks().forEach','onPhotoCaptured'])assert.ok(camera.includes(key),'Missing camera contract '+key)
for(const key of ['StreetVersePhotoCamera','📷 PHOTO','photoCameraOpen','setPhotoCameraOpen'])assert.ok(city.includes(key),'Missing Chicago camera connection '+key)
assert.ok(!camera.includes('fetch('),'Camera must not automatically upload photographs')
console.log('Aniyah photo camera source contract: PASS')
