import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../types/index.js';

interface TaskFilterBarProps {
  className?: string;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({ className = '' }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const search = searchParams.get('search') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters = Boolean(status || priority || search || startDate || endDate);

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={status}
            onChange={(e) => updateParam('status', e.target.value)}
            className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        {/* Priority Dropdown */}
        <select
          value={priority}
          onChange={(e) => updateParam('priority', e.target.value)}
          className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        {/* Due Date Range Inputs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Due:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => updateParam('startDate', e.target.value)}
            className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => updateParam('endDate', e.target.value)}
            className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition cursor-pointer"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/60 rounded-lg transition"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
};
