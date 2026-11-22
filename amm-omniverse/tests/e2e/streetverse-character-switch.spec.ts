import {expect,test} from '@playwright/test'

test('reachable character menu loads all three original animated rigs and returns to Greenville',async({page})=>{
  test.setTimeout(150000)
  await page.addInitScript(()=>{
    window.addEventListener('tryamm:streetverse-recovered-playable-mounted',event=>{
      const d=(event as CustomEvent).detail
      if(d.active3DMesh && d.mounted && d.textureVerified && !d.diagnosticAppearance)
        Object.assign(window,{castMount:{id:d.characterId,clips:d.clipCount}})
    })
    window.addEventListener('tryamm:streetverse-bj-hero-mounted',event=>{
      const d=(event as CustomEvent).detail
      if(d.actual3DModelMounted && d.version==='V15')
        Object.assign(window,{castMount:{id:'bj-stubbs',clips:d.skeletonAnimationCount}})
    })
  })
  await page.goto('/streetverse?core=1&graphics=character&character=jacobie&world=greenville')
  const mounted=()=>page.evaluate(()=>(window as Window & {castMount?:{id:string;clips:number}}).castMount)
  await expect.poll(mounted,{timeout:45000}).toEqual({id:'jacobie-stubbs',clips:12})
  for(const [name,id,clips] of [['BJ','bj-stubbs',8],['LATEASIA','lateasia-monroe',7],['JACOBIE','jacobie-stubbs',12]] as const){
    await expect(page.getByRole('button',{name:/LIVE TEST/})).toHaveCount(1)
    await page.getByRole('button',{name:/Switch character/}).click()
    await page.getByRole('link',{name:'PLAY AS '+name,exact:true}).click()
    await expect.poll(mounted,{timeout:45000}).toEqual({id,clips})
  }
})
