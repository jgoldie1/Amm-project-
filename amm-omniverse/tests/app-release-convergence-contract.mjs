import fs from 'node:fs'
import assert from 'node:assert/strict'

const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

const required = [
  ['mobile dynamic viewport', "minHeight: '100dvh'"],
  ['gameplay dynamic viewport', "height: isGameplay ? '100dvh' : 'auto'"],
  ['gameplay overflow ownership', "overflowY: isGameplay ? 'hidden' : 'auto'"],
  ['shell outside login', "const shellAvailable = screen !== 'login'"],
  ['HoloStyle lazy route', "const HoloStyleCenter = lazy(() => import('./components/HoloStyleCenter'))"],
  ['HoloStyle global launcher', '__showHoloStyle'],
  ['HoloStyle Command Nexus launcher', 'HOLOSTYLE FASHION'],
  ['Stays/Agency/Family lazy route', "const StaysAgencyFamilyHub = lazy(() => import('./components/StaysAgencyFamilyHub'))"],
  ['Stays global launcher', '__showStaysAgencyFamily'],
  ['Set Apart Passport global launcher', '__showSetApartPassport'],
  ['Stays Command Nexus launcher', 'STAYS · AGENCY · FAMILY'],
  ['Set Apart Passport Command Nexus launcher', 'SET APART PASSPORT'],
  ['protected passport readiness label', "'PROTECTED'"],
]

const missing = required.filter(([, token]) => !app.includes(token)).map(([name]) => name)
assert.deepEqual(missing, [], `App release convergence is incomplete: ${missing.join(', ')}`)

console.log('PASS app-release-convergence-contract: current-main mobile/HoloStyle and foundation Stays/Passport behaviors coexist')
