import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import ts from 'typescript'

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const load=(p)=>readFileSync(path.join(root,p),'utf8')
const files=[
 'src/components/StreetVerseNearWest3D.tsx',
 'src/components/StreetVerseTaylorFillmoreGate.tsx',
 'src/components/StreetVerseQuantumConeAerialCamera.tsx',
]
for(const file of files){
 const source=ts.createSourceFile(file,load(file),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
 assert.deepEqual(source.parseDiagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,'\n')),[],`TSX parse failure: ${file}`)
}
const world=load(files[0]),gate=load(files[1]),camera=load(files[2])
assert.match(world,/<StreetVerseTaylorFillmoreGate\/>/,'gate must actually mount in game canvas')
assert.match(world,/<StreetVerseQuantumConeAerialCamera\s+mode=\{aerialMode\}/,'aerial lens must actually mount')
assert.match(world,/aerialMode!=='ground'/,'player/vehicle camera arbitration required')
assert.match(world,/GATE FLY-IN/,'one-handed gate fly-in UI must exist')
assert.match(world,/GROUND VIEW/,'player must be able to return to normal movement camera')
assert.match(gate,/surveyed:\s*false/,'never portray inferred gate as a surveyed replica')
assert.match(gate,/guard-booth-concept/,'entry guardhouse is required')
assert.match(gate,/gate-left-leaf/,'left gate leaf required')
assert.match(camera,/FLIGHT_SECONDS\s*=\s*8/,'flight must be bounded on mobile')
assert.match(camera,/mode==='ground'/,'lens must relinquish camera in gameplay')
console.log('Taylor/Fillmore gate + Quantum Cone aerial mobile camera contract: PASS')
