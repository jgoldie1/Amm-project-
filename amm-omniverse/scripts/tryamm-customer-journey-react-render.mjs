/**
 * Renders the real customer-facing React component through Vite's module loader.
 * Checks production-meaningful markup, rather than reading source strings.
 * No customer records, payments, publishing, or network services are invoked.
 */
import assert from 'node:assert/strict'
import {createServer} from 'vite'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'

const server=await createServer({server:{middlewareMode:true},appType:'custom',logLevel:'error'})
try{
 const module=await server.ssrLoadModule('/src/components/TryammConnectedGrowthLanding.tsx')
 assert.equal(typeof module.default,'function','TRYAMM landing page must export a React component')
 const html=renderToStaticMarkup(createElement(module.default))
 const requirements=[
  ['marketing headline','Your business deserves a place in the digital world'],
  ['starting offer','$499'],
  ['Holo Ads offer','Holographic Advertising'],
  ['product placement request','REQUEST A PRODUCT PLACEMENT'],
  ['holographic product placement studio','Build your holographic product-placement brief'],
  ['branded product input','id="placement-brand"'],
  ['product page link field','id="placement-url"'],
  ['product proposal action','PREPARE PLACEMENT PROPOSAL'],
  ['existing Reel Studio entry','CREATE HOLO REEL'],
  ['OmniBox creator entry','OMNIBOX STORY STUDIO'],
  ['HoloGPT entry','ASK HOLOGPT'],
  ['Jarvis entry','JARVIS ASSISTANT'],
  ['AI capability truthfulness','RESEARCH UNVERIFIED'],
  ['inquiry name input','id="growth-name"'],
  ['inquiry email input','id="growth-email"'],
  ['inquiry business input','id="growth-business"'],
  ['inquiry offer picker','id="growth-offer"'],
  ['inquiry consent checkbox','type="checkbox"'],
  ['inquiry submit button','SEND SERVICE INQUIRY'],
  ['onboarding disclosure','This is an inquiry, not a purchase']
 ]
 for(const [label,needle] of requirements)assert.ok(html.includes(needle),label+' is missing from rendered customer page')
 assert.ok(html.length>25000,'Customer page render appears incomplete')
 console.log('TRYAMM customer journey SSR render: PASS ('+requirements.length+' customer-facing sections; no service calls)')
}finally{
 await server.close()
}
