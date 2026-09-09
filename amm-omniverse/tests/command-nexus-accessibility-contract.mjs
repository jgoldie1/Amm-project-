import fs from 'node:fs';
import path from 'node:path';

const sourcePath = path.resolve('src/components/CommandNexusControlPlane.tsx');
if (!fs.existsSync(sourcePath)) {
  throw new Error('Command Nexus control plane component is missing');
}

const source = fs.readFileSync(sourcePath, 'utf8');

const requiredDialogTokens = [
  'role="dialog"',
  'aria-modal="true"',
  'aria-label="TRYAMM Command Nexus Control Plane"',
];

for (const token of requiredDialogTokens) {
  if (!source.includes(token)) {
    throw new Error(`Command Nexus modal accessibility contract is missing: ${token}`);
  }
}

if (!source.includes('aria-label="Search TRYAMM systems"')) {
  throw new Error('Command Nexus system search must retain an accessible name');
}

if (!source.includes('<button style={button} onClick={refresh}>')) {
  throw new Error('Command Nexus refresh control must remain a native keyboard-operable button');
}

if (!source.includes('<button style={button} onClick={onClose}>')) {
  throw new Error('Command Nexus close control must remain a native keyboard-operable button');
}

const escapeDismissalTokens = [
  "event.key==='Escape'",
  "window.addEventListener('keydown',handleKeyDown)",
  "window.removeEventListener('keydown',handleKeyDown)",
];

for (const token of escapeDismissalTokens) {
  if (!source.includes(token)) {
    throw new Error(`Command Nexus Escape dismissal contract is missing: ${token}`);
  }
}

if (!source.includes('role="status" aria-live="polite" aria-atomic="true"')) {
  throw new Error('Command Nexus system status changes must remain politely announced to assistive technology');
}

if (!source.includes('{error&&<div role="alert"')) {
  throw new Error('Command Nexus convergence errors must remain immediately announced to assistive technology');
}

if (!source.includes('minHeight:44')) {
  throw new Error('Command Nexus search target must retain its 44px minimum touch height');
}

if (!source.includes('const button:React.CSSProperties={minHeight:40')) {
  throw new Error('Command Nexus primary controls must retain their minimum touch target height');
}

console.log('Command Nexus dialog semantics, Escape dismissal, status/error announcements, accessible search naming, keyboard-native controls, and touch-target contract passed');
