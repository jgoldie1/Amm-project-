import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const terms=read('../public/terms.html')
const privacy=read('../public/privacy.html')
const rights=read('../ASSET_RIGHTS_CLEARANCE.md')
const auth=read('../src/data/StreetVerseCharacterReferenceAuthorization.ts')

for(const token of [
 'Real people, names, voices, likenesses and digital replicas',
 'Fictional characters and Global city populations',
 'No false endorsement or affiliation',
 'Third-party copyright, trademarks, music and characters',
 'AI and synthetic media',
 'Asset provenance and rights review',
 'Rights complaints and corrective action',
]) assert.ok(terms.includes(token),`terms missing ${token}`)

assert.ok(terms.includes('Generic rigs are not claims of a real person’s likeness.'),'terms must distinguish generic rigs from likeness claims')
assert.ok(terms.includes('PHOTO-MATCHED'),'terms must define verified photo-match boundary')
assert.ok(terms.includes('does not replace legal review'),'terms must not overclaim legal protection')

for(const token of [
 'Character references, likenesses and synthetic avatars',
 'Reference retention and minimization',
]) assert.ok(privacy.includes(token),`privacy notice missing ${token}`)

for(const token of [
 'Real-person likeness, voice, name, and digital-replica clearance',
 'Fictional Global population rule',
 'Endorsement and affiliation',
 'AI and synthetic-media provenance',
]) assert.ok(rights.includes(token),`asset rights gate missing ${token}`)

assert.ok(auth.includes("status:'verified-authorized'"),'authorization registry must preserve verified state')
assert.ok(auth.includes('genericRigNeverEqualsPhotoMatch:true'),'generic rig must never equal photo-match')
assert.ok(auth.includes('userAttestationIsEvidenceNotAutomaticLegalVerification:true'),'self attestation must not be overclaimed as final legal verification')

console.log('TRYAMM IP + likeness + fictional-character legal product contract: PASS')
