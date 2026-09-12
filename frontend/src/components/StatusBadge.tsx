import React from 'react';
import { TaskStatus } from '../types/index.js';
import { CheckCircle2, Clock, PlayCircle, Eye } from 'lucide-react';

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  switch (status) {
    case 'TODO':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 ${className}`}
        >
          <Clock className="w-3 h-3 text-slate-400" />
          To Do
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/70 text-blue-300 border border-blue-800/80 ${className}`}
        >
          <PlayCircle className="w-3 h-3 text-blue-400" />
          In Progress
        </span>
      );
    case 'IN_REVIEW':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-950/70 text-purple-300 border border-purple-800/80 ${className}`}
        >
          <Eye className="w-3 h-3 text-purple-400" />
          In Review
        </span>
      );
    case 'DONE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 ${className}`}
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          Done
        </span>
      );
    default:
      return null;
  }
};
