import type { CapacitorConfig } from '@capacitor/cli'

const target=String(process.env.TRYAMM_NATIVE_TARGET||'tryamm').trim().toLowerCase()
const streetverse=target==='streetverse'

const config: CapacitorConfig = {
  appId: streetverse ? 'online.tryamm.streetverse' : 'online.tryamm.app',
  appName: streetverse ? 'StreetVerse' : 'TRYAMM',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config
