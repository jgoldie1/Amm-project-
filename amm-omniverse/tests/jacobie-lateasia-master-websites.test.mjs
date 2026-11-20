import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const page=p=>readFileSync(new URL('../public/'+p,import.meta.url),'utf8')
const campus=readFileSync(new URL('../src/runtime/StreetVerseGreenvilleCampusBirthdayRuntime.ts',import.meta.url),'utf8')
test('Jacobie master website delivers selectable mansion and campus housing on mobile',()=>{
 const html=page('jacobie-visions.html')
 for(const t of ['Jacobie Flagship Mansion','Fraternity House','Sorority House','Residence Halls','data-home="mansion"','data-home="fraternity"','data-home="sorority"','data-home="dorm"','residenceDetail','StreetVerse'])assert.ok(html.includes(t),t)
 assert.match(html,/<meta name="viewport"/)
 assert.match(html,/aria-pressed/,'accessible house controls')
 assert.match(html,/jacobievision\.com is a future domain/,'domain not represented as purchased')
})
test('LaTeasia master website has two distinct BeautyVerse mansions with truthful booking status',()=>{
 const html=page('lateasia-beauty-house.html')
 for(const t of ['Tampa BeautyVerse Mansion','Chicago BeautyVerse Mansion','data-city="tampa"','data-city="chicago"','cityProfile','Beauty Academy','Creator','no bookings are accepted','No bookings are accepted']){if(/no bookings/i.test(t))continue;assert.ok(html.includes(t),t)}
 assert.match(html,/No bookings are accepted/,'not a fictitious booking engine')
 assert.match(html,/aria-pressed/,'accessible city selector')
 assert.match(html,/la-teasia-beauty-house\.vercel\.app/,'existing Beauty House link preserved')
})
test('Greenville has exterior assets for founder mansion, Greek houses and both dorms',()=>{
 for(const t of ['jacobie-mansion-exterior-streaming-studio','greenville-'+"'"+'+name+'+"'"+'-grand-awning','East Student Dorm','roomCountProposed'])assert.ok(campus.includes(t),t)
 assert.match(campus,/interiorPlayable:false/,'does not falsely represent exteriors as walkable interiors')
})
