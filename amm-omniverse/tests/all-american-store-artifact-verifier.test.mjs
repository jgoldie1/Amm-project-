import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,createHash} from 'node:crypto';
import {verifyStoreArtifact} from '../api/_lib/all-american-store-artifact-verifier.js';
test('signed matching PC build passes verification but does not automatically install',()=>{
 const {publicKey,privateKey}=generateKeyPairSync('ed25519');
 const artifactBytes=Buffer.from('test-artifact-data');
 const manifest={appId:'new-america.streetverse',version:'1.0.1',sha256:createHash('sha256').update(artifactBytes).digest('hex'),bytes:artifactBytes.length,lane:'general',channel:'desktop-download'};
 const message=[manifest.appId,manifest.version,manifest.sha256,manifest.bytes,manifest.lane,manifest.channel].join('\n');
 const signature=sign(null,Buffer.from(message),privateKey).toString('base64');
 const input={manifest:{...manifest,signature},artifactBytes,trustedPublicKeyPem:publicKey.export({type:'spki',format:'pem'}),installedVersion:'1.0.0'};
 const ok=verifyStoreArtifact(input);
 assert.equal(ok.verified,true);assert.equal(ok.installAllowed,false);
 assert.equal(verifyStoreArtifact({...input,artifactBytes:Buffer.from('changed-file-data')}).reason,'checksum_mismatch');
 assert.equal(verifyStoreArtifact({...input,manifest:{...input.manifest,lane:'adult-device'}}).reason,'signature_invalid');
 assert.equal(verifyStoreArtifact({...input,installedVersion:'1.0.2'}).reason,'not_an_upgrade');
});
