import { createMediaCatalogItem, isBackendConfigured } from '../services/omniverseApi'

type MediaDraft={
  id:string
  title:string
  caption:string
  destinations:string[]
  createdAt:string
  source:string
  status:string
}

let installed=false

export function installMediaCloudBridge(){
  if(installed||typeof window==='undefined')return
  installed=true

  window.addEventListener('tryamm:media-publish-queued',(event:Event)=>{
    const draft=(event as CustomEvent<MediaDraft>).detail
    if(!draft||!isBackendConfigured())return

    void createMediaCatalogItem({
      title:draft.title||'Untitled TRYAMM Media',
      media_type:'reel',
      caption:draft.caption||'',
      destinations:Array.isArray(draft.destinations)?draft.destinations:[],
      source:draft.source||'media-studio-beta',
      visibility:'private',
      client_draft_id:draft.id,
    }).then(result=>{
      window.dispatchEvent(new CustomEvent('tryamm:media-cloud-saved',{detail:{draft,result}}))
    }).catch(error=>{
      window.dispatchEvent(new CustomEvent('tryamm:media-cloud-error',{detail:{draft,error:error instanceof Error?error.message:String(error)}}))
    })
  })
}
