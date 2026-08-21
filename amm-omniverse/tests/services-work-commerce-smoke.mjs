import fs from 'node:fs'
const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8'),must=(c,m)=>{if(!c)throw new Error(`SERVICES SMOKE FAIL: ${m}`)}
const main=read('src/main.tsx'),hub=read('src/components/ServicesWorkCommerceHub.tsx'),platform=read('src/services/ServicesWorkCommercePlatform.ts')
must(main.includes('<ServicesWorkCommerceHub />'),'hub mounted')
for(const t of ['Section 8 + HUD Housing','TRYAMM Short Stay','Peer Vehicle Share','Farm + Land Marketplace','Landfill + Environmental Property'])must(platform.includes(t),t)
for(const t of ['waste permits','contamination records','never present as ordinary farmland','insurance/protection gate','voucher document intake'])must(platform.includes(t),t)
for(const t of ['Drone Academy + Drone OS','Registration path','Property + housing','Mobility + services','Work + education'])must(hub.includes(t),t)
for(const t of ['AI teacher adaptive lessons','Remote ID','TRUST recreational pathway','Part 107 knowledge prep','LAANC/airspace authorization awareness','no bypassing FAA registration','no delivery/BVLOS claim without applicable approval'])must(platform.includes(t),t)
for(const t of ['Holoverse','Omniverse','Quantumverse','All American University','payroll/tax readiness'])must(platform.includes(t),t)
console.log('✅ services/work/commerce + property + drone smoke contracts passed')
