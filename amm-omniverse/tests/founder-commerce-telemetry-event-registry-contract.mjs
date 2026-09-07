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
}

console.log('Founder commerce telemetry event-type, authority-owner, and registry parity contract passed');
