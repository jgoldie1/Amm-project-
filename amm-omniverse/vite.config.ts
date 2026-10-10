import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: [
      {
        // Quantum Slicer: redirect only the bare package import. Regex keeps
        // three/examples/* and three/addons/* working normally.
        find: /^three$/,
        replacement: fileURLToPath(new URL('./node_modules/three/src/Three.js', import.meta.url)),
      },
    ],
  },
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
          !dep.includes('vendor-maplibre') &&
          !dep.includes('streetverse-creator-3d') &&
          !dep.includes('streetverse-3d-runtime')
        )
      },
    },
    rollupOptions: {
      // Vercel routes /streetverse to streetverse-safe.html. Declare both HTML
      // documents as Vite build inputs so the safe entry and its hashed module
      // graph are emitted into dist for the production deployment.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        streetverseSafe: fileURLToPath(new URL('./streetverse-safe.html', import.meta.url)),
      },
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
          // app-runtime: let Rollup preserve route-specific dynamic boundaries here.
          // Forcing every non-Three runtime into one eager 3.6 MB chunk breaches
          // release budgets and defeats on-demand loading for unrelated worlds.
          // Native graph splitting also avoids artificial runtime-to-runtime cycles.
          if (id.includes('/src/data/')) return 'app-data'
          if (!id.includes('node_modules')) return
          // Sparrow Map is a lazy feature. Keep MapLibre isolated so the map engine
          // never inflates the Sparrow component chunk or the initial app graph.
          if (id.includes('/maplibre-gl/')) return 'vendor-maplibre'
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) return 'vendor-react'

          // Keep optional Three.js utility/add-on code separate from the core renderer.
          // Previously three + three-stdlib were forced into one ~671 kB minified chunk,
          // which crossed Vite's 600 kB production warning threshold. Keeping stdlib in
          // its own cacheable chunk reduces the core download and lets routes load the
          // utility layer independently when they actually need it.
          if (id.includes('/three-stdlib/')) return 'vendor-three-stdlib'
          // Quantum Slicer: keep the Three.js barrel separate from internal
          // implementation chunks. Putting src/Three.js in the core chunk creates
          // a reverse edge because the barrel re-exports the renderer; splitting
          // renderer at the same time then becomes a circular chunk and can crash
          // at runtime with a temporal-dead-zone ReferenceError.
          //
          // The renderer is a dependency leaf for our bundle: it may import core
          // math/material/object modules, while those modules do not import the
          // Three.js barrel. Keeping the barrel in its own tiny facade therefore
          // lets Rollup split the large renderer without a core -> renderer back
          // edge. This preserves the 675 kB main-release hard cap without weakening
          // that gate or reintroducing the Playwright bootstrap crash.
          if (id.endsWith('/three/src/Three.js')) return 'vendor-three-entry'
          if (id.includes('/three/src/renderers/')) return 'vendor-three-renderer'
          if (id.includes('/three/src/')) return 'vendor-three-core'
          if (id.includes('/three/')) return 'vendor-three-addons'

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
