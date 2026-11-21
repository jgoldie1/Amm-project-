import fs from 'node:fs'
import assert from 'node:assert/strict'
const source=fs.readFileSync(new URL('../src/components/StreetVerseCreatorStudio.tsx',import.meta.url),'utf8')
const agreement=fs.readFileSync(new URL('../../docs/STREETVERSE_CREATOR_AGREEMENT_DRAFT.md',import.meta.url),'utf8')
for(const pattern of [/createAccessibleModDraft/,/reviewCreatorMod/,/submitCreatorMod/,/decideCreatorMod/,/aria-pressed/,/role="status"/,/Local demonstration marketplace/,/not a production moderation approval/])assert.match(source,pattern)
for(const section of ['Intellectual property','Net Receipts','Refunds','Tax','Community Development Fund','Game economy separation','Mandatory launch gates'])assert.ok(agreement.includes(section),'Missing agreement section '+section)
assert.match(agreement,/Unsigned working draft/)
console.log('Creator Studio source and agreement safeguards PASS')
