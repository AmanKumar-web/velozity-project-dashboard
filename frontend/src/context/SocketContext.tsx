import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './AuthContext.js';
import { ActivityLog, Task, Notification } from '../types/index.js';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineCount: number;
  latestActivity: ActivityLog | null;
  latestTaskUpdate: Task | null;
  latestNotification: { notification: Notification; unreadCount: number } | null;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [latestActivity, setLatestActivity] = useState<ActivityLog | null>(null);
  const [latestTaskUpdate, setLatestTaskUpdate] = useState<Task | null>(null);
  const [latestNotification, setLatestNotification] = useState<{ notification: Notification; unreadCount: number } | null>(null);

  const activeProjectRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Connect to Socket.io server via native WebSocket
    const socketInstance = io('/', {
      transports: ['websocket'],
      auth: { token },
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('⚡ [Socket] Connected as', user.name);
      setIsConnected(true);

      // Rejoin active project room if previously joined
      if (activeProjectRef.current) {
        socketInstance.emit('join_project', activeProjectRef.current);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('⚡ [Socket] Disconnected');
      setIsConnected(false);
    });

    // Real-time presence updates (Admin)
    socketInstance.on('online_count', (data: { count: number; onlineUserIds: string[] }) => {
      setOnlineCount(data.count);
    });

    // Real-time task updates
    socketInstance.on('task_updated', (task: Task) => {
      setLatestTaskUpdate(task);
      // Invalidate relevant queries so task lists update reactively
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project', task.projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    });

    // Real-time activity logs
    socketInstance.on('activity_new', (activity: ActivityLog) => {
      setLatestActivity(activity);
      queryClient.invalidateQueries({ queryKey: ['activity_feed'] });
    });

    // Real-time notifications
    socketInstance.on('notification_new', (data: { notification: Notification; unreadCount: number }) => {
      setLatestNotification(data);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });

    // Mock event listeners for live client previews (Vercel)
    const handleMockTask = (e: any) => {
      setLatestTaskUpdate(e.detail);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    };

    const handleMockActivity = (e: any) => {
      setLatestActivity(e.detail);
      queryClient.invalidateQueries({ queryKey: ['activity_feed'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    };

    const handleMockNotif = (e: any) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    window.addEventListener('mock:task_updated', handleMockTask);
    window.addEventListener('mock:activity_new', handleMockActivity);
    window.addEventListener('mock:notification_new', handleMockNotif);

    // Default presence for preview
    setIsConnected(true);
    setOnlineCount(4);

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      window.removeEventListener('mock:task_updated', handleMockTask);
      window.removeEventListener('mock:activity_new', handleMockActivity);
      window.removeEventListener('mock:notification_new', handleMockNotif);
    };
  }, [token, user?.id, queryClient]);

  const joinProject = useCallback(
    (projectId: string) => {
      activeProjectRef.current = projectId;
      if (socket && socket.connected) {
        socket.emit('join_project', projectId);
      }
    },
    [socket]
  );

  const leaveProject = useCallback(
    (projectId: string) => {
      if (activeProjectRef.current === projectId) {
        activeProjectRef.current = null;
      }
      if (socket && socket.connected) {
        socket.emit('leave_project', projectId);
      }
    },
    [socket]
  );

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineCount,
        latestActivity,
        latestTaskUpdate,
        latestNotification,
        joinProject,
        leaveProject,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
