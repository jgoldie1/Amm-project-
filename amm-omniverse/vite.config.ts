import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/src/runtime/')) return 'app-runtime'
          if (id.includes('/src/data/')) return 'app-data'
          if (!id.includes('node_modules')) return
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react'
          if (id.includes('/three/') || id.includes('/three-stdlib/')) return 'vendor-three'
          if (id.includes('/@supabase/')) return 'vendor-supabase'
          if (id.includes('/livekit-client/') || id.includes('/@livekit/')) return 'vendor-livekit'
          if (id.includes('/howler/') || id.includes('/tone/') || id.includes('/lottie-web/') || id.includes('/@lottiefiles/')) return 'vendor-media'
          if (id.includes('/@google/generative-ai/') || id.includes('/ai/')) return 'vendor-ai'
          if (id.includes('/face-api.js/')) return 'vendor-vision'
          if (id.includes('/zustand/')) return 'vendor-state'
        },
      },
    },
  },
})
