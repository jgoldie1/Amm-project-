export type MobileGate='ready'|'carrier-required'|'regulatory-required'|'hardware-required'|'partner-required'|'planned'
export type MobileCapability={id:string;label:string;gate:MobileGate;detail:string}

export const TRYAMM_MOBILE={
  brand:'TRYAMM Mobile',
  aliases:['All American Mobile','Holo Mobile'],
  model:'Branded MVNO + franchise/authorized retailer + future private-network/NTN orchestration',
  truth:'TRYAMM can build the software, customer experience, franchise operations, security and orchestration layer now. Real SIM/eSIM, numbering, talk/text/data, spectrum access and carrier-grade NTN require approved carrier/wholesale/regulatory partners.',
} as const

export const MOBILE_CAPABILITIES:MobileCapability[]=[
  {id:'subscriber-ui',label:'Subscriber dashboard',gate:'ready',detail:'Plans, lines, usage, devices, support, billing state and loyalty can be built in TRYAMM.'},
  {id:'franchise-os',label:'Franchise operating system',gate:'ready',detail:'Territories, stores, agents, leads, commissions, training, support cases and KPI dashboards.'},
  {id:'esim',label:'SIM/eSIM provisioning',gate:'carrier-required',detail:'Requires an approved MVNO/wholesale platform and provisioning credentials.'},
  {id:'numbers',label:'Real phone numbers + porting',gate:'carrier-required',detail:'Requires carrier numbering/porting systems and compliance operations.'},
  {id:'voice-sms-data',label:'Voice, SMS and mobile data',gate:'carrier-required',detail:'Requires a host mobile network or other authorized telecom provider.'},
  {id:'5g',label:'Quantum 5G experience',gate:'carrier-required',detail:'TRYAMM branding, QoS policy and telemetry may ride on an approved host 5G network; TRYAMM must not claim ownership of host spectrum/towers.'},
  {id:'wifi',label:'Quantum WiFi',gate:'ready',detail:'Secure-network posture, WPA3 preference, VPN policy, failover, device trust, family controls and HoloGPT assistance.'},
  {id:'ntn',label:'Satellite / 5G NTN',gate:'partner-required',detail:'Requires an NTN/satellite/carrier partner plus compatible devices, plans and geographic availability.'},
  {id:'private-network',label:'Campus/private 5G',gate:'partner-required',detail:'Future enterprise/franchise deployments may use authorized private-network partners and lawful spectrum arrangements.'},
  {id:'small-cells',label:'Partner small cells',gate:'regulatory-required',detail:'Deployment requires carrier coordination, site rights, power/backhaul, RF engineering, permits and lawful spectrum use.'},
  {id:'quantum-chip',label:'HoloFon Quantum Security Chip target',gate:'hardware-required',detail:'Design target for secure element/eSIM/PQC acceleration and device identity. A fabricated certified chip requires hardware, foundry, testing and certification partners.'},
  {id:'holofon',label:'HoloFon',gate:'hardware-required',detail:'Future TRYAMM handset integrating eSIM, secure element, camera/XR, AI copilot, creator tools and multi-network policy.'},
]

export const CONNECTION_ENGINE=[
  'Measure latency, jitter, packet loss and availability.',
  'Classify application traffic: call, LIVE, PK, movie upload, game, admin, payment or background sync.',
  'Select the strongest authorized path among cellular, trusted Wi-Fi, fixed wireless or approved NTN.',
  'Apply application QoS policy only where the underlying provider/device supports it.',
  'Fail over without duplicating money, ledger, messaging or World Memory writes.',
  'Record performance telemetry without exposing message content or secrets.',
] as const

export const RADIO_HUB={
  internetRadio:'READY: licensed/authorized station streams and original TRYAMM internet-radio channels can be surfaced in-app.',
  amFm:'PARTNER/RIGHTS: AM/FM broadcast audio may be linked or streamed only through authorized feeds/rights. Operating a terrestrial broadcast station requires the applicable FCC authorization.',
  amateurRadio:'LICENSED AMATEUR USE ONLY: licensed operators may use amateur-radio tools for permitted noncommercial amateur communications. Do not route ordinary TRYAMM business/customer-service traffic over amateur frequencies.',
  emergency:'Future emergency-information views should consume authorized public alerts and must not impersonate public-safety dispatch systems.',
} as const

export const FRANCHISE_MODEL={
  tracks:[
    'Authorized TRYAMM Mobile retail/franchise location',
    'Digital sales/activation agent',
    'Business wireless representative',
    'Community/diaspora market operator',
    'Campus/private-network solutions partner',
  ],
  operatingModules:['territory','storefront','agent onboarding','training','lead CRM','activation handoff','device inventory','commissions','support','compliance','local marketing','analytics'],
  rules:[
    'No franchisee may promise coverage, speed, satellite availability or device support beyond verified provider data.',
    'Commissions are payable only after carrier/payment evidence confirms the qualifying activation or sale.',
    'Telecom, franchise-disclosure, tax, privacy, consumer-protection and local licensing requirements remain jurisdiction-specific gates.',
  ],
} as const

export function mobileFeatureEnabled(){
  return String(import.meta.env.VITE_TRYAMM_MOBILE_ENABLED||'false').toLowerCase()==='true'
}
