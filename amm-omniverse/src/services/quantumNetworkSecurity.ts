export type QuantumNetworkMode='off'|'observe'|'provider-gated'|'active'
export type QuantumNetworkCapability={id:string;label:string;status:'ready'|'provider-required'|'native-app-required'|'planned';detail:string}

export const QUANTUM_NETWORK_PROFILE={
  productName:'TRYAMM Quantum Network',
  description:'A post-quantum-ready security policy and provider-adapter layer. It does not claim that ordinary Wi-Fi or a browser connection is a literal quantum network.',
  standards:{
    keyEstablishment:'NIST FIPS 203 / ML-KEM',
    signatures:'NIST FIPS 204 / ML-DSA',
    alternateSignatures:'NIST FIPS 205 / SLH-DSA',
    wifiBaseline:'WPA3-class protected local networking where the device/router supports it',
  },
  rules:[
    'Never expose VPN private keys, service-role credentials or tunnel secrets to browser JavaScript.',
    'Browser mode may inspect posture and request a secure route, but cannot silently create an OS-level VPN tunnel.',
    'Native mobile/desktop adapters must use audited provider SDKs or operating-system VPN APIs.',
    'Post-quantum algorithms must come from maintained cryptographic libraries/providers; do not hand-roll ML-KEM or ML-DSA.',
    'Fall back safely when a provider or device cannot satisfy the requested security profile.',
  ],
} as const

export const QUANTUM_NETWORK_CAPABILITIES:QuantumNetworkCapability[]=[
  {id:'qvpn-policy',label:'Quantum VPN policy',status:'ready',detail:'Application routing policy, provider gate and kill-switch contract can be enforced by TRYAMM.'},
  {id:'qvpn-tunnel',label:'Quantum VPN tunnel',status:'native-app-required',detail:'A real device VPN tunnel requires a native OS/provider adapter; the web app alone cannot install one.'},
  {id:'pqc-handshake',label:'Post-quantum handshake',status:'provider-required',detail:'Target hybrid/PQC key establishment using a provider/library that implements standardized ML-KEM.'},
  {id:'qwifi-posture',label:'Quantum WiFi posture',status:'ready',detail:'Detect/report network trust state and recommend protected local networking; no claim of literal quantum radio.'},
  {id:'wifi-control',label:'Wi-Fi router control',status:'provider-required',detail:'Requires router/ISP/device-management integration and explicit user/admin authorization.'},
  {id:'pk-secure-route',label:'PK/LIVE secure-route policy',status:'ready',detail:'PK backchannel, LIVE signaling and authenticated API traffic can request the strongest available secure route.'},
]

export type QuantumNetworkState={mode:QuantumNetworkMode;vpnProviderConfigured:boolean;nativeAdapterAvailable:boolean;trustedNetwork:boolean;pqcProviderAvailable:boolean}

export function evaluateQuantumNetwork(state:QuantumNetworkState){
  const blockers:string[]=[]
  if(state.mode==='active'&&!state.vpnProviderConfigured)blockers.push('VPN provider is not configured')
  if(state.mode==='active'&&!state.nativeAdapterAvailable)blockers.push('Native VPN adapter is not available')
  if(state.mode==='active'&&!state.pqcProviderAvailable)blockers.push('Post-quantum provider is not available')
  if(!state.trustedNetwork)blockers.push('Current network is not marked trusted')
  return {ok:blockers.length===0,blockers,recommendation:blockers.length?'Remain in observe/provider-gated mode; do not claim an active quantum VPN.':'Security posture satisfies the configured policy.'}
}

export const QUANTUM_WIFI_POLICY=[
  'Prefer WPA3-capable protected networks when available.',
  'Treat open/public Wi-Fi as untrusted even when the app uses HTTPS.',
  'Use authenticated APIs, short-lived sessions and server authorization independent of network trust.',
  'For sensitive account/payment/admin actions, require step-up authentication rather than trusting Wi-Fi identity.',
  'A future router/ISP integration may expose guest isolation, device inventory and policy controls only with explicit authorization.',
] as const
