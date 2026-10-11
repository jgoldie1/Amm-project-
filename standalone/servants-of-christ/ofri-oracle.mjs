// Ofri Knowledge Oracle: conservative ingestion of owner-approved transcripts.
// This is a standalone local library; no network scraping, credentials, or AI provider keys.
export const SOURCES = Object.freeze(['youtube','facebook','patreon','tiktok','website','livestream']);
export function validateSource(item) {
  if (!item || typeof item !== 'object') throw Error('Source required');
  if (!SOURCES.includes(item.platform)) throw Error('Unsupported source platform');
  if (!/^https:\/\//.test(item.url || '')) throw Error('HTTPS source URL required');
  if (item.permission !== 'owner-approved') throw Error('Explicit rights approval required');
  if (!item.title || !item.transcript || typeof item.transcript !== 'string') throw Error('Title and transcript required');
  if (item.transcript.length > 200000) throw Error('Transcript too large');
  return {id:String(item.id || ''),platform:item.platform,url:item.url,title:String(item.title),transcript:item.transcript,permission:'owner-approved',publishedAt:item.publishedAt || null,reviewed:false};
}
export function chunkTranscript(source,maxChars=1400) {
  const approved=validateSource(source);
  const words=approved.transcript.replace(/\s+/g,' ').trim().split(' ');
  const chunks=[];let part='';
  for (const word of words) {
    if ((part+' '+word).length>maxChars && part) {chunks.push(part);part='';}
    part+=(part?' ':'')+word;
  }
  if(part)chunks.push(part);
  return chunks.map((text,i)=>({id:approved.id+':'+i,sourceUrl:approved.url,title:approved.title,text,reviewed:false}));
}
export function searchApproved(chunks,query,limit=5) {
  const terms=String(query).toLowerCase().match(/[a-z0-9]{3,}/g)||[];
  return chunks.filter(c=>c.reviewed===true).map(c=>({chunk:c,score:terms.reduce((n,t)=>n+(c.text.toLowerCase().includes(t)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>x.chunk);
}
