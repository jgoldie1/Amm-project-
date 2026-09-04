(()=>{
  const VERSION='20260903-studio-release-v2'
  const KEY='tryamm.studio.release.v1'
  const clean=s=>String(s??'').trim()
  const num=v=>Number.isFinite(Number(v))?Number(v):0
  const uid=p=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
  const defaultTrack=()=>({
    id:uid('TRK'),title:'',version:'Original',primaryArtist:'',featuredArtists:'',writers:[],publishers:[],producer:'',mixEngineer:'',masteringEngineer:'',performers:'',lyrics:'',explicit:false,
    pro:'none',ipi:'',isrc:'',iswc:'',masterOwner:'',compositionOwner:'',audioFileName:'',duration:'',
    rightsType:'original',coverLicense:'not-needed',sampleStatus:'none',sampleSource:'',sampleMasterPermission:'not-needed',sampleCompositionPermission:'not-needed',sampleDocumentRef:'',
    artworkRights:'not-applicable',aiElements:'none',aiConsentNotes:'',notes:''
  })
  const defaultRelease=()=>({version:VERSION,id:uid('ALBUM'),albumTitle:'',primaryArtist:'',label:'',releaseDate:'',genre:'',subgenre:'',territory:'Worldwide',copyrightYear:new Date().getFullYear(),artworkFileName:'',artworkRights:'unknown',upc:'',tracks:[defaultTrack()],updatedAt:new Date().toISOString()})
  function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x?.tracks)return {...x,version:VERSION}}catch{}return defaultRelease()}
  let state=load()
  function save(){state.version=VERSION;state.updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));return snapshot()}
  function snapshot(){return JSON.parse(JSON.stringify(state))}
  function setRelease(patch={}){state={...state,...patch,version:VERSION,tracks:state.tracks||[]};return save()}
  function addTrack(input={}){const t={...defaultTrack(),...input,id:input.id||uid('TRK')};state.tracks.push(t);save();return JSON.parse(JSON.stringify(t))}
  function updateTrack(id,patch={}){const i=state.tracks.findIndex(t=>t.id===id);if(i<0)return null;state.tracks[i]={...state.tracks[i],...patch,id};save();return JSON.parse(JSON.stringify(state.tracks[i]))}
  function removeTrack(id){if(state.tracks.length<=1)return false;state.tracks=state.tracks.filter(t=>t.id!==id);save();return true}
  function splitTotal(track){return (track.writers||[]).reduce((s,w)=>s+num(w.split),0)}
  function trackReadiness(track){
    const blockers=[],warnings=[]
    if(!clean(track.title))blockers.push('missing-track-title')
    if(!clean(track.primaryArtist))blockers.push('missing-primary-artist')
    if(!(track.writers||[]).length)blockers.push('missing-writers')
    const total=splitTotal(track);if(Math.abs(total-100)>.01)blockers.push(`writer-splits-${total}-not-100`)
    if(!clean(track.masterOwner))blockers.push('missing-master-owner')
    if(!clean(track.compositionOwner))blockers.push('missing-composition-owner')
    if(!clean(track.audioFileName))blockers.push('missing-audio-master')
    if(track.rightsType==='cover'&&track.coverLicense!=='approved')blockers.push('cover-license-not-approved')
    if(track.sampleStatus==='sample'||track.sampleStatus==='interpolation'){
      if(track.sampleStatus==='sample'&&track.sampleMasterPermission!=='approved')blockers.push('sample-master-permission-not-approved')
      if(track.sampleCompositionPermission!=='approved')blockers.push('sample-composition-permission-not-approved')
      if(!clean(track.sampleDocumentRef))warnings.push('sample-clearance-document-reference-missing')
    }
    if(track.pro==='none')warnings.push('no-pro-selected')
    if(!clean(track.isrc))warnings.push('isrc-not-yet-assigned')
    if(track.aiElements!=='none'&&!clean(track.aiConsentNotes))warnings.push('ai-provenance-consent-notes-missing')
    return {status:blockers.length?'RED':warnings.length?'YELLOW':'GREEN',blockers,warnings,writerSplitTotal:total}
  }
  function releaseReadiness(){
    const blockers=[],warnings=[]
    if(!clean(state.albumTitle))blockers.push('missing-album-title')
    if(!clean(state.primaryArtist))blockers.push('missing-release-primary-artist')
    if(!state.tracks.length)blockers.push('no-tracks')
    if(!clean(state.artworkFileName))blockers.push('missing-artwork-file')
    if(state.artworkRights!=='approved')blockers.push('artwork-rights-not-approved')
    const tracks=state.tracks.map(t=>({id:t.id,title:t.title,...trackReadiness(t)}))
    tracks.forEach((r,i)=>r.blockers.forEach(b=>blockers.push(`track-${i+1}:${b}`)))
    tracks.forEach((r,i)=>r.warnings.forEach(w=>warnings.push(`track-${i+1}:${w}`)))
    return {status:blockers.length?'RED':warnings.length?'YELLOW':'GREEN',blockers,warnings,tracks}
  }
  function proPrep(track){return {workTitle:track.title,writers:(track.writers||[]).map(w=>({name:w.name,split:num(w.split),pro:w.pro||track.pro,ipi:w.ipi||''})),publishers:track.publishers||[],artist:track.primaryArtist,performers:track.featuredArtists,workType:track.sampleStatus==='sample'?'sampled-work':track.rightsType,authorizedSubmissionRequired:true,submissionPerformed:false}}
  function sampleClearancePrep(track){
    const usesThirdParty=track.sampleStatus==='sample'||track.sampleStatus==='interpolation'
    return {trackTitle:track.title,type:track.sampleStatus,sourceWorkOrRecording:track.sampleSource,usesThirdPartyMaterial:usesThirdParty,masterUse:{required:track.sampleStatus==='sample',status:track.sampleMasterPermission},compositionPublishing:{required:usesThirdParty,status:track.sampleCompositionPermission},agreementReference:track.sampleDocumentRef,writersAndSplits:track.writers||[],releaseBlocked:usesThirdParty&&((track.sampleStatus==='sample'&&track.sampleMasterPermission!=='approved')||track.sampleCompositionPermission!=='approved'),note:'Clearance requirements depend on the material and deal. TRYAMM records approvals and documents but does not grant permission or provide legal clearance.',submissionPerformed:false}
  }
  function copyrightPrep(){return {albumTitle:state.albumTitle,musicalWorks:state.tracks.map(t=>({title:t.title,writers:t.writers,compositionOwner:t.compositionOwner,lyricsIncluded:Boolean(clean(t.lyrics))})),soundRecordings:state.tracks.map(t=>({title:t.title,primaryArtist:t.primaryArtist,performers:t.performers,producer:t.producer,masterOwner:t.masterOwner,audioFileName:t.audioFileName})),artwork:{fileName:state.artworkFileName,rights:state.artworkRights},note:'Musical works and sound recordings are distinct copyright claims. Choose the official Copyright Office filing path that matches ownership and album status.',submissionPerformed:false}}
  function distributorManifest(){return {release:{title:state.albumTitle,artist:state.primaryArtist,label:state.label,releaseDate:state.releaseDate,genre:state.genre,subgenre:state.subgenre,territory:state.territory,upc:state.upc,artworkFileName:state.artworkFileName},tracks:state.tracks.map((t,i)=>({trackNumber:i+1,title:t.title,version:t.version,primaryArtist:t.primaryArtist,featuredArtists:t.featuredArtists,writers:t.writers,producer:t.producer,explicit:t.explicit,isrc:t.isrc,audioFileName:t.audioFileName,rightsType:t.rightsType,coverLicense:t.coverLicense,sampleStatus:t.sampleStatus,masterOwner:t.masterOwner})),readiness:releaseReadiness(),externalSubmissionPerformed:false}}
  function royaltyMap(){return state.tracks.map(t=>({title:t.title,compositionPerformance:{lane:'PRO',provider:t.pro},compositionMechanical:{lane:'The MLC / publisher-admin as applicable'},masterInteractiveStreaming:{lane:'Distributor / label account'},masterNonInteractiveDigitalPerformance:{lane:'SoundExchange if eligible'},sync:{lane:'Direct/publisher/master approvals'},neighboringRights:{lane:'Territory-dependent'},writers:t.writers,masterOwner:t.masterOwner}))}
  function commercialReleasePack(){return {readiness:releaseReadiness(),sampleClearances:state.tracks.map(sampleClearancePrep),proRegistrations:state.tracks.map(proPrep),copyright:copyrightPrep(),distribution:distributorManifest(),royalties:royaltyMap(),nextLevel:[
    'Split-sheet signatures before release','Producer points / Letter of Direction where applicable','The MLC musical-work data check for self-administered publishing','SoundExchange performer + sound-recording-owner claim where eligible','Sync one-stop status: who can approve composition and master','Cue-sheet metadata for film/TV placements','Neighboring-rights collection by territory','YouTube/UGC Content ID eligibility and conflicts','DDEX-ready metadata mapping for future distributor integrations','ISRC/UPC assignment source and ownership record','Session-musician and featured-artist releases','Artwork/photo/model releases','AI-assisted/generated element provenance and performer consent','Clean, instrumental, a cappella, TV mix and stems inventory','Dolby Atmos/spatial master slots only when real masters exist','Catalog version history and checksum/provenance','Merch bundle + LIVE launch + Reel promo plan'
  ],externalSubmissions:false}}
  function csv(){const q=v=>'"'+String(v??'').replaceAll('"','""')+'"';const rows=[['Track','Title','Version','Primary Artist','Featured Artists','Writers','Writer Splits','PRO','IPI/CAE','ISRC','ISWC','Master Owner','Composition Owner','Producer','Mix Engineer','Mastering Engineer','Explicit','Rights Type','Sample Status','Audio File']];state.tracks.forEach((t,i)=>rows.push([i+1,t.title,t.version,t.primaryArtist,t.featuredArtists,(t.writers||[]).map(w=>w.name).join('; '),(t.writers||[]).map(w=>`${w.name}:${num(w.split)}%`).join('; '),t.pro,t.ipi,t.isrc,t.iswc,t.masterOwner,t.compositionOwner,t.producer,t.mixEngineer,t.masteringEngineer,t.explicit?'yes':'no',t.rightsType,t.sampleStatus,t.audioFileName]));return rows.map(r=>r.map(q).join(',')).join('\n')}
  function credits(){return [state.albumTitle||'Untitled Album',`Primary Artist: ${state.primaryArtist||''}`,`Label/Imprint: ${state.label||''}`,'',...state.tracks.flatMap((t,i)=>[`${i+1}. ${t.title||'Untitled'}`,`Primary Artist: ${t.primaryArtist}`,`Featured: ${t.featuredArtists}`,`Written by: ${(t.writers||[]).map(w=>`${w.name} (${num(w.split)}%)`).join(', ')}`,`Produced by: ${t.producer}`,`Mixed by: ${t.mixEngineer}`,`Mastered by: ${t.masteringEngineer}`,`Performers: ${t.performers}`,`Master owner: ${t.masterOwner}`,`Composition owner: ${t.compositionOwner}`,''])].join('\n')}
  function reset(){state=defaultRelease();save();return snapshot()}
  window.TRYAMMStudioRelease={version:VERSION,load:snapshot,save,setRelease,addTrack,updateTrack,removeTrack,trackReadiness,releaseReadiness,proPrep,sampleClearancePrep,copyrightPrep,distributorManifest,royaltyMap,commercialReleasePack,csv,credits,reset}
  save()
  function injectNextLevel(){
    if(!location.pathname.includes('studio-release')||document.getElementById('tryamm-next-level-release'))return
    const host=document.querySelector('.export');if(!host)return
    const sec=document.createElement('section');sec.id='tryamm-next-level-release';sec.className='section';sec.innerHTML='<h2>Next-Level Catalog Protection + Money Map</h2><p>Before a commercial release, check more than distribution: splits, producer points, mechanicals, master-performance royalties, sync, neighboring rights, UGC/Content ID, session releases, artwork permissions, AI provenance and alternate masters.</p><div class="toolbar"><button class="action" id="samplePackBtn" type="button">SAMPLE CLEARANCE PACK</button><button class="action" id="commercialPackBtn" type="button">FULL RELEASE PACK</button></div><div class="result" id="nextLevelPreview" style="margin-top:8px">No external registration or clearance is performed automatically.</div>'
    host.insertAdjacentElement('afterend',sec)
    sec.querySelector('#samplePackBtn').onclick=()=>{const current=window.TRYAMMStudioRelease.load().tracks[0];sec.querySelector('#nextLevelPreview').textContent=JSON.stringify(window.TRYAMMStudioRelease.sampleClearancePrep(current),null,2)}
    sec.querySelector('#commercialPackBtn').onclick=()=>{sec.querySelector('#nextLevelPreview').textContent=JSON.stringify(window.TRYAMMStudioRelease.commercialReleasePack(),null,2)}
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',injectNextLevel,{once:true}):injectNextLevel()
  window.dispatchEvent(new CustomEvent('tryamm:studio-release-ready',{detail:{version:VERSION,features:['album-metadata','bmi-ascap-prep','sample-clearance-gate','sample-clearance-pack','copyright-prep','distrokid-ready-manifest','mlc-royalty-lane','soundexchange-royalty-lane','sync-neighboring-rights-content-id-checklist','csv-json-credits-export'],externalSubmissions:false}}))
})()