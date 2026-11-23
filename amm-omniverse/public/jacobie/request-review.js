const form=document.querySelector('#request')
const status=document.querySelector('#feedback')
const draft=document.querySelector('#draft')
const subject=form.elements.subject
const details=form.elements.details
document.querySelector('#ask').onclick=async event=>{
  if(!form.reportValidity())return
  event.target.disabled=true
  status.textContent='Requesting a Middleverse draft…'
  try{
    const response=await fetch('/api/ai/answer',{method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(30000),body:JSON.stringify({question:'Act as TRYAMM Middleverse. Summarize the following customer support request for a human. Give one clarifying question. Do not claim review or submission or make a decision. Request: '+details.value,history:[]})})
    if(!response.ok)throw Error()
    const result=await response.json()
    if(!result.ok||result.degraded||!result.answer)throw Error()
    draft.value=String(result.answer).slice(0,2200)
    status.textContent='AI draft ready. Edit it before requesting human review.'
  }catch{status.textContent='AI review is unavailable. You can still prepare the request for a human.'}
  finally{document.querySelector('#ask').disabled=false}
}
form.onsubmit=event=>{
  event.preventDefault()
  try{
    sessionStorage.setItem('jacobie.support.handoff',JSON.stringify({subject:subject.value,description:[details.value,draft.value].filter(Boolean).join('\n\nReviewed planning draft:\n')}))
    location.assign('/business-app.html#onboarding')
  }catch{status.textContent='Draft transfer unavailable. Copy your text and open TRYAMM support below.'}
}
