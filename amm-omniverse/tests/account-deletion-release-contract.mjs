import fs from 'node:fs'
import path from 'node:path'

const root=process.cwd()
const read=p=>fs.readFileSync(path.join(root,p),'utf8')
const must=(ok,msg)=>{if(!ok)throw new Error(`ACCOUNT DELETION RELEASE CONTRACT FAIL: ${msg}`)}

const migration=read('supabase/migrations/20260925073000_account_deletion_requests.sql')
must(migration.includes('account_deletion_requests'),'deletion request table migration must exist')
must(migration.includes('enable row level security'),'deletion table must enable RLS')
must(migration.includes('revoke all on public.account_deletion_requests from anon'),'anon must not access deletion requests directly')
must(migration.includes('revoke all on public.account_deletion_requests from authenticated'),'authenticated clients must not access deletion requests directly')
must(migration.includes('grant select, insert, update on public.account_deletion_requests to service_role'),'server service role must have explicit Data API privileges')

const api=read('api/privacy/delete-request.js')
must(api.includes('requireUser'),'deletion API must require the signed-in user')
must(api.includes("DELETE MY TRYAMM ACCOUNT"),'deletion API must require explicit typed confirmation')
must(api.includes('latestOpen(user.id)'),'deletion API must bind request status to the authenticated user')
must(!api.includes('user.email'),'deletion request persistence should not duplicate email when user ID is enough')

const client=read('src/services/accountPrivacy.ts')
must(client.includes('getAccessToken'),'privacy client must authenticate requests')
must(client.includes('/api/privacy/delete-request'),'privacy client must call the protected deletion API')

const center=read('src/components/AccountPrivacyCenter.tsx')
must(center.includes('Delete your TRYAMM account'),'in-app/web deletion UI must be visible')
must(center.includes('requestAccountDeletion'),'deletion UI must submit a real request')
must(center.includes('legally required to retain'),'deletion UI must accurately disclose limited retention')

const main=read('src/main.tsx')
must(main.includes("currentPath==='/account-deletion'"),'public web deletion route must exist')
must(main.includes('AccountPrivacyCenter'),'deletion route must render the privacy center')

const launcher=read('src/components/GlobalLaunchBar.tsx')
must(launcher.includes("['PRIVACY / DELETE ACCOUNT','/account-deletion']"),'in-app navigation must expose account deletion')

for(const page of ['public/privacy.html','public/terms.html','public/account-deletion.html']){
  must(fs.existsSync(path.join(root,page)),`${page} must ship in the Vite public output`)
}
must(read('public/privacy.html').includes('/account-deletion'),'privacy notice must link to web deletion flow')
must(read('public/account-deletion.html').includes('Open Account Privacy Center'),'public deletion resource must lead to the request UI')

console.log('ACCOUNT DELETION RELEASE CONTRACT PASS: authenticated request + server-only persistence + in-app path + public web resource.')
