'use strict';
/** History & memory archive contract. This module validates records; it does not persist them. */
const CATEGORIES=new Set(['historical-source','historical-interpretation','speculative-reconstruction','fictional-timeline','artist-profile','licensed-media','radio-broadcast','mission-event','character-memory','world-snapshot','ai-cafe-decision']);
const VISIBILITY=new Set(['private','owner','public']);
function validateArchiveRecord(record){
 if(!record||typeof record!=='object'||Array.isArray(record))throw Error('Archive record required');
 if(typeof record.id!=='string'||!/^[a-z0-9:_-]{3,120}$/i.test(record.id))throw Error('Invalid archive ID');
 if(!CATEGORIES.has(record.category))throw Error('Invalid archive category');
 if(typeof record.title!=='string'||!record.title.trim()||record.title.length>200)throw Error('Invalid archive title');
 if(!VISIBILITY.has(record.visibility))throw Error('Visibility required');
 if(!['draft','reviewed','published','disputed'].includes(record.reviewStatus))throw Error('Review status required');
 if(!Array.isArray(record.sources))throw Error('Sources array required');
 if(record.category==='historical-source'&&!record.sources.length)throw Error('Historical sources require provenance');
 if(record.category==='licensed-media'&&!record.rightsEvidence)throw Error('Media requires rights evidence');
 if(record.category==='radio-broadcast'&&record.recorded===true&&!record.consentEvidence)throw Error('Recorded broadcasts require consent evidence');
 if(record.visibility==='public'&&record.reviewStatus!=='published')throw Error('Public records must be reviewed and published');
 if(!record.createdAt||!Number.isFinite(Date.parse(record.createdAt)))throw Error('Timestamp required');
 return Object.freeze({...record,sources:record.sources.map(s=>({...s}))});
}
const REQUIRED_ARCHIVE_SERVICES=[
 'durable storage with backups and restore drills','identity-scoped access and retention policies','immutable revisions and provenance links',
 'consent and likeness rights ledger','timeline chronology and evidence labeling','search and retrieval with citation trails',
 'ChronoVerse checkpoint and return-portal persistence','mission XP and consequence ledger reconciliation',
 'radio recording and playlist archival','AI Cafe approved-memory retrieval and audit logs','export, deletion, and portability'
];
module.exports={validateArchiveRecord,CATEGORIES,REQUIRED_ARCHIVE_SERVICES};
