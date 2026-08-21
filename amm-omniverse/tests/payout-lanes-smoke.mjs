import fs from 'node:fs'
const read=p=>fs.readFileSync(p,'utf8'),must=(c,m)=>{if(!c)throw new Error(`PAYOUT SMOKE FAIL: ${m}`)}
const api=read('api/money/payout/[action].ts'),router=read('src/economy/VerifiedPayoutRouter.ts'),kofi=read('src/economy/PastorKofiServicePayoutContract.ts'),service=read('supabase/migrations/20260821023500_service_share_payout_ledger.sql'),game=read('supabase/migrations/20260821021000_game_prize_payout_ledger.sql')
for(const t of ['TRYAMM_PAYOUT_REVIEWER_USER_IDS','approve-game-prize','approve-service-share','mark-submitted','settle','service_share_payouts','game_prize_payouts'])must(api.includes(t),t)
for(const t of ["'game-prize'","'sponsor-beneficiary'","'service-share'",'separate ledgers','$1 game-prize payout','small 10% service-share payout'])must(router.includes(t),t)
for(const t of ['shareBps: 1000','eligible net service revenue','PAYOUT PROVIDER','no browser-side payout creation'])must(kofi.includes(t),t)
for(const t of ['service_share_programs','service_share_revenue','service_share_payouts','trusted-server/admin operations only'])must(service.includes(t),t)
for(const t of ['game_prize_events','game_prize_results','game_prize_payouts','game_prize_allocations'])must(game.includes(t),t)
console.log('✅ payout lane smoke contracts passed')
