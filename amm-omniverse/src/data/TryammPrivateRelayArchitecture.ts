export const TRYAMM_PRIVATE_RELAY_ARCHITECTURE={
  product:'TRYAMM Private Relay / VPN',
  purpose:'Protect TRYAMM app, Pocket Edge, AI Cafe and Business Server traffic and provide secure remote-access networking without monetizing tunneled user traffic.',
  modes:{
    pwa:{
      state:'HTTPS_ONLY',
      detail:'PWA uses ordinary TLS/same-origin security; a web page cannot create a system-wide device VPN.',
    },
    ios:{
      state:'NATIVE_CAPABILITY_REQUIRED',
      detail:'Use Apple Personal VPN / Network Extension APIs after entitlement, native shell integration and user authorization.',
      preferredInitialProtocol:'IKEv2 via NEVPNManager where gateway compatibility permits',
    },
    android:{
      state:'NATIVE_SERVICE_REQUIRED',
      detail:'Use Android VpnService with explicit system consent, foreground-service requirements and Play Console declaration.',
    },
    desktopBusiness:{
      state:'MANAGED_TUNNEL_TARGET',
      detail:'Managed workstation/cafe/business nodes can use a standards-based tunnel to TRYAMM regional gateways.',
    },
  },
  security:[
    'explicit user enable/disable',
    'strong standard cryptography only',
    'no custom/home-grown encryption',
    'per-node identity and short-lived credentials',
    'DNS leak protection where supported',
    'kill-switch/always-on policy only when explicitly enabled',
    'split-tunnel option for TRYAMM-only traffic',
    'gateway health and failover',
    'no traffic-content logging by default',
    'minimal abuse/security metadata with retention limits',
  ] as const,
  storePolicy:[
    'VPN is security/networking functionality, not a bandwidth monetization mechanism.',
    'Never redirect other apps traffic for advertising or monetization.',
    'Google Play VpnService disclosure/declaration and affirmative consent required.',
    'Apple VPN/Network Extension entitlement and user authorization required.',
    'Encryption/export-compliance review required for Apple distribution.',
  ] as const,
  earningsBoundary:'VPN usage itself does not create Edge earnings. Compute jobs and VPN are separate systems.',
} as const
