import {defineConfig,devices} from '@playwright/test'
export default defineConfig({
 testDir:'./tests/e2e',
 testMatch:'streetverse-district-dominion.spec.ts',
 fullyParallel:false,
 retries:0,
 reporter:process.env.CI?[['list']]:[['list']],
 timeout:95000,
 expect:{timeout:20000},
 use:{baseURL:'http://127.0.0.1:4173',trace:'retain-on-failure',screenshot:'only-on-failure',video:'off'},
 projects:[{name:'mobile-chromium',use:{...devices['Pixel 7'],viewport:{width:390,height:844}}}],
 webServer:{command:'npx vite preview --host 127.0.0.1 --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:60000},
})
