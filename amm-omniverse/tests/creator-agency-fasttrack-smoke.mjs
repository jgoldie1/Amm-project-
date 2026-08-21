import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd();const read=p=>fs.readFileSync(path.join(root,p),'utf8');const must=(c,m)=>{if(!c)throw new Error(`AGENCY SMOKE FAIL: ${m}`)}
const hub=read('src/components/TryAMMMobileHub.tsx')
const agencyUi=read('src/components/AgencyGrowthConsole.tsx')
const agencyService=read('src/services/creatorAgency.ts')
const founderApi=read('api/agency/founder-priority.js')
const agencyMigration=read('supabase/migrations/20260820294500_creator_agency_invites.sql')
const redeemMigration=read('supabase/migrations/20260820295000_creator_invite_redeem_rpc.sql')
const priorityMigration=read('supabase/migrations/20260820301500_founder_priority_agency_invites.sql')
const priorityRpc=read('supabase/migrations/20260820302000_founder_priority_agency_rpcs.sql')

must(hub.includes('<AgencyGrowthConsole />'),'Agency Growth Console must be mounted')
must(!hub.includes('FounderFastTrackAgencyPanel'),'duplicate founder fast-track UI must stay removed')
for(const token of ['Join with invite code','Start an agency','Create recruiting code','Founder Priority Invite','REDEEM PRIORITY INVITE','START PRIORITY AGENCY','ISSUE 1 VIP CODE'])must(agencyUi.includes(token),`agency UI ${token}`)
for(const token of ['createAgency','generateAgencyInvite','acceptInvite','redeemFounderPriorityInvite','createFounderPriorityAgency','issueFounderPriorityInvite','getMyFounderPriority','getMyAgencies','getMyAttribution'])must(agencyService.includes(token),`agency service ${token}`)
for(const token of ['tryamm_agencies','tryamm_agency_memberships','tryamm_creator_invites','tryamm_creator_attribution','enable row level security','revoke all'])must(agencyMigration.includes(token),`agency migration ${token}`)
for(const token of ['redeem_creator_invite','security definer','for update','first-touch'])must(redeemMigration.toLowerCase().includes(token.toLowerCase()),`agency redeem migration ${token}`)
for(const token of ['tryamm_founder_priority_invites','tryamm_founder_priority_entitlements','priority_lane','code_hash','enable row level security'])must(priorityMigration.includes(token),`priority migration ${token}`)
for(const token of ['redeem_founder_priority_invite','create_founder_priority_agency','security definer','PRIORITY_ENTITLEMENT_REQUIRED','founder-priority-invite'])must(priorityRpc.includes(token),`priority RPC ${token}`)
for(const token of ['TRYAMM_FOUNDER_USER_ID','recentlyAuthenticated','sha256','randomBytes','Founder authorization required','mandatory identity, age, tax, payment, telecom, security or legal checks'])must(founderApi.includes(token),`founder API ${token}`)
must(!fs.existsSync(path.join(root,'supabase/migrations/20260820301500_founder_fast_track_agency_invites.sql')),'duplicate migration timestamp/path must stay removed')
must(!fs.existsSync(path.join(root,'src/services/founderFastTrack.ts')),'duplicate founder service must stay removed')
console.log('✅ creator agency + canonical founder priority smoke contracts passed')
