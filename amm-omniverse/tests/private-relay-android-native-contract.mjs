import fs from 'node:fs'
const prep=fs.readFileSync(new URL('../scripts/prepare-private-relay-android.mjs',import.meta.url),'utf8')
const cfg=JSON.parse(fs.readFileSync(new URL('../config/private-relay-release.json',import.meta.url),'utf8'))
const must=(ok,msg)=>{if(!ok)throw new Error('TRYAMM ANDROID PRIVATE RELAY CONTRACT FAIL: '+msg)}
must(prep.includes("TRYAMM_ENABLE_PRIVATE_RELAY!=='true'"),'VPN native generation must be explicit')
must(prep.includes('Ikev2VpnProfile.Builder'),'Android must use OS IKEv2 profile')
must(prep.includes('VpnManager'),'Android must use platform VpnManager')
must(prep.includes('provisionVpnProfile'),'Android system consent provisioning missing')
must(prep.includes('startProvisionedVpnProfileSession'),'API33 VPN session start missing')
must(prep.includes('setBypassable(false)'),'VPN bypass must default off')
must(prep.includes('setAuthUsernamePassword'),'short-lived credential-capable IKEv2 auth missing')
must(!prep.includes('VpnService extends'),'custom packet interception service must not be generated')
must(cfg.coreStoreProfile.systemWideVpnBundled===false,'core Play build must stay separate')
console.log('TRYAMM ANDROID PRIVATE RELAY CONTRACT PASS: separate IKEv2/VpnManager candidate with OS consent')
