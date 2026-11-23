import {expect,test} from '@playwright/test'

test('Jacobie keeps walking while the joystick is held and stops on release',async({page})=>{
  await page.addInitScript(()=>{
    const sample={mounted:false,x:0,z:0,count:0}
    Object.assign(window,{joystickSample:sample})
    window.addEventListener('tryamm:streetverse-recovered-playable-mounted',event=>{
      const data=(event as CustomEvent).detail
      sample.mounted=data.id==='jacobie-stubbs'&&data.active3DMesh===true
    })
    window.addEventListener('tryamm:streetverse-player-position',event=>{
      const data=(event as CustomEvent).detail
      if(!data.mobileLite||data.htmlCity||String(data.source).startsWith('acceptance'))return
      Object.assign(sample,{x:data.x,z:data.z,count:sample.count+1})
    })
  })
  await page.goto('/streetverse?core=1&graphics=character&character=jacobie&world=greenville')
  const sample=()=>page.evaluate(()=>(window as Window & {joystickSample:{mounted:boolean;x:number;z:number;count:number}}).joystickSample)
  await expect.poll(async()=>(await sample()).mounted,{timeout:45000}).toBe(true)
  const stick=page.getByLabel('StreetVerse analog joystick',{exact:true})
  const box=await stick.boundingBox()
  if(!box)throw Error('Joystick has no visible bounds')
  const x=box.x+box.width/2,y=box.y+box.height/2
  expect(await page.evaluate(([x,y])=>document.elementFromPoint(x,y)?.closest('[aria-label]')?.getAttribute('aria-label'),[x,y])).toBe('StreetVerse analog joystick')
  await page.mouse.move(x,y)
  await page.mouse.down()
  await page.mouse.move(x,y-36)
  await page.waitForTimeout(1500)
  const held=await sample()
  await expect.poll(async()=>held.z-(await sample()).z,{timeout:4000}).toBeGreaterThan(0.15)
  await page.mouse.up()
  // Wait for a fresh position sample after release before checking for drift.
  const released=await sample()
  await expect.poll(async()=>(await sample()).count).toBeGreaterThan(released.count)
  const stopped=await sample()
  await expect.poll(async()=>(await sample()).count).toBeGreaterThan(stopped.count+2)
  expect((await sample()).z).toBeCloseTo(stopped.z,3)
})
