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

export const REQUIRED_KINGDOM_STUDY_BOOKS=[
 {title:'Esther',aliases:['Ester','Book of Esther','Book of Ester'],canon:'Ethiopian Orthodox Tewahedo 81',readerStatus:'kjv-reader-available'},
 {title:'Jubilee',aliases:['Jubilees','Book of Jubilee','Book of Jubilees'],canon:'Ethiopian Orthodox Tewahedo 81',readerStatus:'verified-text-source-required'},
] as const

export const FAITH_BOOK_SEARCH_ALIASES=new Map<string,string>([
 ['ester','Esther'],['book of ester','Esther'],['book of esther','Esther'],
 ['jubilees','Jubilee'],['book of jubilee','Jubilee'],['book of jubilees','Jubilee'],
])

export const normalizeFaithBookQuery=(value:string)=>{
 const q=value.trim().toLowerCase()
 return FAITH_BOOK_SEARCH_ALIASES.get(q)||value.trim()
}

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

export const KJV_1611_APOCRYPHA_BOOKS=[
 {id:'1-esdras',title:'1 Esdras',historical1611Title:'1. Esdras',chapters:9},
 {id:'2-esdras',title:'2 Esdras',historical1611Title:'2. Esdras',chapters:16},
 {id:'tobit',title:'Tobit',historical1611Title:'Tobit',chapters:14},
 {id:'judith',title:'Judith',historical1611Title:'Iudeth',chapters:16},
 {id:'rest-of-esther',title:'Rest of Esther',historical1611Title:'The rest of Esther',chapters:6},
 {id:'wisdom',title:'Wisdom of Solomon',historical1611Title:'Wisedome',chapters:19},
 {id:'ecclesiasticus',title:'Ecclesiasticus / Sirach',historical1611Title:'Ecclesiasticus',chapters:51},
 {id:'baruch',title:'Baruch + Epistle of Jeremiah',historical1611Title:'Baruch with the Epistle of Ieremiah',chapters:6},
 {id:'song-three-children',title:'Song of the Three Holy Children',historical1611Title:'The song of the three children',chapters:1},
 {id:'susanna',title:'Susanna',historical1611Title:'The story of Susanna',chapters:1},
 {id:'bel-dragon',title:'Bel and the Dragon',historical1611Title:'The idole Bel and the Dragon',chapters:1},
 {id:'prayer-manasses',title:'Prayer of Manasses',historical1611Title:'The prayer of Manasseh',chapters:1},
 {id:'1-maccabees',title:'1 Maccabees',historical1611Title:'1. Maccabees',chapters:16},
 {id:'2-maccabees',title:'2 Maccabees',historical1611Title:'2. Maccabees',chapters:15},
] as const

export const KJV_1611_SOURCE_MANIFEST={
 title:'Authorized King James Version of the Holy Bible (1611)',
 source:'Wikisource transcription / historical-edition study reference',
 url:'https://en.wikisource.org/wiki/Bible_%28King_James_Version%2C_1611%29',
 publicDomainNote:'The 1611 text is public domain in the United States; other jurisdictions may have different restrictions.',
 completeness:'Historical transcription is source-linked and may be incomplete; TRYAMM must never fill missing historical text with generated scripture.',
 apocryphaPlacement:'Between the Old and New Testaments in the 1611 printed edition.',
} as const

const KJV_1611_OT_39=[
 'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi'
] as const
const KJV_1611_NT_27=[
 'Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
] as const

export const KJV_1611_80_BOOK_STUDY_INDEX=[
 ...KJV_1611_OT_39.map((title,index)=>({id:`ot-${index+1}`,title,section:'Old Testament' as const,source:'KJV 1611 historical edition'})),
 ...KJV_1611_APOCRYPHA_BOOKS.map(item=>({id:item.id,title:item.title,section:'Apocrypha' as const,source:'KJV 1611 historical edition',chapters:item.chapters})),
 ...KJV_1611_NT_27.map((title,index)=>({id:`nt-${index+1}`,title,section:'New Testament' as const,source:'KJV 1611 historical edition'})),
] as const

export const KJV_1611_STUDY_LAYER={
 title:'King James Bible 1611 Study Layer',
 historicalCount:80,
 structure:'39 Old Testament + 14 Apocrypha + 27 New Testament',
 currentReader:'Modern KJV 66-book text lane is connected through the current reader; the historical 1611 80-book structure and 14-book Apocrypha are indexed separately and source-linked.',
 sourceManifest:KJV_1611_SOURCE_MANIFEST,
 apocryphaBooks:KJV_1611_APOCRYPHA_BOOKS,
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


export const FEATURED_FAITHVERSE_BOOKS=[
 {
  id:'esther',
  title:'Esther',
  aliases:['Esther','Ester','Book of Esther'] as const,
  lanes:['KJV connected text','KJV 1611 Old Testament','Ethiopian Orthodox canon metadata'] as const,
  note:'Esther is kept in its ordinary Old Testament lane. The 1611 Apocrypha separately includes the Rest/Additions to Esther.'
 },
 {
  id:'rest-of-esther',
  title:'Rest / Additions to Esther',
  aliases:['Rest of Esther','Additions to Esther','The rest of Esther'] as const,
  lanes:['KJV 1611 Apocrypha'] as const,
  note:'This is the historical 1611 Apocrypha addition lane and is kept distinct from the canonical Book of Esther.'
 },
 {
  id:'jubilees',
  title:'Jubilees',
  aliases:['Jubilee','Jubilees','Book of Jubilee','Book of Jubilees'] as const,
  sourceDisplayTitle:'Jubilee',
  lanes:['Ethiopian Orthodox Tewahedo canon metadata'] as const,
  note:'Jubilees is studied through the Ethiopian-canon lane. It is not relabeled as a KJV 1611 Apocrypha book.'
 },
] as const


export const JUBILEES_STUDY_SOURCE_MANIFEST={
 title:'The Book of Jubilees — public-domain historical study reference',
 sourceDisplayTitle:'Book of jubilees',
 referenceEdition:'George H. Schodde English translation / 1888 scan reference',
 url:'https://en.wikisource.org/wiki/File:Book_of_jubilees.djvu',
 sourceRole:'study-reference-not-official-ethiopian-church-text',
 textConnection:'scan-reference-only-until-a-reviewed-readable-corpus-is-connected',
 integrityRule:'Do not present this historical English translation as the official Ethiopian Orthodox biblical text. Keep Ethiopian canon metadata, translation identity and source provenance visible.'
} as const
