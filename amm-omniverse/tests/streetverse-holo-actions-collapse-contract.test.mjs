import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {test} from 'node:test'
const src=readFileSync(new URL('../src/components/StreetVerseActionCarousel.tsx',import.meta.url),'utf8')
test('Holo Actions must not cover the game by default on Chromebook or mobile',()=>{
 assert.match(src,/const \[open,setOpen\]=useState\(\(\)=>startInRP\)/)
 assert.match(src,/if\(!open\)return <div aria-label="StreetVerse compact action launchers"/)
 assert.doesNotMatch(src,/if\(!mobile\)setOpen\(true\)/)
})
test('When open, close/play controls remain visible and large enough for one hand',()=>{
 assert.match(src,/position:'sticky',top:0,zIndex:3/)
 assert.match(src,/aria-label="Return to gameplay and collapse Holo Actions"/)
 assert.match(src,/aria-label="Close Holo Actions panel"/)
 assert.match(src,/const closeBtn:React\.CSSProperties=\{minWidth:88,minHeight:56/)
 assert.match(src,/const playBtn:React\.CSSProperties=\{minHeight:56/)
})
test('Escape and focus events release the action overlay',()=>{
 assert.match(src,/event\.key==='Escape'/)
 assert.match(src,/tryamm:streetverse-play-focus/)
 assert.match(src,/setOpen\(false\);setRpOpen\(false\)/)
})
