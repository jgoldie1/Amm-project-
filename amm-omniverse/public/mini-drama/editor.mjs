export function productionFiles(title, shots) {
  let elapsed = 0
  const time = seconds => new Date(seconds * 1000).toISOString().slice(11,23)
  const cues = []
  const scenes = []
  for (const shot of shots) {
    const end = elapsed + Number(shot.seconds)
    if (!Number.isInteger(end) || end <= elapsed || end >= 86400) throw Error('Enter a positive whole number of seconds for each shot.')
    const line = shot.line.trim()
    if (!shot.scene.trim() || !shot.shot.trim()) throw Error('Each shot needs a scene heading and camera direction.')
    if (line) cues.push(time(elapsed)+' --> '+time(end)+'\n'+(shot.speaker.trim()?shot.speaker.trim()+': ':'')+line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\s+/g,' '))
    scenes.push('.'+shot.scene.trim()+'\n\n'+shot.shot.trim()+(line?'\n\n@'+(shot.speaker.trim()||'VOICE').toUpperCase()+'\n'+line:''))
    elapsed = end
  }
  return {fountain:'Title: '+title+'\n\n'+scenes.join('\n\n')+'\n',vtt:'WEBVTT\n\n'+cues.join('\n\n')+'\n',seconds:elapsed}
}
