'use strict';
const clean=(v,m=4000)=>String(v??'').trim().slice(0,m);

const COLLECTIONS=[
  {id:'ethiopian-orthodox-broader-canon',name:'Ethiopian Orthodox Tewahedo broader canon',kind:'canon-metadata',textBundled:false},
  {id:'tanakh-hebrew-bible',name:'Tanakh / Hebrew Bible',kind:'study-collection',textBundled:false},
  {id:'new-testament',name:'New Testament',kind:'study-collection',textBundled:false},
  {id:'deuterocanon-apocrypha',name:'Deuterocanon / Apocrypha',kind:'study-collection',textBundled:false}
];

const BROADER_CANON_BOOKS=[
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Jubilees','Enoch','Ezra','Nehemiah','Tobit','Judith','Esther','1 Maccabees','2 Maccabees','Job','Psalms','Proverbs','Ecclesiastes','Song of Songs','Wisdom','Sirach','Isaiah','Jeremiah','Lamentations','Baruch','Ezekiel','Daniel','Hosea','Amos','Micah','Joel','Obadiah','Jonah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
];

function ensureStore(getStore){const s=getStore();s.ethBibleNotes||=[];s.ethBibleBookmarks||=[];s.ethBiblePlans||=[];s.ethBibleSources||=[];return s;}

module.exports=function registerEthiopianBible({app,auth,getStore,saveStore}){
  app.get('/api/faith/ethiopian-bible',auth,(_req,res)=>res.json({
    title:'Ethiopian Bible Study',
    collections:COLLECTIONS,
    broaderCanonBooks:BROADER_CANON_BOOKS,
    capabilities:['book-and-canon-browser','full-text-search-when-source-connected','notes','bookmarks','read-aloud-hook','study-plans','Sabbath-study','New-Moon-study','HoloGPT-study-assistance','historical-context','translation-comparison'],
    contentPolicy:'Bible text is loaded only from a licensed, user-provided, or public-domain source. Canon metadata and user-created notes are stored separately.',
    scholarshipNotice:'Canon lists and naming conventions vary by tradition and scholarly source; the app should identify the source/tradition used rather than presenting one catalog as the only possible enumeration.'
  }));

  app.get('/api/faith/ethiopian-bible/sources',auth,(_req,res)=>res.json({sources:ensureStore(getStore).ethBibleSources.map(x=>({id:x.id,name:x.name,license:x.license,language:x.language,verified:x.verified,sourceUrl:x.sourceUrl||null}))}));

  app.post('/api/faith/ethiopian-bible/sources',auth,async(req,res)=>{
    const s=ensureStore(getStore),source={id:`bible_src_${Date.now()}`,name:clean(req.body.name,200),language:clean(req.body.language,80)||'English',license:clean(req.body.license,200),sourceUrl:clean(req.body.sourceUrl,1000)||null,verified:req.body.verified===true,createdBy:req.user.id,createdAt:new Date().toISOString()};
    if(!source.name||!source.license)return res.status(400).json({error:'name and license are required'});
    s.ethBibleSources.push(source);await saveStore();res.status(201).json({source});
  });

  app.get('/api/faith/ethiopian-bible/notes',auth,(req,res)=>res.json({notes:ensureStore(getStore).ethBibleNotes.filter(x=>x.userId===req.user.id)}));
  app.post('/api/faith/ethiopian-bible/notes',auth,async(req,res)=>{
    const s=ensureStore(getStore),note={id:`note_${Date.now()}`,userId:req.user.id,collectionId:clean(req.body.collectionId,120),book:clean(req.body.book,120),chapter:clean(req.body.chapter,20),verse:clean(req.body.verse,40),text:clean(req.body.text,4000),tags:Array.isArray(req.body.tags)?req.body.tags.map(x=>clean(x,80)).filter(Boolean).slice(0,20):[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    if(!note.text)return res.status(400).json({error:'note text required'});s.ethBibleNotes.push(note);await saveStore();res.status(201).json({note});
  });

  app.get('/api/faith/ethiopian-bible/bookmarks',auth,(req,res)=>res.json({bookmarks:ensureStore(getStore).ethBibleBookmarks.filter(x=>x.userId===req.user.id)}));
  app.post('/api/faith/ethiopian-bible/bookmarks',auth,async(req,res)=>{
    const s=ensureStore(getStore),bookmark={id:`bookmark_${Date.now()}`,userId:req.user.id,collectionId:clean(req.body.collectionId,120),book:clean(req.body.book,120),chapter:clean(req.body.chapter,20),verse:clean(req.body.verse,40),label:clean(req.body.label,200)||null,createdAt:new Date().toISOString()};s.ethBibleBookmarks.push(bookmark);await saveStore();res.status(201).json({bookmark});
  });

  app.get('/api/faith/ethiopian-bible/plans',auth,(req,res)=>res.json({plans:ensureStore(getStore).ethBiblePlans.filter(x=>x.userId===req.user.id||x.public===true)}));
  app.post('/api/faith/ethiopian-bible/plans',auth,async(req,res)=>{
    const s=ensureStore(getStore),plan={id:`plan_${Date.now()}`,userId:req.user.id,title:clean(req.body.title,200),observance:['sabbath','new-moon','daily','custom'].includes(req.body.observance)?req.body.observance:'custom',references:Array.isArray(req.body.references)?req.body.references.map(x=>clean(x,200)).filter(Boolean).slice(0,100):[],notes:clean(req.body.notes,4000)||null,public:req.body.public===true,createdAt:new Date().toISOString()};if(!plan.title)return res.status(400).json({error:'title required'});s.ethBiblePlans.push(plan);await saveStore();res.status(201).json({plan});
  });

  app.post('/api/faith/ethiopian-bible/assistant',auth,(req,res)=>{
    const question=clean(req.body.question,2000),mode=['study','compare','history','language','sabbath','new-moon'].includes(req.body.mode)?req.body.mode:'study';if(!question)return res.status(400).json({error:'question required'});
    res.json({mode,question,assistant:'Stubbs AI / HoloGPT',status:'ready-for-ai-provider',rules:{citeTextSource:true,distinguishScriptureFromInterpretation:true,distinguishTraditionFromAcademicHistory:true,doNotInventVerses:true,respectUserFaithContext:true},next:'Connect the configured AI provider plus licensed/public-domain scripture source for grounded answers.'});
  });
};
