import React from 'react';
import { TaskPriority } from '../types/index.js';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = '' }) => {
  switch (priority) {
    case 'LOW':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 ${className}`}
        >
          <ArrowDown className="w-3 h-3 text-slate-400" />
          Low
        </span>
      );
    case 'MEDIUM':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-sky-950/70 text-sky-300 border border-sky-800/60 ${className}`}
        >
          <ArrowUp className="w-3 h-3 text-sky-400" />
          Medium
        </span>
      );
    case 'HIGH':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-950/70 text-amber-300 border border-amber-800/60 ${className}`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          High
        </span>
      );
    case 'CRITICAL':
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 animate-pulse ${className}`}
        >
          <AlertCircle className="w-3 h-3 text-rose-400" />
          Critical
        </span>
      );
    default:
      return null;
  }
};
