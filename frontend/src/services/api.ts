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
} from '../types/index.js';

let currentAccessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
};

export const getAccessToken = () => currentAccessToken;

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // required for HttpOnly refresh token cookie
});

// Request interceptor: attach Authorization header
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (currentAccessToken) {
    config.headers.set('Authorization', `Bearer ${currentAccessToken}`);
  }
  return config;
});

// Response interceptor: handle automatic token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 from refresh endpoint itself, don't loop
    if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.set('Authorization', `Bearer ${token}`);
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          '/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.data.accessToken;
        setAccessToken(newAccessToken);
        originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        setAccessToken(null);
        window.dispatchEvent(new CustomEvent('auth:session_expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Typed API modules
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post('/auth/login', credentials);
    return res.data.data;
  },
  refresh: async () => {
    const res = await api.post('/auth/refresh');
    return res.data.data;
  },
  logout: async () => {
    const res = await api.post('/auth/logout');
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const res = await api.get('/projects');
    return res.data.data;
  },
  getById: async (id: string): Promise<Project> => {
    const res = await api.get(`/projects/${id}`);
    return res.data.data;
  },
  create: async (payload: { title: string; description: string; clientId: string; pmId?: string }): Promise<Project> => {
    const res = await api.post('/projects', payload);
    return res.data.data;
  },
  update: async (id: string, payload: Partial<Project>): Promise<Project> => {
    const res = await api.put(`/projects/${id}`, payload);
    return res.data.data;
  },
};

export const tasksApi = {
  list: async (params?: Record<string, string>): Promise<Task[]> => {
    const res = await api.get('/tasks', { params });
    return res.data.data;
  },
  create: async (payload: {
    title: string;
    description: string;
    projectId: string;
    developerId?: string | null;
    priority: string;
    dueDate: string;
  }): Promise<Task> => {
    const res = await api.post('/tasks', payload);
    return res.data.data;
  },
  update: async (id: string, payload: Partial<Task>): Promise<Task> => {
    const res = await api.patch(`/tasks/${id}`, payload);
    return res.data.data;
  },
};

export const activityApi = {
  getFeed: async (params?: { limit?: number; projectId?: string }): Promise<ActivityLog[]> => {
    const res = await api.get('/activity/feed', { params });
    return res.data.data;
  },
};

export const notificationsApi = {
  list: async (): Promise<{ notifications: Notification[]; unreadCount: number }> => {
    const res = await api.get('/notifications');
    return res.data.data;
  },
  markRead: async (id: string): Promise<{ notification: Notification; unreadCount: number }> => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data.data;
  },
  markAllRead: async (): Promise<{ message: string; unreadCount: number }> => {
    const res = await api.patch('/notifications/read-all');
    return res.data.data;
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await api.get('/dashboard/stats');
    return res.data.data;
  },
};

export const usersApi = {
  list: async (role?: Role): Promise<User[]> => {
    const res = await api.get('/users', { params: { role } });
    return res.data.data;
  },
  getClients: async (): Promise<Client[]> => {
    const res = await api.get('/users/clients');
    return res.data.data;
  },
};
