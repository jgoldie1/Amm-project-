import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/foundation/founderCommerceTelemetry.ts');
const source = fs.readFileSync(sourcePath, 'utf8');

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

const registryEventTypes = [...authorityRegistryBlock.matchAll(/^\s*'([^']+)'\s*:/gm)].map(
  (match) => match[1],
);
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

console.log('Founder commerce telemetry event-type and authority registry parity contract passed');
