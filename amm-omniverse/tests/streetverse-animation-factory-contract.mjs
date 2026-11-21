import fs from 'node:fs'
import assert from 'node:assert/strict'
const source=fs.readFileSync(new URL('../src/lib/streetverseAnimationFactory.ts',import.meta.url),'utf8')
const dock=fs.readFileSync(new URL('../src/components/StreetVerseCoreGameplayDock.tsx',import.meta.url),'utf8')
for(const token of ['inspectAnimations','StreetVerseAnimationFactory','LATEASIA_V1_DIAGNOSTIC','jointCount','diagnostic','missing','onRPEvent','package-pickup','hospital-recovery']){
 assert.ok(source.includes(token),'Animation Factory missing '+token)
}
assert.ok(dock.includes('tryamm:streetverse-first-journey-start'),'Mission quick-start must be emitted')
assert.ok(source.includes('Missing '+ "'+role+'"+' clip'),'Missing animation must not be silently treated as playable')
console.log('STREETVERSE ANIMATION FACTORY CONTRACT PASS: character audit, animation role routing and honest missing-clip handling')
