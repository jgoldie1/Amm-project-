export default function handler(req,res){
  if(req.method!=='GET'){
    res.setHeader('Allow','GET')
    return res.status(405).json({error:'Method not allowed'})
  }
  const has=(...names)=>names.some(name=>Boolean(process.env[name]))
  const providers={
    cesium:{configured:has('CESIUM_ION_TOKEN','VITE_CESIUM_ION_TOKEN'),purpose:'3d-globe-terrain-tiles'},
    googleMaps:{configured:has('GOOGLE_MAPS_API_KEY','VITE_GOOGLE_MAPS_API_KEY'),purpose:'maps-places-satellite'},
    weather:{configured:has('OPENWEATHER_API_KEY','WEATHER_API_KEY','TOMORROW_IO_API_KEY','VISUAL_CROSSING_API_KEY'),purpose:'global-weather'},
    aviation:{configured:has('OPENSKY_CLIENT_ID','OPENSKY_CLIENT_SECRET','OPENSKY_USERNAME','OPENSKY_PASSWORD','AVIATIONSTACK_API_KEY','AIRLABS_API_KEY'),purpose:'civil-aircraft'},
    marineTraffic:{configured:has('AISSTREAM_API_KEY','MARINETRAFFIC_API_KEY','AIS_API_KEY'),purpose:'ships-ais'},
    wildfire:{configured:has('NASA_FIRMS_MAP_KEY','FIRMS_MAP_KEY'),purpose:'active-fire'},
    satelliteImagery:{configured:true,publicBaseline:true,purpose:'nasa-gibs-compatible-imagery'},
    earthquakes:{configured:true,publicBaseline:true,purpose:'usgs-compatible-earthquake-feed'},
    usWeatherRadar:{configured:true,publicBaseline:true,purpose:'noaa-compatible-us-radar'}
  }
  res.setHeader('Cache-Control','no-store')
  return res.status(200).json({
    configured:Boolean(providers.cesium.configured||providers.googleMaps.configured),
    liveFeedsConfigured:Object.values(providers).filter(p=>p.configured&&!p.publicBaseline).length,
    providers,
    privacy:{exactGpsPersisted:false,providerSecretsExposed:false},
    mode:'provider-gated'
  })
}
