import { supabase } from './supabaseClient';
import type { AccessibilityPassport } from '../accessibility/accessibilityPassport';

export async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Authentication required.');
  return data.user.id;
}

export async function saveAccessibilityPassportRemote(passport: AccessibilityPassport) {
  const userId = await currentUserId();
  const { error } = await supabase.from('accessibility_passports').upsert({
    user_id: userId,
    version: passport.version,
    preferences: passport.preferences,
    communication_preference: passport.communicationPreference ?? null,
    opportunity_needs: passport.opportunityNeeds,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function loadAccessibilityPassportRemote() {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from('accessibility_passports')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveLearningPassportRemote(input: {
  educationStage?: string;
  goals?: unknown[];
  milestones?: unknown[];
  credentials?: unknown[];
  progress?: Record<string, unknown>;
}) {
  const userId = await currentUserId();
  const { error } = await supabase.from('learning_passports').upsert({
    user_id: userId,
    education_stage: input.educationStage ?? null,
    goals: input.goals ?? [],
    milestones: input.milestones ?? [],
    credentials: input.credentials ?? [],
    progress: input.progress ?? {},
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function loadLearningPassportRemote() {
  const userId = await currentUserId();
  const { data, error } = await supabase.from('learning_passports').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveJarvisMemory(input: {
  id: string;
  scope: string;
  summary: string;
  sourceIds?: unknown[];
  confidence?: number;
  permissions?: Record<string, unknown>;
  expiresAt?: string;
}) {
  const userId = await currentUserId();
  const now = new Date().toISOString();
  const { error } = await supabase.from('stubbs_ai_memory').upsert({
    id: input.id,
    user_id: userId,
    scope: input.scope,
    summary: input.summary,
    source_ids: input.sourceIds ?? [],
    confidence: input.confidence ?? 1,
    permissions: input.permissions ?? {},
    expires_at: input.expiresAt ?? null,
    created_at: now,
    updated_at: now,
  });
  if (error) throw error;
}

export async function listJarvisMemory(scope?: string) {
  const userId = await currentUserId();
  let query = supabase.from('stubbs_ai_memory').select('*').eq('user_id', userId).order('updated_at', { ascending: false });
  if (scope) query = query.eq('scope', scope);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createJarvisApproval(input: {
  action: string;
  payload: Record<string, unknown>;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requestedBy?: string;
  expiresAt?: string;
}) {
  const userId = await currentUserId();
  const { data, error } = await supabase.from('agent_approval_requests').insert({
    account_id: userId,
    requested_by: input.requestedBy ?? 'jarvis',
    action: input.action,
    payload: input.payload,
    risk_level: input.riskLevel,
    status: 'pending',
    expires_at: input.expiresAt ?? null,
  }).select('*').single();
  if (error) throw error;
  return data;
}

export async function approveJarvisAction(id: string) {
  const userId = await currentUserId();
  const { data, error } = await supabase.from('agent_approval_requests')
    .update({ status: 'approved', approved_by: userId, approved_at: new Date().toISOString() })
    .eq('id', id)
    .eq('account_id', userId)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function submitModerationReport(input: {
  targetType: string;
  targetId: string;
  reportedUserId?: string;
  reason: string;
  details?: string;
  evidence?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}) {
  const userId = await currentUserId();
  const { data, error } = await supabase.from('moderation_reports').insert({
    reporter_user_id: userId,
    target_type: input.targetType,
    target_id: input.targetId,
    reported_user_id: input.reportedUserId ?? null,
    reason: input.reason,
    details: input.details ?? null,
    evidence_window_seconds: 30,
    evidence: input.evidence ?? {},
    severity: input.severity ?? 'medium',
    status: 'open',
  }).select('*').single();
  if (error) throw error;
  return data;
}
