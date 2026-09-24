import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/components/HoloMarketplaceCenter.tsx', import.meta.url), 'utf8');

assert.match(source, /getAccessToken/, 'marketplace checkout must use the authenticated Supabase session token');
assert.match(source, /fetch\('\/api\/commerce\/checkout'/, 'marketplace must call the server-authoritative checkout route');
assert.match(source, /Authorization:\s*`Bearer \$\{token\}`/, 'marketplace must authenticate checkout with the Supabase bearer token');
assert.match(source, /lines:\s*\[\{id:selectedProduct\.id,qty:1\}\]/, 'browser checkout must send product id and quantity only');
assert.doesNotMatch(source, /body:JSON\.stringify\(\{[\s\S]{0,300}(price|amount|unitAmount|total)\s*:/, 'browser must not send authoritative prices or totals');
assert.match(source, /payload\?\.state === 'PAYMENT_GATED'/, 'marketplace must surface server payment gates');
assert.match(source, /Guest mode cannot create purchases/, 'guest mode must not create real purchases');
assert.match(source, /window\.location\.assign\(String\(payload\.checkoutUrl\)\)/, 'ready checkout must redirect only to the server-provided Stripe URL');
assert.match(source, /signUpWithEmail/, 'marketplace must offer real account creation');
assert.match(source, /signInWithEmail/, 'marketplace must offer real email sign-in');
assert.match(source, /signInWithGoogle/, 'marketplace must preserve OAuth sign-in');

console.log('Holo Marketplace authenticated server checkout contract: PASS');
