import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { CheckSquare, AlertCircle, CheckCircle2, ListTodo } from 'lucide-react';
import { tasksApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { TaskCard } from '../components/TaskCard.js';
import { TaskFilterBar } from '../components/TaskFilterBar.js';
import { Task } from '../types/index.js';

export const MyTasksPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const filterParams = Object.fromEntries(searchParams.entries());

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['tasks', 'my-tasks', filterParams],
    queryFn: () => tasksApi.list(filterParams),
    staleTime: 30000,
  });

  const totalCount = tasks?.length || 0;
  const doneCount = tasks?.filter((t) => t.status === 'DONE').length || 0;
  const overdueCount = tasks?.filter((t) => t.isOverdue).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user?.role === 'DEVELOPER' ? 'My Assigned Tasks' : 'All Tasks'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user?.role === 'DEVELOPER'
              ? 'Move tasks along the delivery pipeline (To Do → In Progress → In Review → Done).'
              : 'Cross-project task list with URL-persisted filter state.'}
          </p>
        </div>

        {/* Quick metrics pills */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-medium">
            <ListTodo className="w-3.5 h-3.5 text-blue-400" />
            <span>{totalCount} Total</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{doneCount} Done</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300 font-medium">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>{overdueCount} Overdue</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <TaskFilterBar />

      {/* Task Cards Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tasks?.length === 0 ? (
        <div className="p-16 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No tasks match your criteria</h3>
          <p className="text-xs text-slate-400 mt-1">Adjust or clear filters to view more tasks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks?.map((task) => (
            <TaskCard key={task.id} task={task} showProject={true} />
          ))}
        </div>
      )}
    </div>
  );
};
