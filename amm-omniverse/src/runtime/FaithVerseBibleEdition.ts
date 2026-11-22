// Text-only format for rights-reviewed Bible editions in FaithVerse.
// Publication, title and copyright assertions require independent Kingdoms Press review.
export type BibleBook={name:string;chapters:string[][]}
export type BibleEdition={title:string;language:string;source:string;rights:string;books:BibleBook[]}
export type BibleValidation={ok:boolean;edition:BibleEdition|null;errors:string[]}
export function validateBibleEdition(input:unknown):BibleValidation{
 const errors:string[]=[]
 if(!input||typeof input!=='object'||Array.isArray(input))return{ok:false,edition:null,errors:['Edition must be an object']}
 const data=input as Record<string,unknown>
 const title=typeof data.title==='string'?data.title.trim().slice(0,120):''
 const source=typeof data.source==='string'?data.source.trim().slice(0,300):''
 const language=typeof data.language==='string'?data.language.trim().slice(0,30):''
 const rights=typeof data.rights==='string'?data.rights.trim().slice(0,300):''
 if(!title||!source||!language||!rights)errors.push('Title, source, language and rights are required')
 if(!Array.isArray(data.books)||data.books.length<1||data.books.length>150)errors.push('1-150 books are required')
 if(errors.length)return{ok:false,edition:null,errors}
 const books:BibleBook[]=[]
 let totalVerses=0
 for(const [bi,raw] of (data.books as unknown[]).entries()){
  if(!raw||typeof raw!=='object'||Array.isArray(raw)){errors.push('Book '+(bi+1)+' is invalid');break}
  const b=raw as Record<string,unknown>
  const name=typeof b.name==='string'?b.name.trim().slice(0,120):''
  if(!name||!Array.isArray(b.chapters)||b.chapters.length<1||b.chapters.length>200){errors.push('Book name/chapters invalid: '+(bi+1));break}
  const chapters:string[][]=[]
  for(const [ci,chapter] of b.chapters.entries()){
   if(!Array.isArray(chapter)||chapter.length<1||chapter.length>250){errors.push('Chapter invalid: '+name+' '+(ci+1));break}
   const verses=chapter.map((v:unknown)=>typeof v==='string'?v.trim():'')
   if(verses.some((v:string)=>!v||v.length>3000)){errors.push('Verse text invalid: '+name+' '+(ci+1));break}
   totalVerses+=verses.length
   if(totalVerses>80000){errors.push('Edition exceeds 80,000 verses');break}
   chapters.push(verses)
  }
  if(errors.length)break
  books.push({name,chapters})
 }
 return errors.length?{ok:false,edition:null,errors}:{ok:true,edition:{title,language,source,rights,books},errors:[]}
}
export const BIBLE_EDITION_SAMPLE={
 title:'Your rights-cleared edition',language:'en',source:'Publisher-approved source URL or archive',rights:'Documented license/public-domain determination',
 books:[{name:'Example book',chapters:[['Replace this instructional example with authenticated verse 1','Replace with authenticated verse 2']]}]
}
