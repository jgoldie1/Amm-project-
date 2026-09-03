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
          !dep.includes('streetverse-creator-3d') &&
          !dep.includes('streetverse-3d-runtime')
        )
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id, { getModuleInfo }) {
          // Transitively follow STATIC imports to detect first-party modules
          // that pull in Three.js. These must remain outside app-runtime or
          // Rollup can collapse dynamic StreetVerse 3D imports back into the
          // eager application chunk.
          const seenThree = new Map<string, boolean>()
          const importsThreeStatically = (moduleId: string, stack = new Set<string>()): boolean => {
            const cached = seenThree.get(moduleId)
            if (cached !== undefined) return cached
            if (stack.has(moduleId)) return false
            stack.add(moduleId)
            const info = getModuleInfo(moduleId)
            let result = false
            if (info) {
              for (const dep of info.importedIds) {
                if (dep.includes('/three/') || dep.includes('/three-stdlib/')) { result = true; break }
                if (dep.includes('/src/') && importsThreeStatically(dep, stack)) { result = true; break }
              }
            }
            stack.delete(moduleId)
            seenThree.set(moduleId, result)
            return result
          }

          // Route Three-dependent StreetVerse runtime/game modules into a lazy
          // chunk BEFORE the /src/runtime/ -> app-runtime catch-all.
          if ((id.includes('/src/runtime/') || id.includes('/src/game/')) && importsThreeStatically(id)) return 'streetverse-3d-runtime'
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
