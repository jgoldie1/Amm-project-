import {createContext,useCallback,useContext,useEffect,useState,type ReactNode} from 'react'
import {TEMPLATE_CATALOG} from './templateCatalog'
import {TEMPLATE_BENEFITS} from './templateBenefits'
import {TEMPLATE_DEMOS} from './templateDemos'
import {validateTemplateListing,type TemplateListing} from '../../api/_lib/template-listing.js'
export const BUILTIN_TEMPLATES:TemplateListing[]=TEMPLATE_CATALOG.map(t=>({...t,...TEMPLATE_BENEFITS[t.id],priceCents:4900,demo:TEMPLATE_DEMOS[t.id]}))
const CatalogContext=createContext({templates:BUILTIN_TEMPLATES,notice:'',refresh:async()=>{}})
export function TemplateCatalogProvider({children}:{children:ReactNode}){
 const [templates,setTemplates]=useState(BUILTIN_TEMPLATES),[notice,setNotice]=useState('')
 const refresh=useCallback(async()=>{
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000)
  try{
   const response=await fetch('/api/templates/catalog',{signal:controller.signal,cache:'no-store'}),data=await response.json()
   if(!response.ok||!data.ok||!Array.isArray(data.templates))throw new Error('unavailable')
   const validated:TemplateListing[]=[],ids=new Set(BUILTIN_TEMPLATES.map(t=>t.id))
   for(const value of data.templates){const result=validateTemplateListing(value);if(result.ok&&!ids.has(result.data.id)){ids.add(result.data.id);validated.push({...result.data,revision:Number.isSafeInteger(value.revision)?value.revision:undefined})}}
   setTemplates([...BUILTIN_TEMPLATES,...validated]);setNotice('')
  }catch{setNotice('The additional-listing service is temporarily unavailable. Built-in templates and demos are available.')}
  finally{clearTimeout(timer)}
 },[])
 useEffect(()=>{void refresh()},[refresh])
 return <CatalogContext.Provider value={{templates,notice,refresh}}>{children}</CatalogContext.Provider>
}
export const useTemplateCatalog=()=>useContext(CatalogContext)
