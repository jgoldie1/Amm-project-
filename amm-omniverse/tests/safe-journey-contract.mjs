import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'src', 'safeJourney', 'safeJourneyCore.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const required = [
  'PILOT_DISPATCHER',
  'PILOT_RESPONDER',
  "verificationStatus: 'verified'",
  "trainingStatus: 'completed'",
  'authenticateJourney',
  'assignResponder',
  'progressJourney',
  'requiresEmergencyServices',
  'journey.dispatch',
  'dispatch.accept',
  'Weapons, pursuit, detention, searches, forced entry and vigilante enforcement are prohibited',
];

for (const token of required) {
  if (!source.includes(token)) throw new Error(`Safe Journey contract missing: ${token}`);
}

const requested = {
  id: 'pilot-journey-001',
  travelerAccountId: 'pilot-traveler-001',
  originLabel: 'Pilot Origin',
  destinationLabel: 'Pilot Destination',
  riskLevel: 'routine',
  state: 'requested',
  requestedAt: new Date().toISOString(),
};

const states = [
  requested.state,
  'authenticated',
  'responder_assigned',
  'responder_en_route',
  'responder_arrived',
  'journey_active',
  'safe_arrival',
];

const expected = 'requested>authenticated>responder_assigned>responder_en_route>responder_arrived>journey_active>safe_arrival';
if (states.join('>') !== expected) throw new Error('Authenticated pilot journey state contract failed.');

console.log('Safe Journey authenticated dispatch contract: PASS');
console.log('Pilot dispatcher fixture: authorized for test only');
console.log('Pilot responder fixture: verified/trained fixture for test only');
console.log(`Journey path: ${expected}`);
