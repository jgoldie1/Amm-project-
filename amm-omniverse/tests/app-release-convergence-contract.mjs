import fs from 'node:fs'
import assert from 'node:assert/strict'

const app = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')

const required = [
  ['mobile dynamic viewport', "minHeight: '100dvh'"],
  ['gameplay dynamic viewport', "height: isGameplay ? '100dvh' : 'auto'"],
  ['gameplay overflow ownership', "overflowY: isGameplay ? 'hidden' : 'auto'"],
  ['mobile momentum scrolling', "WebkitOverflowScrolling: 'touch'"],
  ['shell outside login', "const shellAvailable = screen !== 'login'"],
  ['shell launcher availability', '{shellAvailable && <>'],
  ['shell dialog availability', '{showNexus && shellAvailable &&'],
  ['Command Nexus accessible dialog', 'role="dialog" aria-label="TRYAMM Command Nexus"'],
  ['LIVE launcher accessible name', 'aria-label="Open TryAMM LIVE Center"'],
  ['Command Nexus launcher accessible name', 'aria-label="Open Command Nexus"'],
  ['HoloStyle lazy route', "const HoloStyleCenter = lazy(() => import('./components/HoloStyleCenter'))"],
  ['HoloStyle state', 'const [showHoloStyle, setShowHoloStyle] = useState(false)'],
  ['HoloStyle global launcher', '__showHoloStyle'],
  ['HoloStyle Command Nexus launcher', 'HOLOSTYLE FASHION'],
  ['HoloStyle rendered route', 'showHoloStyle &&'],
  ['HoloStyle center mount', '<HoloStyleCenter'],
  ['Stays/Agency/Family lazy route', "const StaysAgencyFamilyHub = lazy(() => import('./components/StaysAgencyFamilyHub'))"],
  ['Stays global launcher', '__showStaysAgencyFamily'],
  ['Set Apart Passport global launcher', '__showSetApartPassport'],
  ['Stays Command Nexus launcher', 'STAYS · AGENCY · FAMILY'],
  ['Set Apart Passport Command Nexus launcher', 'SET APART PASSPORT'],
  ['protected passport readiness label', "'PROTECTED'"],
]

const missing = required.filter(([, token]) => !app.includes(token)).map(([name]) => name)
assert.deepEqual(missing, [], `App release convergence is incomplete: ${missing.join(', ')}`)

console.log('PASS app-release-convergence-contract: current-main mobile/accessibility/HoloStyle and foundation Stays/Passport behaviors coexist')
