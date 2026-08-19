export type JarvisScope =
  | 'profile.read'
  | 'projects.read'
  | 'projects.write'
  | 'calendar.read'
  | 'calendar.write'
  | 'opportunities.read'
  | 'opportunities.apply'
  | 'business.read'
  | 'business.write'
  | 'orders.read'
  | 'inventory.read'
  | 'inventory.write'
  | 'analytics.read'
  | 'messages.read'
  | 'messages.send'
  | 'money.read'
  | 'money.move';

export type JarvisPermission = {
  scope: JarvisScope;
  granted: boolean;
  requiresStepUp?: boolean;
};

export type JarvisProfile = {
  id: string;
  ownerId: string;
  kind: 'personal' | 'business';
  displayName: string;
  permissions: JarvisPermission[];
  goals: string[];
};

export const SAFE_DEFAULT_PERMISSIONS: JarvisPermission[] = [
  { scope: 'profile.read', granted: true },
  { scope: 'projects.read', granted: true },
  { scope: 'projects.write', granted: false },
  { scope: 'calendar.read', granted: false },
  { scope: 'calendar.write', granted: false, requiresStepUp: true },
  { scope: 'opportunities.read', granted: true },
  { scope: 'opportunities.apply', granted: false, requiresStepUp: true },
  { scope: 'business.read', granted: false },
  { scope: 'business.write', granted: false, requiresStepUp: true },
  { scope: 'orders.read', granted: false },
  { scope: 'inventory.read', granted: false },
  { scope: 'inventory.write', granted: false, requiresStepUp: true },
  { scope: 'analytics.read', granted: false },
  { scope: 'messages.read', granted: false },
  { scope: 'messages.send', granted: false, requiresStepUp: true },
  { scope: 'money.read', granted: false },
  { scope: 'money.move', granted: false, requiresStepUp: true },
];

export function createJarvisProfile(input: Pick<JarvisProfile, 'id' | 'ownerId' | 'displayName'> & Partial<Pick<JarvisProfile, 'kind' | 'permissions' | 'goals'>>): JarvisProfile {
  return {
    id: input.id,
    ownerId: input.ownerId,
    displayName: input.displayName,
    kind: input.kind ?? 'personal',
    permissions: input.permissions ?? SAFE_DEFAULT_PERMISSIONS.map((p) => ({ ...p })),
    goals: input.goals ?? [],
  };
}

export function canJarvis(profile: JarvisProfile, scope: JarvisScope) {
  return profile.permissions.some((p) => p.scope === scope && p.granted);
}

export function requiresStepUp(profile: JarvisProfile, scope: JarvisScope) {
  return profile.permissions.some((p) => p.scope === scope && p.granted && p.requiresStepUp);
}

export type JarvisActionRequest = {
  profileId: string;
  scope: JarvisScope;
  description: string;
  reversible: boolean;
};

export function authorizeJarvisAction(profile: JarvisProfile, request: JarvisActionRequest) {
  if (!canJarvis(profile, request.scope)) {
    return { allowed: false, reason: 'Permission not granted' } as const;
  }
  if (requiresStepUp(profile, request.scope)) {
    return { allowed: false, reason: 'Step-up confirmation required' } as const;
  }
  if (request.scope === 'money.move') {
    return { allowed: false, reason: 'Money movement always requires explicit human confirmation' } as const;
  }
  return { allowed: true, reason: 'Authorized by scoped permission' } as const;
}
