import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Radio, User as UserIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { activityApi } from '../services/api.js';
import { useSocket } from '../context/SocketContext.js';
import { ActivityLog } from '../types/index.js';

interface ActivityFeedProps {
  projectId?: string;
  title?: string;
  maxItems?: number;
  compact?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  projectId,
  title = 'Live Activity Feed',
  maxItems = 20,
  compact = false,
}) => {
  const { latestActivity, isConnected } = useSocket();
  const [feed, setFeed] = useState<ActivityLog[]>([]);

  // 1. Database-backed catchup query (fetches missed events from PostgreSQL)
  const { data: initialActivities, isLoading } = useQuery({
    queryKey: ['activity_feed', projectId],
    queryFn: () => activityApi.getFeed({ limit: maxItems, projectId }),
    staleTime: 30000,
  });

  // Load initial DB activities
  useEffect(() => {
    if (initialActivities) {
      setFeed(initialActivities);
    }
  }, [initialActivities]);

  // 2. Real-time prepend via WebSocket
  useEffect(() => {
    if (!latestActivity) return;

    // Filter project if viewing a specific project
    if (projectId && latestActivity.projectId !== projectId) {
      return;
    }

    setFeed((prev) => {
      // Prevent duplicate if already added
      if (prev.some((item) => item.id === latestActivity.id)) {
        return prev;
      }
      return [latestActivity, ...prev].slice(0, maxItems);
    });
  }, [latestActivity, projectId, maxItems]);

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 backdrop-blur overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3 bg-slate-900/90">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <Radio
            className={`w-3.5 h-3.5 ${
              isConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'
            }`}
          />
          <span className={isConnected ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
            {isConnected ? 'Real-time' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Activities List */}
      <div className={`overflow-y-auto divide-y divide-slate-800/50 ${compact ? 'max-h-72' : 'max-h-[500px]'}`}>
        {isLoading && feed.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading activity feed...</div>
        ) : feed.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No activity recorded yet.
          </div>
        ) : (
          feed.map((act) => {
            const timeAgo = formatDistanceToNow(new Date(act.createdAt), { addSuffix: true });
            return (
              <div
                key={act.id}
                className="flex items-start gap-3 p-3.5 hover:bg-slate-800/40 transition group"
              >
                {/* User Avatar Circle */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow">
                  {act.user?.name ? act.user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {act.actionText}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{timeAgo}</span>
                    {act.project && !projectId && (
                      <>
                        <span>•</span>
                        <span className="text-blue-400/90 truncate max-w-[140px]">
                          {act.project.title}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
