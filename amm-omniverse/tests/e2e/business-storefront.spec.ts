import {test,expect,devices} from '@playwright/test'
const ids=['Beautyverse','Stubbs Mobility','OmniCare 360','Barber & Loctician','Food & Catering','Faith & Community','Security Services','Music & Creator','Local Professional','Marketplace Seller']
test.beforeEach(async({page})=>{
 await page.route('**/api/**',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,error:'Service unavailable in isolated UI test'})}))
})
test('business home exposes all demos and never loads the game',async({page},info)=>{
 const requests:string[]=[];page.on('request',request=>requests.push(request.url()))
 await page.goto('/business-app.html')
 await expect(page.getByRole('heading',{name:'Choose a business. Try its demo.'})).toBeVisible()
 await expect(page.locator('.catalog-card')).toHaveCount(10)
 for(const name of ids)await expect(page.getByRole('button',{name:'Try '+name+' demo',exact:true})).toBeAttached()
 await expect(page.getByRole('link',{name:'StreetVerse · optional game ↗'})).toHaveAttribute('href','/streetverse')
 expect(requests.filter(url=>/vendor-three|rapier|maplibre|StreetVerse.*\.js/i.test(url))).toEqual([])
 await expect(page.locator('canvas')).toHaveCount(0)
 await page.screenshot({path:info.outputPath('business-home.png'),fullPage:true})
})
test('shopping demo totals items and previews checkout without a purchase',async({page})=>{
 await page.goto('/business-app.html')
 await page.getByRole('button',{name:'Try Marketplace Seller demo',exact:true}).click()
 const demo=page.getByRole('region',{name:'The Creator Market interactive demo'})
 await expect(demo).toBeVisible()
 await demo.getByRole('button',{name:'Add Everyday tote',exact:true}).click()
 await expect(demo.locator('.demo-cart')).toContainText('$25.00')
 await demo.getByRole('button',{name:'Try checkout preview',exact:true}).click()
 await expect(demo.getByRole('status')).toContainText('No order or payment was created')
})
test('appointment demo validates input and hands off the chosen template',async({page})=>{
 await page.goto('/business-app.html?demo=01')
 const demo=page.getByRole('region',{name:'Beautyverse Studio interactive demo'})
 await expect(demo).toBeVisible()
 await demo.getByLabel('Preferred date').fill('2030-01-15')
 await demo.getByLabel('Your name for this demo').fill('Alex demo')
 await demo.getByRole('button',{name:'Preview appointment request',exact:true}).click()
 await expect(demo.getByRole('status')).toContainText('It was not sent or booked')
 await demo.getByRole('button',{name:'Customize template #01',exact:true}).click()
 await expect(page.getByText('Template #01 selected. Add your details below.',{exact:true})).toBeVisible()
})
test('all ten demos open and return to the catalog',async({page})=>{
 await page.goto('/business-app.html')
 for(const name of ids){
  await page.getByRole('button',{name:'Try '+name+' demo',exact:true}).click()
  await expect(page.locator('.demo-screen')).toBeVisible()
  await page.getByRole('button',{name:'Close demo',exact:true}).click()
  await expect(page.locator('.demo-screen')).toHaveCount(0)
 }
})
