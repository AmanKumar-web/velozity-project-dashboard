import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  User,
  Project,
  Task,
  ActivityLog,
  Notification,
  DashboardStats,
  Client,
  Role,
  TaskStatus,
  TaskPriority,
} from '../types/index.js';
import {
  mockUsers,
  mockClients,
  mockProjects,
  mockTasks,
  mockActivities,
  mockNotifications,
  setMockUser,
  getMockUser,
  dispatchMockEvent,
} from './mockData.js';

let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (currentAccessToken) {
    config.headers.set('Authorization', `Bearer ${currentAccessToken}`);
  }
  return config;
});

// Helper to determine if we should fall back to client mock (e.g. 404 from Vercel static hosting)
const shouldFallback = (error: any) => {
  return !error.response || error.response.status === 404 || error.response.status === 502;
};

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    try {
      const res = await api.post('/auth/login', credentials);
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const found = mockUsers.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase());
        if (!found) {
          throw new Error('Invalid email or password');
        }
        setMockUser(found);
        setAccessToken('mock-jwt-token-' + found.id);
        return {
          user: found,
          accessToken: 'mock-jwt-token-' + found.id,
        };
      }
      throw error;
    }
  },
  refresh: async () => {
    try {
      const res = await api.post('/auth/refresh');
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];
        setMockUser(user);
        setAccessToken('mock-jwt-token-' + user.id);
        return {
          user,
          accessToken: 'mock-jwt-token-' + user.id,
        };
      }
      throw error;
    }
  },
  logout: async () => {
    try {
      const res = await api.post('/auth/logout');
      return res.data;
    } catch (error) {
      setMockUser(null);
      setAccessToken(null);
      return { success: true };
    }
  },
  getMe: async (): Promise<User> => {
    try {
      const res = await api.get('/auth/me');
      return res.data.data;
    } catch (error) {
      const user = getMockUser() || mockUsers[0];
      return user;
    }
  },
};

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    try {
      const res = await api.get('/projects');
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];
        let filtered = mockProjects;
        if (user.role === 'PROJECT_MANAGER') {
          filtered = mockProjects.filter((p) => p.pmId === user.id);
        } else if (user.role === 'DEVELOPER') {
          const devProjectIds = new Set(mockTasks.filter((t) => t.developerId === user.id).map((t) => t.projectId));
          filtered = mockProjects.filter((p) => devProjectIds.has(p.id));
        }

        return filtered.map((p) => {
          const pTasks = mockTasks.filter((t) => t.projectId === p.id);
          const breakdown: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
          for (const t of pTasks) breakdown[t.status] = (breakdown[t.status] || 0) + 1;
          const overdueCount = pTasks.filter((t) => t.isOverdue).length;

          return {
            ...p,
            _count: { tasks: pTasks.length },
            statusBreakdown: breakdown,
            overdueTasksCount: overdueCount,
          };
        });
      }
      throw error;
    }
  },
  getById: async (id: string): Promise<Project> => {
    try {
      const res = await api.get(`/projects/${id}`);
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const proj = mockProjects.find((p) => p.id === id);
        if (!proj) throw new Error('Project not found');
        return proj;
      }
      throw error;
    }
  },
  create: async (payload: { title: string; description: string; clientId: string; pmId?: string }): Promise<Project> => {
    try {
      const res = await api.post('/projects', payload);
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];
        const newProj: Project = {
          id: `proj-${Date.now()}`,
          title: payload.title,
          description: payload.description,
          clientId: payload.clientId,
          pmId: payload.pmId || user.id,
          client: mockClients.find((c) => c.id === payload.clientId) || mockClients[0],
          projectManager: mockUsers.find((u) => u.id === (payload.pmId || user.id)) || user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockProjects.unshift(newProj);
        return newProj;
      }
      throw error;
    }
  },
  update: async (id: string, payload: Partial<Project>): Promise<Project> => {
    try {
      const res = await api.put(`/projects/${id}`, payload);
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const idx = mockProjects.findIndex((p) => p.id === id);
        if (idx === -1) throw new Error('Project not found');
        mockProjects[idx] = { ...mockProjects[idx], ...payload, updatedAt: new Date().toISOString() };
        return mockProjects[idx];
      }
      throw error;
    }
  },
};

export const tasksApi = {
  list: async (params?: Record<string, string>): Promise<Task[]> => {
    try {
      const res = await api.get('/tasks', { params });
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];
        let list = [...mockTasks];

        if (user.role === 'PROJECT_MANAGER') {
          const pmProjectIds = new Set(mockProjects.filter((p) => p.pmId === user.id).map((p) => p.id));
          list = list.filter((t) => pmProjectIds.has(t.projectId));
        } else if (user.role === 'DEVELOPER') {
          list = list.filter((t) => t.developerId === user.id);
        }

        if (params?.projectId) {
          list = list.filter((t) => t.projectId === params.projectId);
        }
        if (params?.status) {
          list = list.filter((t) => t.status === params.status);
        }
        if (params?.priority) {
          list = list.filter((t) => t.priority === params.priority);
        }
        if (params?.search) {
          const s = params.search.toLowerCase();
          list = list.filter((t) => t.title.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
        }
        if (params?.startDate) {
          list = list.filter((t) => new Date(t.dueDate) >= new Date(params.startDate));
        }
        if (params?.endDate) {
          list = list.filter((t) => new Date(t.dueDate) <= new Date(params.endDate));
        }

        return list;
      }
      throw error;
    }
  },
  create: async (payload: {
    title: string;
    description: string;
    projectId: string;
    developerId?: string | null;
    priority: string;
    dueDate: string;
  }): Promise<Task> => {
    try {
      const res = await api.post('/tasks', payload);
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];
        const proj = mockProjects.find((p) => p.id === payload.projectId);
        const dev = mockUsers.find((u) => u.id === payload.developerId);

        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: payload.title,
          description: payload.description,
          projectId: payload.projectId,
          developerId: payload.developerId || null,
          status: 'TODO',
          priority: payload.priority as TaskPriority,
          dueDate: payload.dueDate,
          isOverdue: new Date(payload.dueDate) < new Date(),
          project: proj,
          assignedDeveloper: dev || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockTasks.unshift(newTask);

        // Record activity
        const newAct: ActivityLog = {
          id: `act-${Date.now()}`,
          projectId: payload.projectId,
          taskId: newTask.id,
          userId: user.id,
          actionText: `${user.name} created Task "${newTask.title}"`,
          createdAt: new Date().toISOString(),
          user,
          project: proj,
        };
        mockActivities.unshift(newAct);

        // Notification if assigned
        if (dev) {
          mockNotifications.unshift({
            id: `notif-${Date.now()}`,
            userId: dev.id,
            message: `You have been assigned to task: "${newTask.title}"`,
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }

        dispatchMockEvent('mock:task_updated', newTask);
        dispatchMockEvent('mock:activity_new', newAct);

        return newTask;
      }
      throw error;
    }
  },
  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    try {
      const res = await api.patch(`/tasks/${id}`, payload);
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];
        const idx = mockTasks.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error('Task not found');

        const prev = mockTasks[idx];
        const updated: Task = { ...prev, ...payload, updatedAt: new Date().toISOString() };
        if (payload.status === 'DONE') {
          updated.isOverdue = false;
        }

        mockTasks[idx] = updated;

        // If status changed, record activity
        if (payload.status && payload.status !== prev.status) {
          const statusLabels: Record<string, string> = {
            TODO: 'To Do',
            IN_PROGRESS: 'In Progress',
            IN_REVIEW: 'In Review',
            DONE: 'Done',
          };
          const actText = `${user.name} moved Task "${updated.title}" from ${statusLabels[prev.status] || prev.status} → ${statusLabels[payload.status] || payload.status}`;
          const newAct: ActivityLog = {
            id: `act-${Date.now()}`,
            projectId: updated.projectId,
            taskId: updated.id,
            userId: user.id,
            actionText: actText,
            createdAt: new Date().toISOString(),
            user,
            project: updated.project,
          };
          mockActivities.unshift(newAct);
          dispatchMockEvent('mock:activity_new', newAct);

          if (payload.status === 'IN_REVIEW' && updated.project?.pmId) {
            mockNotifications.unshift({
              id: `notif-${Date.now()}`,
              userId: updated.project.pmId,
              message: `Task "${updated.title}" was moved to In Review by ${user.name}`,
              isRead: false,
              createdAt: new Date().toISOString(),
            });
            dispatchMockEvent('mock:notification_new', {});
          }
        }

        dispatchMockEvent('mock:task_updated', updated);

        return updated;
      }
      throw error;
    }
  },
};

export const activityApi = {
  getFeed: async (params?: { limit?: number; projectId?: string }): Promise<ActivityLog[]> => {
    try {
      const res = await api.get('/activity/feed', { params });
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];
        let list = [...mockActivities];

        if (user.role === 'PROJECT_MANAGER') {
          const pmProjectIds = new Set(mockProjects.filter((p) => p.pmId === user.id).map((p) => p.id));
          list = list.filter((a) => pmProjectIds.has(a.projectId));
        } else if (user.role === 'DEVELOPER') {
          list = list.filter((a) => a.userId === user.id || mockTasks.some((t) => t.developerId === user.id && t.id === a.taskId));
        }

        if (params?.projectId) {
          list = list.filter((a) => a.projectId === params.projectId);
        }

        return list.slice(0, params?.limit || 20);
      }
      throw error;
    }
  },
};

export const notificationsApi = {
  list: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    try {
      const res = await api.get('/notifications');
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];
        const userNotifs = mockNotifications.filter((n) => n.userId === user.id);
        const unreadCount = userNotifs.filter((n) => !n.isRead).length;
        return { notifications: userNotifs, unreadCount };
      }
      throw error;
    }
  },
  markRead: async (id: string): Promise<{ notification: Notification; unreadCount: number }> => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const notif = mockNotifications.find((n) => n.id === id);
        if (notif) notif.isRead = true;
        const user = getMockUser() || mockUsers[0];
        const unreadCount = mockNotifications.filter((n) => n.userId === user.id && !n.isRead).length;
        return { notification: notif!, unreadCount };
      }
      throw error;
    }
  },
  markAllRead: async (): Promise<{ message: string; unreadCount: number }> => {
    try {
      const res = await api.patch('/notifications/read-all');
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];
        mockNotifications.filter((n) => n.userId === user.id).forEach((n) => (n.isRead = true));
        return { message: 'All notifications marked as read', unreadCount: 0 };
      }
      throw error;
    }
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    } catch (error) {
      if (shouldFallback(error)) {
        const user = getMockUser() || mockUsers[0];

        if (user.role === 'ADMIN') {
          const tasksByStatus: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
          const tasksByPriority: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
          let overdueCount = 0;

          for (const t of mockTasks) {
            tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
            tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
            if (t.isOverdue) overdueCount++;
          }

          return {
            role: 'ADMIN',
            totalProjects: mockProjects.length,
            totalTasks: mockTasks.length,
            overdueTasksCount: overdueCount,
            tasksByStatus,
            tasksByPriority,
            totalUsers: mockUsers.length,
            activeOnlineUsersCount: 4,
          };
        }

        if (user.role === 'PROJECT_MANAGER') {
          const pmProjects = mockProjects.filter((p) => p.pmId === user.id);
          const pmProjectIds = new Set(pmProjects.map((p) => p.id));
          const pmTasks = mockTasks.filter((t) => pmProjectIds.has(t.projectId));

          const tasksByStatus: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
          const tasksByPriority: Record<TaskPriority, number> = { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 };
          let overdueCount = 0;

          for (const t of pmTasks) {
            tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
            tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
            if (t.isOverdue) overdueCount++;
          }

          return {
            role: 'PROJECT_MANAGER',
            totalProjects: pmProjects.length,
            projectsSummary: pmProjects.map((p) => ({
              ...p,
              _count: { tasks: mockTasks.filter((t) => t.projectId === p.id).length },
            })),
            tasksByPriority,
            tasksByStatus,
            upcomingDueThisWeek: pmTasks.filter((t) => t.status !== 'DONE'),
            overdueTasksCount: overdueCount,
          };
        }

        if (user.role === 'DEVELOPER') {
          const devTasks = mockTasks.filter((t) => t.developerId === user.id);
          const tasksByStatus: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 0, IN_REVIEW: 0, DONE: 0 };
          let overdueCount = 0;

          for (const t of devTasks) {
            tasksByStatus[t.status] = (tasksByStatus[t.status] || 0) + 1;
            if (t.isOverdue) overdueCount++;
          }

          return {
            role: 'DEVELOPER',
            totalAssignedTasks: devTasks.length,
            tasksByStatus,
            overdueCount,
            assignedTasks: devTasks,
          };
        }
      }
      throw error;
    }
  },
};

export const usersApi = {
  list: async (role?: Role): Promise<User[]> => {
    try {
      const res = await api.get('/users', { params: { role } });
      return res.data.data;
    } catch (error) {
      if (role) return mockUsers.filter((u) => u.role === role);
      return mockUsers;
    }
  },
  getClients: async (): Promise<Client[]> => {
    try {
      const res = await api.get('/users/clients');
      return res.data.data;
    } catch (error) {
      return mockClients;
    }
  },
};
