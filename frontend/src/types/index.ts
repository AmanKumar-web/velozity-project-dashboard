export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'DEVELOPER';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  pmId: string;
  client?: Client;
  projectManager?: User;
  _count?: {
    tasks: number;
  };
  statusBreakdown?: Record<TaskStatus, number>;
  overdueTasksCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  developerId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  isOverdue: boolean;
  project?: {
    id: string;
    title: string;
    pmId: string;
    projectManager?: User;
  };
  assignedDeveloper?: User | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string;
  taskId?: string | null;
  userId: string;
  actionText: string;
  previousState?: any;
  newState?: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  task?: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
  } | null;
  project?: {
    id: string;
    title: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  role: Role;
  totalProjects?: number;
  totalTasks?: number;
  overdueTasksCount?: number;
  tasksByStatus?: Record<TaskStatus, number>;
  tasksByPriority?: Record<TaskPriority, number>;
  totalUsers?: number;
  activeOnlineUsersCount?: number;
  activeOnlineUserIds?: string[];
  projectsSummary?: Project[];
  upcomingDueThisWeek?: Task[];
  totalAssignedTasks?: number;
  overdueCount?: number;
  assignedTasks?: Task[];
}
