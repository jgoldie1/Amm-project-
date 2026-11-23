// Only an explicitly approved take is returned to the shared export planner.
export function installReveal(group, replacement, trim, shot, lengthOf) {
  const panel=document.createElement('section')
  panel.innerHTML=`<h3>Direct the eight-second reveal</h3>
    <p>The manga take uses original illustrated stand-ins. For a real performance, select footage you have permission to use. You can also import an animation from Poyo or a StreetVerse character capture.</p>
    <button type="button" data-manga>Preview manga take</button>
    <label>Preview your filmed or animated take<input type="file" accept="video/*"></label>
    <video controls playsinline hidden></video>
    <button type="button" data-approve disabled>Approve take for both exports</button>
    <button type="button" data-reset disabled>Restore original reveal</button>
    <p role="status"></p><a href="/creatorverse?shot=two-mics" target="_blank" rel="noopener">Choose an animation style in Poyo AI Studio</a>`
  replacement.parentElement.remove()
  trim.parentElement.remove()
  group.append(panel)
  const preview=panel.querySelector('video'), approve=panel.querySelector('[data-approve]')
  const reset=panel.querySelector('[data-reset]'), message=panel.querySelector('[role=status]')
  let candidate, approved, url, revision=0
  async function inspect(getFile) {
    const current=++revision
    candidate=null
    approve.disabled=true
    preview.hidden=true
    preview.removeAttribute('src')
    preview.load()
    if(url)URL.revokeObjectURL(url)
    try {
      const file=await getFile()
      if(current!==revision||!file)return
      if(await lengthOf(file,'video')+.025<8)throw Error('Choose a take at least eight seconds long.')
      if(current!==revision)return
      candidate=file
      url=URL.createObjectURL(file)
      preview.src=url
      preview.hidden=false
      approve.disabled=false
      message.textContent='Preview the first eight seconds, then approve to use this take.'
    }catch(e){if(current===revision)message.textContent=e.message}
  }
  preview.ontimeupdate=()=>{if(preview.currentTime>=8 && !preview.paused){preview.pause();preview.currentTime=0}}
  panel.querySelector('[data-manga]').onclick=()=>inspect(async()=>{
    const response=await fetch('./reveal-manga.mp4')
    if(!response.ok)throw Error('Could not load the manga take.')
    return new File([await response.blob()],'reveal-manga.mp4',{type:'video/mp4'})
  })
  const picker=panel.querySelector('input')
  picker.onchange=()=>inspect(()=>picker.files[0])
  approve.onclick=()=>{
    if(!candidate)return
    if(shot.seconds!==8){message.textContent='Set shot four to eight seconds before approving.';return}
    approved=candidate
    reset.disabled=false
    message.textContent='Approved for both exports: '+approved.name
  }
  reset.onclick=()=>{approved=null;reset.disabled=true;message.textContent='Both exports now use the original pilot reveal.'}
  return ()=>approved
}
