import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/foundation/founderCommerceTelemetry.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

const authorityTypeBlock = source.match(
  /export type CommerceAuthority\s*=([\s\S]*?);/,
)?.[1];

if (!authorityTypeBlock) {
  throw new Error('Founder commerce telemetry authority union is missing');
}

const declaredAuthorities = [...authorityTypeBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
const duplicateAuthorities = declaredAuthorities.filter(
  (authority, index) => declaredAuthorities.indexOf(authority) !== index,
);

if (duplicateAuthorities.length > 0) {
  throw new Error(
    `Founder commerce telemetry authority union contains duplicates: ${[...new Set(duplicateAuthorities)].join(', ')}`,
  );
}

for (const authority of declaredAuthorities) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(authority)) {
    throw new Error(`Founder commerce telemetry authority must remain lowercase kebab-case: ${authority}`);
  }
}

const expectedServerAuthorities = [
  'commerce-api',
  'payment-provider',
  'inventory-service',
  'logistics-service',
  'customs-service',
  'settlement-service',
];

const unexpectedAuthorities = declaredAuthorities.filter(
  (authority) => !expectedServerAuthorities.includes(authority),
);
const missingServerAuthorities = expectedServerAuthorities.filter(
  (authority) => !declaredAuthorities.includes(authority),
);

if (unexpectedAuthorities.length > 0 || missingServerAuthorities.length > 0) {
  throw new Error(
    `Founder commerce telemetry authority boundary drifted; unexpected: ${unexpectedAuthorities.join(', ') || 'none'}; missing: ${missingServerAuthorities.join(', ') || 'none'}`,
  );
}

const eventTypeBlock = source.match(
  /export type FounderCommerceTelemetryEventType\s*=([\s\S]*?);/,
)?.[1];

if (!eventTypeBlock) {
  throw new Error('Founder commerce telemetry event-type union is missing');
}

const declaredEventTypes = [...eventTypeBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
const duplicateEventTypes = declaredEventTypes.filter(
  (eventType, index) => declaredEventTypes.indexOf(eventType) !== index,
);

if (duplicateEventTypes.length > 0) {
  throw new Error(
    `Founder commerce telemetry event-type union contains duplicates: ${[...new Set(duplicateEventTypes)].join(', ')}`,
  );
}

for (const eventType of declaredEventTypes) {
  if (!/^[a-z0-9]+(?:\.[a-z0-9]+)+$/.test(eventType)) {
    throw new Error(`Founder commerce telemetry event type must remain lowercase dot-case: ${eventType}`);
  }
}

const authorityRegistryBlock = source.match(
  /const eventAuthorities:[\s\S]*?=\s*\{([\s\S]*?)\n\};/,
)?.[1];

if (!authorityRegistryBlock) {
  throw new Error('Founder commerce telemetry authority registry is missing');
}

const registryEntryMatches = [...authorityRegistryBlock.matchAll(/^\s*'([^']+)'\s*:\s*\[([^\]]*)\]/gm)];
const registryEventTypes = registryEntryMatches.map((match) => match[1]);
const duplicateRegistryEventTypes = registryEventTypes.filter(
  (eventType, index) => registryEventTypes.indexOf(eventType) !== index,
);

if (duplicateRegistryEventTypes.length > 0) {
  throw new Error(
    `Founder commerce telemetry authority registry contains duplicate keys: ${[...new Set(duplicateRegistryEventTypes)].join(', ')}`,
  );
}

const declaredSet = new Set(declaredEventTypes);
const registrySet = new Set(registryEventTypes);
const missingAuthorityMappings = declaredEventTypes.filter((eventType) => !registrySet.has(eventType));
const unknownAuthorityMappings = registryEventTypes.filter((eventType) => !declaredSet.has(eventType));

if (missingAuthorityMappings.length > 0) {
  throw new Error(
    `Founder commerce telemetry event types missing authority mappings: ${missingAuthorityMappings.join(', ')}`,
  );
}

if (unknownAuthorityMappings.length > 0) {
  throw new Error(
    `Founder commerce telemetry authority registry contains undeclared event types: ${unknownAuthorityMappings.join(', ')}`,
  );
}

if (declaredEventTypes.length !== registryEventTypes.length) {
  throw new Error('Founder commerce telemetry event-type union and authority registry must remain one-to-one');
}

const expectedAuthorityOwners = {
  'rfq.created': ['commerce-api'],
  'supplier.verified': ['commerce-api'],
  'po.opened': ['commerce-api'],
  'payment.verified': ['payment-provider'],
  'inventory.received': ['inventory-service'],
  'shipment.departed': ['logistics-service'],
  'customs.hold.opened': ['customs-service'],
  'customs.hold.cleared': ['customs-service'],
  'live.sale.completed': ['commerce-api'],
  'delivery.confirmed': ['logistics-service'],
  'settlement.created': ['settlement-service'],
  'refund.completed': ['payment-provider', 'settlement-service'],
};

const expectedEventTypes = Object.keys(expectedAuthorityOwners);
const missingExpectedAuthorityContracts = declaredEventTypes.filter(
  (eventType) => !expectedEventTypes.includes(eventType),
);
const staleExpectedAuthorityContracts = expectedEventTypes.filter(
  (eventType) => !declaredSet.has(eventType),
);

if (missingExpectedAuthorityContracts.length > 0 || staleExpectedAuthorityContracts.length > 0) {
  throw new Error(
    `Founder commerce telemetry expected authority contracts must match declared event types exactly; missing: ${missingExpectedAuthorityContracts.join(', ') || 'none'}; stale: ${staleExpectedAuthorityContracts.join(', ') || 'none'}`,
  );
}

const declaredAuthoritySet = new Set(declaredAuthorities);
for (const [, eventType, authorityList] of registryEntryMatches) {
  const owners = [...authorityList.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  if (owners.length === 0) {
    throw new Error(`Founder commerce telemetry event must have at least one authoritative owner: ${eventType}`);
  }

  const duplicateOwners = owners.filter((owner, index) => owners.indexOf(owner) !== index);
  if (duplicateOwners.length > 0) {
    throw new Error(
      `Founder commerce telemetry event contains duplicate authority owners for ${eventType}: ${[...new Set(duplicateOwners)].join(', ')}`,
    );
  }

  const undeclaredOwners = owners.filter((owner) => !declaredAuthoritySet.has(owner));
  if (undeclaredOwners.length > 0) {
    throw new Error(
      `Founder commerce telemetry event contains undeclared authority owners for ${eventType}: ${undeclaredOwners.join(', ')}`,
    );
  }

  const expectedOwners = expectedAuthorityOwners[eventType];
  if (!expectedOwners) {
    throw new Error(`Founder commerce telemetry event is missing an expected authority contract: ${eventType}`);
  }

  if (
    owners.length !== expectedOwners.length ||
    owners.some((owner, index) => owner !== expectedOwners[index])
  ) {
    throw new Error(
      `Founder commerce telemetry authority ownership drifted for ${eventType}; expected ${expectedOwners.join(', ')}, received ${owners.join(', ')}`,
    );
  }
}

const reducerSwitchBlock = source.match(
  /switch \(event\.type\) \{([\s\S]*?)\n  \}/,
)?.[1];

if (!reducerSwitchBlock) {
  throw new Error('Founder commerce telemetry reducer event switch is missing');
}

const reducerCaseEventTypes = [...reducerSwitchBlock.matchAll(/case\s+'([^']+)'\s*:/g)].map(
  (match) => match[1],
);
const duplicateReducerCases = reducerCaseEventTypes.filter(
  (eventType, index) => reducerCaseEventTypes.indexOf(eventType) !== index,
);
const reducerCaseSet = new Set(reducerCaseEventTypes);
const missingReducerCases = declaredEventTypes.filter((eventType) => !reducerCaseSet.has(eventType));
const unknownReducerCases = reducerCaseEventTypes.filter((eventType) => !declaredSet.has(eventType));

if (
  duplicateReducerCases.length > 0 ||
  missingReducerCases.length > 0 ||
  unknownReducerCases.length > 0 ||
  reducerCaseEventTypes.length !== declaredEventTypes.length
) {
  throw new Error(
    `Founder commerce telemetry reducer switch must remain one-to-one with declared event types; duplicate: ${[...new Set(duplicateReducerCases)].join(', ') || 'none'}; missing: ${missingReducerCases.join(', ') || 'none'}; unknown: ${unknownReducerCases.join(', ') || 'none'}`,
  );
}

console.log('Founder commerce telemetry event-type naming, authority naming, exact authority ownership, expected-contract parity, registry parity, and reducer switch parity contract passed');
