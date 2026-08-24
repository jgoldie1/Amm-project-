import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'online.tryamm.app',
  appName: 'TRYAMM',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
}

export default config
