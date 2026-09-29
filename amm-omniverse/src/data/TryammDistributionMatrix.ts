export const TRYAMM_DISTRIBUTION_MATRIX={
  appleAppStore:{
    pocketEdge:'opt-in foreground-safe/cache/sync work; respect iOS background limits',
    earnings:'verified funded jobs only',
    vpn:'NEVPNManager/IKEv2 profile only after entitlement + organization + review certification',
  },
  googlePlay:{
    pocketEdge:'opt-in battery-aware safe work; no hidden mining',
    earnings:'verified funded jobs only',
    vpn:'platform IKEv2/VpnManager candidate only after disclosure + consent + policy declaration',
  },
  allAmericanAppStore:{
    pocketEdge:'same TRYAMM safety contract',
    earnings:'same server-authoritative ledger',
    vpn:'distribution channel cannot bypass OS-level VPN permissions or consent',
  },
  webPwa:{
    pocketEdge:'visible-page safe worker + PWA cache/offline sync',
    earnings:'verified funded jobs when eligible',
    vpn:'HTTPS/Origin Shield only; browser cannot create device-wide VPN',
  },
  desktopBusiness:{
    pocketEdge:'workstation/business node tier',
    earnings:'higher-capability funded jobs after verification',
    vpn:'managed tunnel target with business policy/credentials',
  },
} as const

export const STORE_INVARIANTS=[
  'participation is opt-in',
  'no hidden background mining',
  'no payment for idle installation',
  'no payment for VPN traffic',
  'no sale of VPN browsing traffic',
  'battery/network/resource limits remain visible',
  'server-authoritative earnings verification',
  'native VPN requires explicit user consent',
] as const
