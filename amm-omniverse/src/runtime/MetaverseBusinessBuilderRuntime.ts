export type BusinessStage='idea'|'validate'|'source'|'sample'|'brand'|'storefront'|'launch'|'grow'
export type BusinessType='product'|'service'|'creator'|'food'|'fashion'|'beauty'|'tech'|'media'|'local'|'global'

export type BusinessBuilderState={
  id:string
  name:string
  type:BusinessType
  stage:BusinessStage
  city:string
  country:string
  targetCustomer:string
  budget:number|null
  maxMOQ:number|null
  preferredMOQ:number|null
  sampleFirst:boolean
  privateLabel:boolean
  localFulfillment:boolean
  globalFulfillment:boolean
  supplierIds:string[]
  storefrontReady:boolean
  launchReady:boolean
  missionsCompleted:string[]
}

const KEY='tryamm_metaverse_business_builder_v1'
let installed=false

const MISSIONS=[
  {id:'idea',stage:'idea',label:'Choose your business',description:'Define what you sell, who it serves and where you want to launch.'},
  {id:'validate',stage:'validate',label:'Validate demand',description:'Use NiaSource and OmniBI to test audience, city, category and demand signals.'},
  {id:'source-low-moq',stage:'source',label:'Find low-MOQ suppliers',description:'Filter Quantum Sourcing for verified suppliers that fit your budget, sample-first strategy and target MOQ.'},
  {id:'sample',stage:'sample',label:'Order samples',description:'Compare quality, lead time, landed cost and supplier score before committing.'},
  {id:'protect',stage:'sample',label:'Protect the deal',description:'Apply NDA/NNN/non-circumvention and deal-room controls where appropriate; legal templates require counsel review.'},
  {id:'brand',stage:'brand',label:'Build your brand',description:'Create name, packaging, content, creator assets and launch story.'},
  {id:'storefront',stage:'storefront',label:'Open your storefront',description:'Launch a virtual storefront in the current city and connect it to TRYAMM Marketplace.'},
  {id:'launch',stage:'launch',label:'Launch in the Living World',description:'Run creator events, local missions, promotions, delivery and customer engagement in StreetVerse.'},
  {id:'grow',stage:'grow',label:'Grow globally',description:'Use Global CityVerse to copy, localize or franchise the business into new countries and cities.'},
]

function defaultState():BusinessBuilderState{return {id:`biz-${Date.now()}`,name:'My TRYAMM Business',type:'product',stage:'idea',city:'Chicago',country:'United States',targetCustomer:'',budget:null,maxMOQ:100,preferredMOQ:25,sampleFirst:true,privateLabel:true,localFulfillment:true,globalFulfillment:false,supplierIds:[],storefrontReady:false,launchReady:false,missionsCompleted:[]}}
function load(){try{return {...defaultState(),...JSON.parse(localStorage.getItem(KEY)||'{}')} as BusinessBuilderState}catch{return defaultState()}}
function save(state:BusinessBuilderState){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function publish(state:BusinessBuilderState){save(state);window.dispatchEvent(new CustomEvent('tryamm:metaverse-business-state',{detail:{state,missions:MISSIONS,features:['low-moq','sample-first','private-label','supplier-verification','landed-cost','global-sourcing','local-sourcing','deal-protection','virtual-storefront','marketplace','creator-launch','local-fulfillment','global-fulfillment','city-expansion','franchise-ready','omnibi-insights']}}))}

export function installMetaverseBusinessBuilderRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  let state=load()
  queueMicrotask(()=>publish(state))
  window.addEventListener('tryamm:metaverse-business-request',()=>publish(state))
  window.addEventListener('tryamm:global-world-state',(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};state={...state,city:String(d.city||state.city),country:String(d.country||state.country)};publish(state)})
  window.addEventListener('tryamm:metaverse-business-update',(event:Event)=>{state={...state,...((event as CustomEvent<Partial<BusinessBuilderState>>).detail||{})};publish(state)})
  window.addEventListener('tryamm:metaverse-business-mission-complete',(event:Event)=>{const id=String((event as CustomEvent<any>).detail?.id||'');if(!id)return;state={...state,missionsCompleted:Array.from(new Set([...state.missionsCompleted,id]))};publish(state)})
  window.addEventListener('tryamm:metaverse-business-find-suppliers',()=>window.dispatchEvent(new CustomEvent('tryamm:quantum-sourcing-request')))
  window.addEventListener('tryamm:metaverse-business-open-insights',()=>window.dispatchEvent(new CustomEvent('tryamm:omnibi-open')))
  window.addEventListener('tryamm:metaverse-business-open-marketplace',()=>window.dispatchEvent(new CustomEvent('tryamm:marketplace-open',{detail:{source:'metaverse-business-builder',businessId:state.id}})))
}
