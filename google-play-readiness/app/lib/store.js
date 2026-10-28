const users = new Map();
const reports = [];
const moderationActions = [];
const deletionRequests = [];

export const store = {
  upsertUser(user) { users.set(user.id, { ...users.get(user.id), ...user }); return users.get(user.id); },
  getUser(id) { return users.get(id) || null; },
  addReport(report) { reports.push(report); return report; },
  addModerationAction(action) { moderationActions.push(action); return action; },
  addDeletionRequest(request) { deletionRequests.push(request); return request; },
  snapshot() { return { users: [...users.values()], reports, moderationActions, deletionRequests }; }
};

// Replace this adapter with Supabase persistence in production while preserving the same method contract.
