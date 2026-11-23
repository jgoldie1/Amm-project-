export const fps = 24
const rt = seconds => ({OTIO_SCHEMA:'RationalTime.1',rate:fps,value:seconds*fps})
const range = (start, duration) => ({OTIO_SCHEMA:'TimeRange.1',start_time:rt(start),duration:rt(duration)})
function track(name,kind,children) {
  return {OTIO_SCHEMA:'Track.1',name,kind,children,source_range:null,metadata:{},effects:[],markers:[]}
}
function clip(name,file,start,duration,metadata) {
  return {OTIO_SCHEMA:'Clip.1',name,metadata,effects:[],markers:[],source_range:range(start,duration),
    media_reference:{OTIO_SCHEMA:'ExternalReference.1',name:file,target_url:encodeURIComponent(file),available_range:null,metadata:{}}}
}
export function timeline(title,shots,mixName,mixDuration=Infinity) {
  const video=shots.map(s=>clip(s.scene,s.filename,s.start,s.seconds,{TRYAMM:{dialogue:s.line,speaker:s.speaker,shot:s.shot,illustration:s.illustration}}))
  const duration=shots.reduce((sum,s)=>sum+s.seconds,0)
  const mixSeconds=Math.min(mixDuration,duration)
  const audio=mixName?[clip('Dialogue and music mix',mixName,0,mixSeconds,{})]:shots.map(s=>clip(s.scene,s.filename,s.start,s.seconds,{}))
  if(mixName && mixSeconds<duration)audio.push({OTIO_SCHEMA:'Gap.1',name:'Silence',metadata:{},effects:[],markers:[],source_range:range(0,duration-mixSeconds)})
  return {OTIO_SCHEMA:'Timeline.1',name:title,metadata:{},global_start_time:rt(0),tracks:{
    OTIO_SCHEMA:'Stack.1',name:'Edit',metadata:{},source_range:null,effects:[],markers:[],children:[track('Picture','Video',video),track('Sound','Audio',audio)]}}
}
export function segmentArgs({width,height,shot,input,caption,hasAudio,part}) {
  const args=['-ss',String(shot.start),'-t',String(Math.min(shot.available,shot.seconds)),'-i',input,'-i',caption]
  if(!hasAudio)args.push('-f','lavfi','-i','anullsrc=r=48000:cl=stereo')
  const crop=shot.illustration?'crop=iw:trunc(ih*0.53/2)*2:0:trunc(ih*0.14/2)*2,':''
  const picture=crop+'scale='+width+':'+height+':force_original_aspect_ratio=decrease:force_divisible_by=2,pad='+width+':'+height+':(ow-iw)/2:(oh-ih)/2,setsar=1,fps=24,tpad=stop_mode=clone:stop_duration='+shot.seconds
  return [...args,'-filter_complex','[0:v:0]'+picture+'[pic];[pic][1:v:0]overlay=0:0,format=yuv420p[v]',
    '-map','[v]','-map',hasAudio?'0:a:0':'2:a:0','-af','aresample=48000,apad','-ac','2','-ar','48000',
    '-t',String(shot.seconds),'-c:v','libx264','-preset','ultrafast','-crf','23','-threads','1','-c:a','pcm_s16le',part]
}
export function finishArgs(hasMix,duration) {
  const args=['-f','concat','-safe','0','-i','parts.txt']
  if(hasMix)args.push('-i','mix')
  return [...args,'-map','0:v:0','-map',hasMix?'1:a:0':'0:a:0','-af','apad','-t',String(duration),'-c:v','copy','-c:a','aac','-ar','48000','-ac','2','-movflags','+faststart','output.mp4']
}
