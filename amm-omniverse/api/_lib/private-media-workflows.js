// Pilot-purpose boundaries for private TRYAMM media.
// Media published to the wider network requires separate editorial approval.
// These restrictions are enforced at BOTH upload and publish endpoints; a
// forged client composition cannot authorize an upload or public release.
export const PRIVATE_MEDIA_SOURCES=new Set([
 'isaiah-ai-tv-audition','aniyah-64-track-studio','omnibox-storyboard-video'
])
const SIZE={audition:60*1024*1024,audio:50*1024*1024,storyboard:20*1024*1024}
const video=new Set(['video/mp4','video/webm'])
const audio=new Set(['audio/mp4','audio/webm'])
export const isProtectedPrivateMedia=media=>
 PRIVATE_MEDIA_SOURCES.has(String(media?.manifest?.composition?.source||''))
export function verifyPrivateMediaIntent({composition,contentType,sizeBytes}){
 const source=String(composition?.source||'')
 if(!PRIVATE_MEDIA_SOURCES.has(source))return {ok:true,source:null}
 const bytes=Number(sizeBytes)
 if(!Number.isSafeInteger(bytes)||bytes<1)return {ok:false,error:'invalid_media_size'}
 if(source==='isaiah-ai-tv-audition'){
  if(!video.has(contentType)||bytes>SIZE.audition)return {ok:false,error:'audition_video_format_or_size_invalid'}
  if(composition.reviewOnly!==true||composition.claimedAdult!==true||composition.claimedRights!==true)
   return {ok:false,error:'private_adult_audition_consent_required'}
 }else if(source==='aniyah-64-track-studio'){
  if(!audio.has(contentType)||bytes>SIZE.audio)return {ok:false,error:'studio_audio_format_or_size_invalid'}
  if(composition.releaseApproved!==false)return {ok:false,error:'studio_take_must_remain_private'}
 }else{
  if(!video.has(contentType)||bytes>SIZE.storyboard)return {ok:false,error:'storyboard_video_format_or_size_invalid'}
  if(composition.kind!=='preview-only'||composition.finalFilm!==false)
   return {ok:false,error:'storyboard_preview_must_remain_private'}
 }
 return {ok:true,source}
}
