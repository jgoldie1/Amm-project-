import fs from 'node:fs'
import path from 'node:path'
const root=process.cwd();const read=p=>fs.readFileSync(path.join(root,p),'utf8');const must=(c,m)=>{if(!c)throw new Error(`AGENCY SMOKE FAIL: ${m}`)}
const hub=read('src/components/TryAMMMobileHub.tsx')
const agencyUi=read('src/components/AgencyGrowthConsole.tsx')
const founderUi=read('src/components/FounderFastTrackAgencyPanel.tsx')
const agencyService=read('src/services/creatorAgency.ts')
const founderService=read('src/services/founderFastTrack.ts')
const agencyMigration=read('supabase/migrations/20260820294500_creator_agency_invites.sql')
const redeemMigration=read('supabase/migrations/20260820295000_creator_invite_redeem_rpc.sql')
const founderMigration=read('supabase/migrations/20260820301500_founder_fast_track_agency_invites.sql')

must(hub.includes('<AgencyGrowthConsole />'),'Agency Growth Console must be mounted')
must(hub.includes('<FounderFastTrackAgencyPanel />'),'Founder Fast-Track panel must be mounted')
for(const token of ['Redeem invite code','Start an agency','Generate agency invite'])must(agencyUi.includes(token),`agency UI ${token}`)
for(const token of ['Founder Fast-Track Agency','REDEEM VIP INVITE','CREATE FAST-TRACK CODE'])must(founderUi.includes(token),`founder UI ${token}`)
for(const token of ['createAgency','generateAgencyInvite','acceptInvite','getMyAgencies','getMyAttribution'])must(agencyService.includes(token),`agency service ${token}`)
for(const token of ['createFounderFastTrackInvite','redeemFounderFastTrackInvite','canManageFounderFastTrack'])must(founderService.includes(token),`founder service ${token}`)
for(const token of ['tryamm_agencies','tryamm_agency_memberships','tryamm_creator_invites','tryamm_creator_attribution','enable row level security','revoke all'])must(agencyMigration.includes(token),`agency migration ${token}`)
for(const token of ['redeem_creator_invite','security definer','for update','first-touch'])must(redeemMigration.toLowerCase().includes(token.toLowerCase()),`agency redeem migration ${token}`)
for(const token of ['tryamm_founder_fast_track_invites','tryamm_is_founder_admin','create_founder_fast_track_invite','redeem_founder_fast_track_invite','security definer','skip_waitlist'])must(founderMigration.includes(token),`founder migration ${token}`)
must(founderMigration.includes("('founder','admin')"),'founder/admin role gate must remain server-side')
must(founderMigration.includes('does not bypass legal, financial, safety, provider, or security requirements'),'VIP compliance truth must remain locked')
console.log('✅ creator agency + founder fast-track smoke contracts passed')
