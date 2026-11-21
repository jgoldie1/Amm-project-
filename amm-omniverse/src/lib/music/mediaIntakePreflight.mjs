// MusicVerse private media intake preflight.
// Browser-only readiness report: NO uploads, payments, publishing, rights grants, or cloud storage.
export const MEDIA_INTAKE_MAX_BYTES=Object.freeze({audio:150*1024*1024,video:500*1024*1024});
export const MEDIA_INTAKE_EXTENSIONS=Object.freeze({audio:['wav','mp3','flac','m4a','ogg'],video:['mp4','mov','webm']});
export const REQUIRED_MEDIA_DECLARATIONS=Object.freeze([
 {id:'authorized',label:'I own this recording or have permission to submit it for review.'},
 {id:'contributors',label:'I can identify the artists, writers, performers and relevant contributors.'},
 {id:'samples',label:'Samples, artwork and footage are original or will be separately cleared.'}
]);
export function inspectMediaIntake({name='',size=0,type='',kind='audio'}={}){
 if(!Object.hasOwn(MEDIA_INTAKE_EXTENSIONS,kind))return {ok:false,issues:['Unsupported media category']};
 const ext=String(name).trim().toLowerCase().split('.').pop();
 const issues=[];
 if(!MEDIA_INTAKE_EXTENSIONS[kind].includes(ext))issues.push('Unsupported '+kind+' extension');
 if(!Number.isInteger(size)||size<=0||size>MEDIA_INTAKE_MAX_BYTES[kind])issues.push('Invalid size or exceeds local '+kind+' preview limit');
 if(typeof type!=='string'||(type&&!type.startsWith(kind+'/')&&!(['audio','video'].includes(kind)&&type==='application/ogg')))issues.push('File MIME type does not match selected media category');
 return {ok:issues.length===0,kind,extension:ext,size,issues,rightsApproved:false,publishAuthorized:false,uploadAuthorized:false};
}
export function verifyMediaSignature(bytes,kind,extension){
 if(!bytes||bytes.length<12)return false;
 const ascii=(from,to)=>String.fromCharCode(...Array.from(bytes.slice(from,to)));
 if(extension==='wav')return ascii(0,4)==='RIFF'&&ascii(8,12)==='WAVE';
 if(extension==='flac')return ascii(0,4)==='fLaC';
 if(extension==='mp3')return ascii(0,3)==='ID3'||(bytes[0]===255&&(bytes[1]&0xe0)===0xe0);
 if(extension==='ogg')return ascii(0,4)==='OggS';
 if(extension==='m4a'||extension==='mp4'||extension==='mov')return ascii(4,8)==='ftyp';
 if(extension==='webm')return bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3;
 return false;
}
export function createMediaIntakeReceipt({name,size,kind,sha256,artist,title,declarations}={}){
 const info=inspectMediaIntake({name,size,kind});
 if(!info.ok||!Array.isArray(declarations)||REQUIRED_MEDIA_DECLARATIONS.some(d=>!declarations.includes(d.id)))return null;
 if(!/^[a-f0-9]{64}$/.test(String(sha256)))return null;
 const clean=s=>typeof s==='string'?s.trim().slice(0,120):'';
 if(!clean(artist)||!clean(title))return null;
 return {schema:1,source:'tryamm-aniyah-local-intake',kind,filename:String(name).slice(0,180),size,sha256,artist:clean(artist),title:clean(title),
  declarations:[...REQUIRED_MEDIA_DECLARATIONS.map(d=>d.id)],status:'AWAITING_HUMAN_RIGHTS_REVIEW',fileUploaded:false,assetStored:false,
  rightsVerified:false,publishAuthorized:false,distributionAuthorized:false,monetizationAuthorized:false,
  next:['verified private media storage','malware scan','rights and identity review','transcode and captions','territory approval','moderation approval','signed playback manifest','analytics reconciliation']};
}
