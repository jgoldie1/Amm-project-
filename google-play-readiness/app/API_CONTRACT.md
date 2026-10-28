# API contract

POST /api/onboarding { userId, dateOfBirth, role? }
GET /api/me
POST /api/interactions/check { targetUserId }
POST /api/reports { targetType, targetId, reason }
POST /api/blocks/:targetUserId
POST /api/mutes/:targetUserId
POST /api/lives { audience? }
POST /api/marketplace/checkout
POST /api/gifts/send { recipientId }
POST /api/account-deletion
POST /api/moderation/actions { targetId, action, reason }
GET /api/admin/snapshot
GET /health

All protected routes require `Authorization: Bearer <token>`.
