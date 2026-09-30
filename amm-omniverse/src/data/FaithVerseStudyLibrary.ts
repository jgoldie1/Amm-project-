export type FaithCanonBook={
 id:string
 title:string
 testament:'Old Testament'|'New Testament'
 canon:'Ethiopian Orthodox Tewahedo 81'
 sourceStatus:'official-canon-metadata'
 readerStatus:'kjv-reader-available'|'verified-text-source-required'
}

const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')
const KJV_READER_BOOKS=new Set([
 'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','Esther','Job','Psalms','Proverbs','Ecclesiastes','The Song of Songs','Isaiah','Jeremiah','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi',
 'Matthew','Mark','Luke','John','The Acts','Romans','I Corinthians','II Corinthians','Galatians','Ephesians','Philippians','Colossians','I Thessalonians','II Thessalonians','I Timothy','II Timothy','Titus','Philemon','Hebrews','I Peter','II Peter','I John','II John','III John','James','Jude','Revelation'
])
const book=(title:string,testament:FaithCanonBook['testament']):FaithCanonBook=>({
 id:slug(title),title,testament,canon:'Ethiopian Orthodox Tewahedo 81',sourceStatus:'official-canon-metadata',
 readerStatus:KJV_READER_BOOKS.has(title)?'kjv-reader-available':'verified-text-source-required',
})

export const ETHIOPIAN_ORTHODOX_CANON_81:FaithCanonBook[]=[
 ...[
 'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','I and II Samuel','I and II Kings','I Chronicles','II Chronicles','Jubilee','Enoch','Ezra and Nehemia','Ezra (2nd) and Ezra Sutuel','Tobit','Judith','Esther','I Maccabees','II and III Maccabees','Job','Psalms','Proverbs','Tegsats (Reproof)','Metsihafe Tibeb (Books of Wisdom)','Ecclesiastes','The Song of Songs','Isaiah','Jeremiah','Ezekiel','Daniel','Hosea','Amos','Micah','Joel','Obadiah','Jonah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Book of Joshua the Son of Sirac','Book of Josephas the Son of Bengorion'
 ].map(title=>book(title,'Old Testament')),
 ...[
 'Matthew','Mark','Luke','John','The Acts','Romans','I Corinthians','II Corinthians','Galatians','Ephesians','Philippians','Colossians','I Thessalonians','II Thessalonians','I Timothy','II Timothy','Titus','Philemon','Hebrews','I Peter','II Peter','I John','II John','III John','James','Jude','Revelation','Sirate Tsion (Book of Order)','Tizaz (Book of Herald)','Gitsew','Abtilis','I Book of Dominos','II Book of Dominos','Book of Clement','Didascalia'
 ].map(title=>book(title,'New Testament')),
]

export const ETHIOPIAN_CANON_SOURCE={
 title:'Ethiopian Orthodox Tewahedo Church — Canonical Books',
 url:'https://www.ethiopianorthodox.org/english/canonical/books.html',
 oldTestamentCount:46,
 newTestamentCount:35,
 total:81,
} as const

export type CurriculumEntry={
 id:string
 title:string
 kind:'official-ethiopian-canon'|'custom-study-supplement'
 sourceStatus:'official-canon-metadata'|'source-not-yet-assigned'
}

export const TRYAMM_88_BOOK_CURRICULUM:CurriculumEntry[]=[
 ...ETHIOPIAN_ORTHODOX_CANON_81.map(item=>({id:item.id,title:item.title,kind:'official-ethiopian-canon' as const,sourceStatus:'official-canon-metadata' as const})),
 ...Array.from({length:7},(_,index)=>({
   id:`study-supplement-${index+1}`,
   title:`Study Supplement ${index+1} — source/title to assign`,
   kind:'custom-study-supplement' as const,
   sourceStatus:'source-not-yet-assigned' as const,
 })),
]

export const KJV_1611_STUDY_LAYER={
 title:'King James Bible 1611 Study Layer',
 historicalCount:80,
 structure:'39 Old Testament + 14 Apocrypha + 27 New Testament',
 currentReader:'Modern KJV text lane is connected; original-1611 spelling/scan comparison remains source-labeled.',
 editionRule:'Never silently replace Ethiopian-canon metadata with KJV canon metadata.',
} as const

export const PALEO_HEBREW_ALPHABET=[
 ['Aleph','א','𐤀','ʾ / silent carrier'],['Bet','ב','𐤁','b / v'],['Gimel','ג','𐤂','g'],['Dalet','ד','𐤃','d'],
 ['He','ה','𐤄','h'],['Waw','ו','𐤅','w / v'],['Zayin','ז','𐤆','z'],['Het','ח','𐤇','ḥ'],
 ['Tet','ט','𐤈','ṭ'],['Yod','י','𐤉','y'],['Kaf','כ','𐤊','k / kh'],['Lamed','ל','𐤋','l'],
 ['Mem','מ','𐤌','m'],['Nun','נ','𐤍','n'],['Samekh','ס','𐤎','s'],['Ayin','ע','𐤏','ʿ'],
 ['Pe','פ','𐤐','p / f'],['Tsade','צ','𐤑','ṣ'],['Qof','ק','𐤒','q'],['Resh','ר','𐤓','r'],
 ['Shin','ש','𐤔','sh / s'],['Tav','ת','𐤕','t'],
] as const

export const PALEO_HEBREW_STUDY_RULES={
 title:'Language of Creation — Hebrew Script Study',
 faithFraming:true,
 academicBoundary:'“Language of Creation” is a faith-study title. Paleo-Hebrew is treated here as an ancient script tradition used for Hebrew, not as a separate magically verified language.',
 transliterationBoundary:'Pronunciation and transliteration are learner aids and must be labeled as reconstructions or conventions where uncertain.',
 glyphBoundary:'The ancient glyph column uses Unicode Phoenician-style reference glyphs as a study aid; it is not a claim that every Paleo-Hebrew manuscript used identical letterforms.',
} as const

export const STRONGS_STUDY={
 title:"Strong's Concordance Study",
 hebrewRange:'H1–H8674',
 greekRange:'G1–G5624',
 sourceUrl:(id:string)=>{
   const raw=id.trim().toUpperCase()
   const number=raw.replace(/[^0-9]/g,'')
   return raw.startsWith('G')?`https://biblehub.com/greek/${number}.htm`:`https://biblehub.com/hebrew/${number}.htm`
 },
 rule:"Strong's numbers apply only where a verified Strong's/KJV mapping exists. Ethiopian-canon books outside that mapping require a different source-specific lexical index.",
 starters:['H7225','H430','H3068','H7307','G3056','G26'] as const,
} as const
