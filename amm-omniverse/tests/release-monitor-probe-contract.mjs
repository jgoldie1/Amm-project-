import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../../.github/workflows/tryamm-release-monitor.yml', import.meta.url), 'utf8');

assert.match(source, /https:\/\/tryamm\.online\/streetverse/, 'release monitor must probe StreetVerse directly');
assert.match(source, /STREET_OK=false/, 'release monitor must track StreetVerse independently');
assert.match(source, /grep -Eqi 'TRYAMM StreetVerse Safe World\|streetverseSafe-'/, 'StreetVerse probe must verify the production surface marker');
assert.match(source, /grep -Eqi '<div\[\^>\]\+id="root"'/, 'app-shell probe must accept a hydrated or canary-filled root');
assert.doesNotMatch(source, /<div id="root"><\/div>/, 'release monitor must not require an empty React root');
assert.match(source, /\$STREET_OK" != true/, 'release status must fail when StreetVerse itself is unavailable');
assert.match(source, /StreetVerse reachable: \*\*\$STREET_OK\*\*/, 'release blocker issue must report StreetVerse separately');

console.log('Release monitor production probe contract: PASS');
