export const ROLES = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  DEVELOPER: 'DEVELOPER',
} as const;

export const TASK_STATUS = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE',
} as const;

export const TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

export const SOCKET_ROOMS = {
  ADMIN_GLOBAL: 'admin_global',
  project: (projectId: string) => `project_${projectId}`,
  user: (userId: string) => `user_${userId}`,
} as const;

export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_PROJECT: 'join_project',
  LEAVE_PROJECT: 'leave_project',

  // Server -> Client
  ONLINE_COUNT: 'online_count',
  TASK_UPDATED: 'task_updated',
  TASK_CREATED: 'task_created',
  ACTIVITY_NEW: 'activity_new',
  NOTIFICATION_NEW: 'notification_new',
} as const;
