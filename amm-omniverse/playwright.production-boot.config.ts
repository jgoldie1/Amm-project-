import {defineConfig,devices} from '@playwright/test'

// No local server, no paid deployment, no side effects: use existing public alias.
export default defineConfig({
 testDir:'./tests/e2e',
 testMatch:'production-iphone-boot-regression.spec.ts',
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
 projects:[
  {name:'iphone-webkit',use:{...devices['iPhone 13']}},
  {name:'mobile-chromium',use:{...devices['Pixel 7']}},
 ],
})
