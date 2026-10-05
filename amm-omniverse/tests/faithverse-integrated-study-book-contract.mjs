import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const library=fs.readFileSync(path.join(root,'src/data/FaithVerseStudyLibrary.ts'),'utf8')
const holobook=fs.readFileSync(path.join(root,'src/components/FaithHoloBook.tsx'),'utf8')
const metaverse=fs.readFileSync(path.join(root,'src/components/EthiopianBibleMetaverse.tsx'),'utf8')
const hologpt=fs.readFileSync(path.join(root,'src/components/HoloGPTAssistant.tsx'),'utf8')
const holoLab=fs.readFileSync(path.join(root,'src/components/HoloLabGateway.tsx'),'utf8')
const ministry=fs.readFileSync(path.join(root,'src/components/ServantsOfChristMinistry.tsx'),'utf8')
const reader=fs.readFileSync(path.join(root,'src/components/FaithScriptureReader.tsx'),'utf8')
const streetverseShell=fs.readFileSync(path.join(root,'src/components/StreetVerseMobileGameShell.tsx'),'utf8')

const requiredLibrary=[
 'ETHIOPIAN_ORTHODOX_CANON_81','oldTestamentCount:46','newTestamentCount:35','total:81',
 'TRYAMM_88_BOOK_CURRICULUM','Array.from({length:7}',
 'KJV_1611_STUDY_LAYER','historicalCount:80',
 'PALEO_HEBREW_ALPHABET','Language of Creation — Hebrew Script Study',
 'STRONGS_STUDY','H1–H8674','G1–G5624',
 'https://www.ethiopianorthodox.org/english/canonical/books.html',
]
for(const token of requiredLibrary)if(!library.includes(token))throw new Error('FaithVerse library missing '+token)

for(const title of ['Esther','Jubilee','Enoch','Sirate Tsion (Book of Order)','Book of Clement','Didascalia']){
 if(!library.includes(title))throw new Error('Ethiopian canon manifest missing '+title)
}

for(const token of ['FaithHoloBook','<FaithHoloBook />','TRYAMM 88-BOOK CURRICULUM','official Ethiopian Orthodox Tewahedo 81-book canon metadata']){
 if(!metaverse.includes(token))throw new Error('Ethiopian Bible Metaverse missing '+token)
}

for(const token of ['FAITHVERSE HOLOBOOK','ETHIOPIAN CANON • 81','TRYAMM CURRICULUM • 88',"STRONG'S",'HEBREW / PALEO SCRIPT','HOLO LAB','SERVANTS OF CHRIST','ASK HOLOGPT TUTOR','KINGDOM REQUIRED STUDY BOOKS','BOOK OF ESTHER','BOOK OF JUBILEE / JUBILEES']){
 if(!holobook.includes(token))throw new Error('FaithVerse HoloBook missing '+token)
}

for(const token of ['REQUIRED_KINGDOM_STUDY_BOOKS',"aliases:['Ester','Book of Esther','Book of Ester']","aliases:['Jubilees','Book of Jubilee','Book of Jubilees']",'normalizeFaithBookQuery'])if(!library.includes(token))throw new Error('Required Esther/Jubilee study protection missing '+token)
if(!library.includes("faithFraming:true"))throw new Error('Faith-study framing metadata must remain explicit in the study library')
if(!holobook.includes("verified text source required"))throw new Error('Source-pending Ethiopian texts must not be fabricated')
if(!reader.includes('bible-api.com'))throw new Error('Working KJV reader source disappeared')

for(const token of ['tryamm:hologpt-study-context','setInput(String(detail.prompt))']){
 if(!hologpt.includes(token))throw new Error('HoloGPT FaithVerse tutor handoff missing '+token)
}
if(!holoLab.includes('integrated FaithVerse HoloBook'))throw new Error('Holo Lab FaithVerse integration missing')
if(!ministry.includes('OPEN BIBLE STUDY'))throw new Error('Servants of Christ direct Bible-study path missing')
if(!streetverseShell.includes("/faithverse#reader"))throw new Error('StreetVerse Bible action must open the working FaithVerse reader')
if(!streetverseShell.includes('Read Ethiopian Bible'))throw new Error('StreetVerse compact tools drawer must visibly expose the Bible')

console.log('FaithVerse integrated study book contract passed')
