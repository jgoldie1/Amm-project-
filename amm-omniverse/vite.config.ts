import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    modulePreload: {
      resolveDependencies(_filename, deps) {
        // Do not advertise the heavy Three.js / StreetVerse 3D chunks in the
        // initial HTML preload graph. They remain available and will load when
        // their importing 3D route/runtime actually needs them. This keeps the
        // iPhone-safe HTML city and non-3D TRYAMM pages from paying the WebGL
        // download/parse cost during first paint.
        return deps.filter(dep =>
          !dep.includes('vendor-three') &&
          !dep.includes('streetverse-creator-3d')
        )
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep the Three.js creator-district runtime out of the shared app-runtime
          // chunk so constrained StreetVerse devices do not preload WebGL code before
          // the guaranteed HTML city can render.
          if (id.includes('/src/runtime/StreetVerseCreatorDistrict3D')) return 'streetverse-creator-3d'
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
