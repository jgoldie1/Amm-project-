export type NetworkId='all-american-network'|'servants-of-christ-network'|'isaiah-ai-tv'
export type XRMode='phone-tv'|'ar'|'mr'|'vr'
export type RuntimeState='implemented'|'adapter-gated'|'provider-gated'

export type NetworkRuntime={
  id:NetworkId
  name:string
  freeTv:boolean
  editorial:string
  channels:string[]
  xr:Record<XRMode,RuntimeState>
  commerce:boolean
  newsProvenance:boolean
}

export const NETWORK_RUNTIME:NetworkRuntime[]=[
  {
    id:'all-american-network',
    name:'All American Network',
    freeTv:true,
    editorial:'General creator, entertainment, sports, education, business and sourced public-information network.',
    channels:['All American News','All American Sports','All American Marketplace LIVE','TRYAMM Podcasts','All American University','StreetVerse LIVE'],
    xr:{'phone-tv':'implemented',ar:'adapter-gated',mr:'adapter-gated',vr:'adapter-gated'},
    commerce:true,
    newsProvenance:true,
  },
  {
    id:'servants-of-christ-network',
    name:'Servants of Christ Network',
    freeTv:true,
    editorial:'Faith, worship, teaching, Sabbath/New Moon, study, family, music and sourced community information.',
    channels:['Servants of Christ LIVE','Set-Apart Study','Servants Community News','Faith Music','Youth + Family'],
    xr:{'phone-tv':'implemented',ar:'adapter-gated',mr:'adapter-gated',vr:'adapter-gated'},
    commerce:false,
    newsProvenance:true,
  },
  {
    id:'isaiah-ai-tv',
    name:'Isaiah AI TV',
    freeTv:true,
    editorial:'Creator and youth-safe entertainment network centered on StarVerse, showcases, games and original programming.',
    channels:['StarVerse','Creator Showdown','Holo Game Night','Talent Showcase'],
    xr:{'phone-tv':'implemented',ar:'adapter-gated',mr:'adapter-gated',vr:'adapter-gated'},
    commerce:true,
    newsProvenance:false,
  },
]

export const FOUNDER_PRICE_MARKERS={annual_11_25:{amount:11.25,currency:'USD',period:'year',product:null as string|null,status:'unmapped-founder-marker' as const}}

export const EVENT_OUTPUTS=['streetverse','game','mission','live','pk','reel','news','podcast','tv','business','holo-labs','education','ar','mr','vr','history','legacy','quantum-time'] as const
