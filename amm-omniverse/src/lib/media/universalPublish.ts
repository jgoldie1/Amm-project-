export const TRYAMM_PUBLISH_DESTINATIONS=['reel','omnibox','all-american-network','servants-of-christ-network','creator-profile'] as const
export type TryammPublishDestination=typeof TRYAMM_PUBLISH_DESTINATIONS[number]

export const TRYAMM_DESTINATION_LABELS:Record<TryammPublishDestination,string>={
 reel:'Reels',
 omnibox:'OmniBox',
 'all-american-network':'All American Network',
 'servants-of-christ-network':'Servants of Christ Network',
 'creator-profile':'Creator Profile'
}

export type UniversalPublishRequest={
 mediaId:string
 destinations:TryammPublishDestination[]
 source:string
 caption?:string
 context?:Record<string,unknown>
}

export function normalizePublishDestinations(values:readonly string[]):TryammPublishDestination[]{
 const allowed=new Set<string>(TRYAMM_PUBLISH_DESTINATIONS)
 return [...new Set(values.filter(v=>allowed.has(v)))] as TryammPublishDestination[]
}

export function universalPublishEvent(request:UniversalPublishRequest){
 const destinations=normalizePublishDestinations(request.destinations)
 if(!request.mediaId)throw new Error('mediaId is required')
 if(!destinations.length)throw new Error('At least one publish destination is required')
 return new CustomEvent('tryamm:universal-publish-request',{detail:{...request,destinations}})
}
