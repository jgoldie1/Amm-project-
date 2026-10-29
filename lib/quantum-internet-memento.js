'use strict';
// Memento RFC 7089 compatible *link planner*. No untrusted URL fetching or fake snapshots.
const ARCHIVES=Object.freeze([
 {id:'wayback',label:'Internet Archive',timemap:'https://web.archive.org/web/timemap/link/'},
 {id:'arquivo',label:'Arquivo.pt',timemap:'https://arquivo.pt/textsearch?versionHistory='}
]);
function safePublicUrl(raw){
 try{const u=new URL(raw);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||u.hostname==='localhost'||/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.|169\.254\.|::1$)/i.test(u.hostname)||!u.hostname.includes('.'))return null;return u.href;}
 catch{return null}
}
function archivePlan(raw,year=2005){
 const url=safePublicUrl(raw),y=Number(year);
 if(!url||!Number.isInteger(y)||y<1996||y>new Date().getUTCFullYear())return {ok:false,error:'invalid_public_url_or_year'};
 return {ok:true,source:url,year:y,mementoProtocol:'RFC 7089',liveDiscovery:false,archives:[
  {id:'wayback',label:'Wayback Machine',snapshotLookup:'https://web.archive.org/web/'+y+'/'+url,timemapUrl:'https://web.archive.org/web/timemap/link/'+url},
  {id:'arquivo',label:'Arquivo.pt',historySearch:'https://arquivo.pt/textsearch?versionHistory='+encodeURIComponent(url)}
 ],notice:'Availability, date matching, and Memento response headers are unverified until a server verifies archived captures.'};
}
module.exports={ARCHIVES,safePublicUrl,archivePlan};
