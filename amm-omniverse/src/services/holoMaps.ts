export type GeoPoint={lat:number;lng:number}
export type RouteResult={distanceMeters:number;durationSeconds:number;polyline?:string;provider:'google';simulation:false}

const apiBase=import.meta.env.VITE_API_URL||''
async function api<T>(path:string,body:unknown):Promise<T>{
  const r=await fetch(`${apiBase}${path}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)})
  const data=await r.json().catch(()=>({}))
  if(!r.ok)throw new Error(data?.error||`Request failed: ${r.status}`)
  return data as T
}

// Keys stay on the backend. Browser code never calls Google web-service endpoints directly.
export async function geocodeAddress(address:string){
  if(!address.trim())throw new Error('Address is required.')
  return api<{location:GeoPoint;placeId?:string;formattedAddress?:string;provider:'google'}>('/api/mobility/geocode',{address})
}
export async function computeRideRoute(origin:GeoPoint,destination:GeoPoint){
  return api<RouteResult>('/api/mobility/route',{origin,destination})
}
