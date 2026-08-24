export type NetworkHub={id:string;name:string;scope:string;features:string[];access:string[];status:'source-created'|'wire'|'provider-gated'}

export const NETWORK_HUBS:NetworkHub[]=[
  {
    id:'servants-of-christ-network',
    name:'Servants of Christ Network',
    scope:'Faith, worship, teaching, community, Sabbath/New Moon programming, study, youth/family and global fellowship',
    features:['LIVE worship','sermons + teaching','Bible/Ethiopian canon study','podcasts','music','debates + Q&A','community rooms','events','donations/tithes intent','Holo Clips + Reels','OTT channel','creator publishing','global translation','sign-language support','accessibility-first participation'],
    access:['captions','transcripts','audio description','speech-to-text','text-to-speech','sign-language hub','one-hand mode','switch access','voice navigation','large targets','reduced motion','plain language','OmniWear non-invasive controls'],
    status:'wire'
  },
  {
    id:'all-american-network',
    name:'All American Network',
    scope:'Global media, news, creators, sports, entertainment, marketplace, education, local business and community distribution',
    features:['LIVE channels','news + local TV','sports','creator shows','podcasts','music','movies + Omni Box','marketplace commerce','business network','jobs + education','GameVerse broadcasts','Holo Clips + Reels','cross-platform sharing','global gift economy','regional channels','advertising + sponsorship intents'],
    access:['global language runtime','captions','transcripts','audio description','sign-language hub','screen reader','voice navigation','one-hand mode','switch access','large targets','reduced motion','OmniWear non-invasive controls'],
    status:'wire'
  }
]
