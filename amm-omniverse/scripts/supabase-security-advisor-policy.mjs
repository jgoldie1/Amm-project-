import fs from 'node:fs'

const path=process.argv[2]||'../release-evidence/supabase-security-advisors.json'
const data=JSON.parse(fs.readFileSync(path,'utf8'))

const REVIEWED_AUTHENTICATED_SECURITY_DEFINERS=new Set([
  'claim_live_room',
  'create_founder_priority_agency',
  'game_move_player',
  'reality_lab_create_instance',
  'reality_lab_is_member',
  'reality_lab_join_instance',
  'reality_lab_submit_puzzle_action',
  'redeem_creator_invite',
  'redeem_founder_priority_invite',
  'redeem_tryamm_code',
  'send_live_gift',
  'set_live_presence',
])

if(data.tryamm_status==='MISSING_MANAGEMENT_TOKEN'){
  console.warn('SUPABASE ADVISOR POLICY: live Management API advisor not executed because SUPABASE_ACCESS_TOKEN is not configured in GitHub Actions.')
  console.warn('SUPABASE ADVISOR POLICY: repository/build release may continue, but this run is NOT a live Supabase advisor certification.')
  process.exit(0)
}

const lints=data.lints||data.result?.lints||[]
const blockers=[]
const reviewed=[]

for(const lint of lints){
  const level=String(lint.level||'').toUpperCase()
  if(level==='INFO')continue

  if(level==='WARN'&&lint.name==='authenticated_security_definer_function_executable'){
    for(const finding of lint.findings||[]){
      const fn=String(finding?.metadata?.name||'')
      if(REVIEWED_AUTHENTICATED_SECURITY_DEFINERS.has(fn)){
        reviewed.push(fn)
      }else{
        blockers.push({name:lint.name,level,detail:finding.detail||lint.description||fn})
      }
    }
    continue
  }

  if(level==='WARN'||level==='ERROR'){
    const findings=Array.isArray(lint.findings)&&lint.findings.length?lint.findings:[lint]
    for(const finding of findings){
      blockers.push({name:lint.name,level,detail:finding.detail||lint.description||lint.title||'Supabase advisor finding'})
    }
  }
}

console.log(`Supabase advisor policy: ${reviewed.length} reviewed authenticated SECURITY DEFINER finding(s); ${blockers.length} blocking finding(s).`)
for(const fn of [...new Set(reviewed)].sort())console.log(`reviewed authenticated RPC: ${fn}`)
for(const item of blockers)console.error(`BLOCK ${item.level} ${item.name}: ${item.detail}`)

if(blockers.length)process.exit(1)
