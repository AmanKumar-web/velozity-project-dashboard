import { Role, TaskStatus, TaskPriority } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export interface TaskQueryParams {
  status?: TaskStatus;
  priority?: TaskPriority;
  startDate?: string;
  endDate?: string;
  search?: string;
  projectId?: string;
}
