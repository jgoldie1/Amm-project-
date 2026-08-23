export type TeamMemberStatus = 'invited' | 'active' | 'leave' | 'inactive';
export type WorkerType = 'employee' | 'contractor' | 'advisor' | 'volunteer' | 'intern' | 'mentor';

export type TeamMember = {
  id: string;
  displayName: string;
  workerType: WorkerType;
  status: TeamMemberStatus;
  department?: string;
  title?: string;
  managerId?: string;
  permissions: string[];
  notes?: string;
};

export type JobOpening = {
  id: string;
  title: string;
  department: string;
  locationType: 'remote' | 'hybrid' | 'onsite';
  status: 'draft' | 'open' | 'paused' | 'closed';
  accessibility?: string[];
  skills?: string[];
};

export type HRCase = {
  id: string;
  employeeId?: string;
  type: 'onboarding' | 'accommodation' | 'leave' | 'payroll' | 'performance' | 'training' | 'workplace_issue' | 'offboarding';
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  createdAt: string;
  private: true;
};

export const initialTryammTeam: TeamMember[] = [
  {
    id: 'nikeira-frances',
    displayName: 'Nikeira Frances',
    workerType: 'employee',
    status: 'active',
    department: 'Human Resources',
    title: 'Role to be confirmed',
    permissions: [],
    notes: 'Added to the TRYAMM team registry. Exact HR title/responsibilities should be confirmed before granting privileged access.',
  },
  {
    id: 'bj',
    displayName: 'BJ',
    workerType: 'employee',
    status: 'active',
    department: 'Human Resources',
    title: 'Role to be confirmed',
    permissions: [],
    notes: 'Added as Nikeira Frances\'s brother per founder direction. Exact title/responsibilities should be confirmed before granting privileged access.',
  },
];

export function canViewHRCase(member: TeamMember, hrCase: HRCase) {
  return member.permissions.includes('hr.case.read') || (hrCase.employeeId != null && hrCase.employeeId === member.id);
}

export function canManageCompensation(member: TeamMember) {
  return member.permissions.includes('hr.compensation.manage');
}

export function createHRCase(type: HRCase['type'], employeeId?: string): HRCase {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? `hr-${Date.now()}`,
    employeeId,
    type,
    status: 'open',
    createdAt: new Date().toISOString(),
    private: true,
  };
}

// HR data is sensitive. Production records belong server-side with RLS/least privilege,
// audit events, retention rules, and separation between ordinary employee profiles and
// private personnel/accommodation/payroll records.
