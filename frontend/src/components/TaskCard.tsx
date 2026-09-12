import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, AlertCircle, User as UserIcon, Edit2 } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { Task, TaskStatus } from '../types/index.js';
import { StatusBadge } from './StatusBadge.js';
import { PriorityBadge } from './PriorityBadge.js';
import { tasksApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  showProject?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, showProject = false }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: TaskStatus) => tasksApi.update(task.id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['project', task.projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });

  const isAssignedToMe = user?.id === task.developerId;
  const isProjectManager = user?.role === 'PROJECT_MANAGER' && task.project?.pmId === user.id;
  const isAdmin = user?.role === 'ADMIN';

  // Can the current user update the status?
  const canUpdateStatus = isAdmin || isProjectManager || (user?.role === 'DEVELOPER' && isAssignedToMe);
  // Can the current user edit full task details (title, priority, developer, etc.)?
  const canEditTask = isAdmin || isProjectManager;

  const dueDateObj = new Date(task.dueDate);
  const isOverdue = task.isOverdue || (task.status !== 'DONE' && isPast(dueDateObj));

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border p-4 transition-all duration-200 backdrop-blur ${
        isOverdue
          ? 'border-rose-900/60 bg-gradient-to-b from-rose-950/20 to-slate-900/80 hover:border-rose-700/80 shadow-sm shadow-rose-950/50'
          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
      }`}
    >
      {/* Top row: Badges and Actions */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            {isOverdue && (
              <span className="inline-flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-xs font-bold text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>

          {canEditTask && onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
              title="Edit Task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Project Tag if required */}
        {showProject && task.project && (
          <p className="text-[11px] font-semibold text-blue-400 tracking-wide uppercase mb-1">
            {task.project.title}
          </p>
        )}

        {/* Title */}
        <h4 className="text-sm font-semibold text-white leading-snug group-hover:text-blue-300 transition">
          {task.title}
        </h4>

        {/* Description */}
        <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      </div>

      {/* Bottom row: Assignee, Due Date, and Status Quick Selector */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-3">
          {/* Assigned Developer */}
          <div className="flex items-center gap-1.5 text-slate-300" title="Assigned Developer">
            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
            <span className={task.assignedDeveloper ? 'font-medium' : 'italic text-slate-400'}>
              {task.assignedDeveloper ? task.assignedDeveloper.name : 'Unassigned'}
            </span>
          </div>

          {/* Due Date */}
          <div
            className={`flex items-center gap-1.5 ${
              isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(dueDateObj, 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Quick Status Transition Dropdown */}
        {canUpdateStatus && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Move:</span>
            <select
              value={task.status}
              disabled={updateStatusMutation.isPending}
              onChange={(e) => updateStatusMutation.mutate(e.target.value as TaskStatus)}
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};
