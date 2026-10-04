import fs from 'node:fs'
const ui=fs.readFileSync(new URL('../src/components/AllAmericanOmnichannelCenter.tsx',import.meta.url),'utf8')
const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8')
for(const x of ['ONE PRODUCT • MANY WORLDS','SHOPIFY','EBAY','CUSTOMER / GAMER LOOP','DROPSHIP / SOURCE RULE','/api/commerce/channels-status','/api/commerce/shopify-catalog'])if(!ui.includes(x))throw new Error('Omnichannel center missing '+x)
if(!app.includes('AllAmericanOmnichannelCenter'))throw new Error('Omnichannel center not mounted in App')
if(app.includes("['\n"))throw new Error('App contains malformed nexus entry')
const closeCount=(app.match(/export default function App/g)||[]).length
if(closeCount!==1)throw new Error('App should contain exactly one component definition')
console.log('All American omnichannel center + shell repair contract: PASS')
