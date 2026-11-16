// MusicVerse discovery on approved, playable catalog metadata only.
// Search, genre filters, artist channels and local-only playlists.
// No inferred licenses, paid ranking, stream inflation, account follows or purchases.
export const DISCOVERY_PLAYLIST_KEY='tryamm.musicverse.local-watchlist.v1';
export const MUSIC_VIDEO_GENRES=Object.freeze(['All','R&B / Soul','Gospel','Hip-Hop','Jazz','Afrobeats','House','Pop','Rock','Country','Other']);
export const MUSIC_DISCOVERY_CRITERIA=Object.freeze({
 searchable:['title','artist','genre','description'],
 ranking:'alphabetical for initial public pilot; sponsored videos never buy organic rank',
 channels:'artist groupings are computed from approved media, not automatically authenticated artist identities',
 playlists:'private browser-only saved video IDs; no cloud sync or follows',
 analytics:'no public view counts or royalty statements without verified ingestion and fraud controls',
 copyright:'only rights-gated catalog entries can be displayed; no public sample videos invented',
 moderation:'artist appeals, captions, takedowns and accessibility review required for a real launch'
});
export function searchApprovedVideos(videos,{query='',genre='All',artist='All'}={}){
 if(!Array.isArray(videos))return [];
 const q=String(query).trim().toLocaleLowerCase().slice(0,120);
 return videos.filter(v=>{
  if(!v||v.rightsVerified!==true||!v.streamManifestUrl||!v.captionsUrl)return false;
  if(genre!=='All'&&v.genre!==genre)return false;
  if(artist!=='All'&&v.artist!==artist)return false;
  const text=[v.title,v.artist,v.genre,v.description].map(x=>String(x??'')).join(' ').toLocaleLowerCase();
  return !q||text.includes(q);
 }).sort((a,b)=>String(a.artist).localeCompare(String(b.artist))||String(a.title).localeCompare(String(b.title)));
}
export function listArtistChannels(videos){
 const names=new Set((Array.isArray(videos)?videos:[]).filter(v=>v?.rightsVerified===true).map(v=>String(v.artist||'').trim()).filter(Boolean));
 return [...names].sort((a,b)=>a.localeCompare(b));
}
export function sanitizeSavedVideoIds(ids,approvedVideos){
 const allowed=new Set((Array.isArray(approvedVideos)?approvedVideos:[]).map(v=>String(v.id)));
 return [...new Set((Array.isArray(ids)?ids:[]).filter(x=>typeof x==='string'&&x.length<=100&&allowed.has(x)))].slice(0,100);
}
export function readLocalWatchlist(storage,approvedVideos){
 try{
  const x=JSON.parse(storage.getItem(DISCOVERY_PLAYLIST_KEY)||'[]');
  return sanitizeSavedVideoIds(x,approvedVideos);
 }catch{return []}
}
export function saveLocalWatchlist(storage,ids,approvedVideos){
 const valid=sanitizeSavedVideoIds(ids,approvedVideos);
 storage.setItem(DISCOVERY_PLAYLIST_KEY,JSON.stringify(valid));
 return valid;
}
