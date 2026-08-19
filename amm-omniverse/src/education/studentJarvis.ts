export type StudentStage = 'prek' | 'elementary' | 'middle' | 'high' | 'ged' | 'trade' | 'college' | 'adult';

export type SchoolTask = {
  id: string;
  title: string;
  subject?: string;
  dueAt?: string;
  status: 'todo' | 'in_progress' | 'done';
  source?: 'student' | 'teacher' | 'guardian' | 'tryamm';
};

export type StudentJarvisProfile = {
  studentId: string;
  stage: StudentStage;
  goals: string[];
  subjects: string[];
  tasks: SchoolTask[];
  accessibilityNeeds: string[];
  guardianManaged?: boolean;
};

export type StudyPlan = {
  today: string[];
  thisWeek: string[];
  nextMilestone?: string;
};

export function buildStudyPlan(profile: StudentJarvisProfile): StudyPlan {
  const open = profile.tasks.filter((task) => task.status !== 'done');
  const sorted = [...open].sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });

  return {
    today: sorted.slice(0, 3).map((task) => task.title),
    thisWeek: sorted.slice(0, 7).map((task) => task.title),
    nextMilestone: profile.goals[0],
  };
}

export type TutorRequest = {
  subject: string;
  prompt: string;
  mode: 'explain' | 'practice' | 'quiz' | 'review' | 'study_plan';
};

export function schoolSafetyBoundary(request: TutorRequest) {
  // Student JARVIS teaches, explains and coaches. It should not impersonate the
  // student, take proctored tests, or submit graded work as if authored by them.
  const risky = /take (my|the) test|submit (this|my) assignment|do my exam/i.test(request.prompt);
  return risky
    ? { allowed: false, reason: 'Use tutoring/coaching mode instead of completing graded or proctored work for the student.' }
    : { allowed: true, reason: 'Educational support request' };
}

export type SchoolOpportunity = {
  id: string;
  type: 'scholarship' | 'internship' | 'apprenticeship' | 'college' | 'trade_program' | 'tutoring' | 'mentorship';
  title: string;
  requirements: string[];
};

export function nextSchoolActions(profile: StudentJarvisProfile, opportunities: SchoolOpportunity[]) {
  const study = buildStudyPlan(profile);
  return {
    study,
    opportunities: opportunities.slice(0, 5),
    accessibilityNeeds: [...profile.accessibilityNeeds],
  };
}
