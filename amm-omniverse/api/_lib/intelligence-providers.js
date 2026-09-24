const truthy=value=>String(value||'').toLowerCase()==='true';

export const STREETVERSE_INTELLIGENCE_LANES=[
  'local_chicago',
  'us_national',
  'africa_nigeria',
  'brics_emerging_markets',
  'global_international',
  'business_funding',
  'creator_economy',
  'mobility_logistics',
  'weather_environment',
  'public_safety',
  'sports_culture',
  'streetverse_missions',
];

export const STREETVERSE_NEWS_DESKS=[
  'local_news',
  'national_news',
  'international_news',
  'entertainment',
  'weather',
  'traffic',
  'sports',
  'business',
  'community',
  'public_safety',
  'creator_culture',
];

export function soundThinkingProviderStatus(){
  const enabled=truthy(process.env.SOUNDTHINKING_PARTNER_ENABLED);
  const configured=Boolean(process.env.SOUNDTHINKING_API_BASE_URL&&process.env.SOUNDTHINKING_API_TOKEN);
  const webhookConfigured=Boolean(process.env.SOUNDTHINKING_WEBHOOK_SECRET);
  const contractVerified=truthy(process.env.SOUNDTHINKING_CONTRACT_VERIFIED);
  const retentionVerified=truthy(process.env.SOUNDTHINKING_RETENTION_VERIFIED);
  const purposeVerified=truthy(process.env.SOUNDTHINKING_PURPOSE_LIMIT_VERIFIED);
  const certified=enabled&&configured&&webhookConfigured&&contractVerified&&retentionVerified&&purposeVerified;
  return {
    id:'soundthinking-shotspotter',
    label:'SoundThinking ShotSpotter partner feed',
    lane:'public_safety',
    desk:'public_safety',
    mode:certified?'certified':'provider_gated',
    live:false,
    configured,
    webhookConfigured,
    contractVerified,
    retentionVerified,
    purposeVerified,
    certified,
    releaseGates:[
      'licensed agency/partner access',
      'official vendor integration documentation',
      'server-side authentication',
      'signed event/webhook verification',
      'purpose limitation',
      'retention/deletion policy',
      'source and timestamp labeling',
      'production security review',
    ],
    prohibited:[
      'dashboard scraping',
      'private-person tracking',
      'private plate publication',
      'camera/police avoidance routing',
      'claiming live coverage before certification',
    ],
  };
}

export function globalNewsProviderStatus(){
  const configured=Boolean(process.env.OMNI_NEWS_PROVIDER_URL&&process.env.OMNI_NEWS_PROVIDER_KEY);
  const licenseVerified=truthy(process.env.OMNI_NEWS_LICENSE_VERIFIED);
  const retentionVerified=truthy(process.env.OMNI_NEWS_RETENTION_VERIFIED);
  const certified=configured&&licenseVerified&&retentionVerified;
  return {
    id:'omni-news-global',
    label:'OmniNews global/international provider',
    lanes:['us_national','africa_nigeria','brics_emerging_markets','global_international','business_funding','creator_economy','sports_culture'],
    desks:['national_news','international_news','entertainment','sports','business','creator_culture'],
    mode:certified?'adapter_ready':'provider_gated',
    live:false,
    configured,
    licenseVerified,
    retentionVerified,
    releaseGates:[
      'commercial/source license',
      'attribution rules',
      'rate limits',
      'server ingestion',
      'dedupe/provenance',
      'verification/editorial workflow',
      'retention policy',
    ],
  };
}

export function weatherProviderStatus(){
  const configured=Boolean(process.env.OMNI_WEATHER_PROVIDER_URL&&process.env.OMNI_WEATHER_PROVIDER_KEY);
  const licenseVerified=truthy(process.env.OMNI_WEATHER_LICENSE_VERIFIED);
  return {
    id:'omni-weather',
    label:'Weather + environment provider',
    lanes:['weather_environment','local_chicago','global_international'],
    desks:['weather'],
    mode:configured&&licenseVerified?'adapter_ready':'provider_gated',
    live:false,
    configured,
    licenseVerified,
    releaseGates:['provider terms','timestamps','attribution','severe-weather verification','retention policy'],
  };
}

export function intelligenceProviderStatus(){
  return {
    oracle:'TRYAMM StreetVerse Global Oracle',
    liveAuthority:false,
    dataPolicy:'public, licensed, consented, aggregated or simulated only',
    lanes:STREETVERSE_INTELLIGENCE_LANES,
    desks:STREETVERSE_NEWS_DESKS,
    providers:[
      globalNewsProviderStatus(),
      weatherProviderStatus(),
      soundThinkingProviderStatus(),
      {
        id:'civic-open-data',
        label:'Civic/public open data',
        lanes:['local_chicago','mobility_logistics','weather_environment','public_safety'],
        desks:['local_news','traffic','weather','community','public_safety'],
        mode:'registered',
        live:false,
        releaseGates:['dataset terms','freshness labeling','privacy review','server normalization'],
      },
    ],
  };
}
