import {test,expect} from '@playwright/test'

test.describe('StarVerse creator pipeline phone journey',()=>{
 test('talent passport -> audition -> rights -> sponsor -> caption -> local analytics -> erase',async({page})=>{
  test.setTimeout(90000)
  page.on('pageerror',e=>console.error('[starverse page error]',e.message))
  await page.goto('/network/talent-studio',{waitUntil:'domcontentloaded'})
  await expect(page.getByRole('heading',{name:'Anyone Can Be a Star'})).toBeVisible({timeout:25000})
  await expect(page.getByRole('heading',{name:'StarVerse Talent Passport + Creator Operations'})).toBeVisible({timeout:30000})

  await page.getByRole('button',{name:/Talent Passport/}).click()
  const stage=page.getByLabel('Stage name',{exact:true})
  await stage.fill('')
  await stage.pressSequentially('TRYAMM Test Artist',{delay:1})
  await expect(stage).toHaveValue('TRYAMM Test Artist')
  await page.getByRole('button',{name:'Use stage name in audition draft'}).click()
  await expect(page.getByLabel('Creator/stage credit (not a legal name)')).toHaveValue('TRYAMM Test Artist')

  await page.getByRole('button',{name:/Star Competition/}).click()
  await page.getByRole('button',{name:'Mark competition plan drafted'}).click()

  await page.getByRole('button',{name:/Rights Vault/}).click()
  await page.getByLabel('Asset label').fill('Original community song')
  await page.getByRole('button',{name:'Add unverified rights item'}).click()
  await expect(page.getByText('Original community song',{exact:false})).toBeVisible()
  await expect(page.getByText('clearance NOT verified',{exact:false})).toBeVisible()

  await page.getByRole('button',{name:/Sponsorships/}).click()
  await page.getByLabel('Brand/business label').fill('Sample Business')
  await page.getByRole('textbox',{name:'Creative proposal',exact:true}).fill('Local community performance spot with clear ad disclosure')
  await page.getByRole('button',{name:'Save sponsorship concept'}).click()
  await expect(page.getByText('Sample Business — episode')).toBeVisible()

  await page.getByRole('button',{name:/Captions/}).click()
  await page.getByRole('checkbox',{name:'es'}).check()

  await page.getByRole('button',{name:/Analytics/}).click()
  await expect(page.getByText('Verified audience reach:')).toBeVisible()
  await expect(page.getByText('Not connected').first()).toBeVisible()
  await expect(page.getByText('Rights to verify')).toBeVisible()
  await expect(page.getByText('Sponsor concepts')).toBeVisible()

  await page.reload({waitUntil:'domcontentloaded'})
  await page.getByRole('button',{name:/Talent Passport/}).click()
  await expect(page.getByLabel('Stage name',{exact:true})).toHaveValue('TRYAMM Test Artist')
  await page.getByRole('button',{name:'Clear local creator-operations data…'}).click()
  await page.getByRole('button',{name:'Confirm clear this browser'}).click()
  await expect(page.getByLabel('Stage name',{exact:true})).toHaveValue('')
  const after=await page.evaluate(()=>localStorage.getItem('tryamm.starverse.creator-operations.v1'))
  expect(after).toBeNull()
 })
})
