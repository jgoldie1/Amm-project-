import {defineConfig,devices} from '@playwright/test'

// Public alias smoke and unpublished Vite candidate preview. Neither deploys to Vercel.
export default defineConfig({
 testDir:'./tests/e2e',
 testMatch:['production-iphone-boot-regression.spec.ts','production-streetverse-3d-regression.spec.ts'],
 fullyParallel:false,
 timeout:60000,
 retries:0,
 reporter:process.env.CI?[['github'],['list']]:[['list']],
 expect:{timeout:20000},
 use:{
  baseURL:process.env.TRYAMM_BASE_URL||'https://tryamm.online',
  trace:'retain-on-failure',
  screenshot:'only-on-failure',
  video:'off',
 },
 webServer:process.env.TRYAMM_CANDIDATE==='1'?{command:'npx vite preview --host 127.0.0.1 --port 4173 --strictPort',url:'http://127.0.0.1:4173',reuseExistingServer:false,timeout:60000}:undefined,
 projects:[
  {name:'iphone-webkit',use:{...devices['iPhone 13']}},
  {name:'mobile-chromium',use:{...devices['Pixel 7']}},
 ],
})
