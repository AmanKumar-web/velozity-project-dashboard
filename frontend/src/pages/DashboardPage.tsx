import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Users,
  Clock,
  Plus,
  ArrowRight,
  Calendar,
  ListTodo,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { dashboardApi } from '../services/api.js';
import { StatCard } from '../components/StatCard.js';
import { ActivityFeed } from '../components/ActivityFeed.js';
import { TaskCard } from '../components/TaskCard.js';
import { ProjectModal } from '../components/ProjectModal.js';
import { TaskModal } from '../components/TaskModal.js';
import { Task } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { onlineCount } = useSocket();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: dashboardApi.getStats,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  const role = user?.role;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 shadow-xl backdrop-blur">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            {role === 'ADMIN'
              ? 'Executive Control Center'
              : role === 'PROJECT_MANAGER'
              ? 'Project Operations Hub'
              : 'Developer Workspace'}
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {role === 'ADMIN'
              ? 'Monitoring cross-agency project health, team velocity, and real-time socket connections.'
              : role === 'PROJECT_MANAGER'
              ? 'Managing assigned client deliverables, priority queues, and sprint timelines.'
              : 'Tracking your assigned tasks and submitting items for QA and code review.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          {(role === 'ADMIN' || role === 'PROJECT_MANAGER') && (
            <>
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white rounded-xl transition shadow"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                New Project
              </button>
              <button
                onClick={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white rounded-xl transition shadow-lg shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* ----------------- ADMIN DASHBOARD VIEW ----------------- */}
      {role === 'ADMIN' && stats && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Projects"
              value={stats.totalProjects || 0}
              subtitle="Managed client engagements"
              icon={<FolderKanban className="w-5 h-5 text-blue-400" />}
              accentColor="blue"
            />
            <StatCard
              title="Total Tasks"
              value={stats.totalTasks || 0}
              subtitle={`${stats.tasksByStatus?.DONE || 0} completed`}
              icon={<ListTodo className="w-5 h-5 text-emerald-400" />}
              accentColor="emerald"
            />
            <StatCard
              title="Overdue Tasks"
              value={stats.overdueTasksCount || 0}
              subtitle="Requires PM intervention"
              icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
              accentColor="rose"
            />
            <StatCard
              title="Live Online Users"
              value={onlineCount || stats.activeOnlineUsersCount || 1}
              subtitle="Active WebSocket sessions"
              icon={<Users className="w-5 h-5 text-purple-400" />}
              accentColor="purple"
            />
          </div>

          {/* Task Status Breakdown Grid & Live Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status Breakdown & Priority distribution */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Breakdown Cards */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
                  <span>Task Status Distribution</span>
                  <Link to="/projects" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    View all projects <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                    <p className="text-xs text-slate-400">To Do</p>
                    <p className="text-2xl font-bold text-slate-200 mt-1">
                      {stats.tasksByStatus?.TODO || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/40 text-center">
                    <p className="text-xs text-blue-300">In Progress</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">
                      {stats.tasksByStatus?.IN_PROGRESS || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 text-center">
                    <p className="text-xs text-purple-300">In Review</p>
                    <p className="text-2xl font-bold text-purple-400 mt-1">
                      {stats.tasksByStatus?.IN_REVIEW || 0}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center">
                    <p className="text-xs text-emerald-300">Done</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                      {stats.tasksByStatus?.DONE || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur">
                <h3 className="text-sm font-semibold text-white mb-4">Task Priority Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/40 text-center">
                    <span className="text-xs text-slate-400">Low</span>
                    <p className="text-xl font-bold text-slate-300 mt-1">
                      {stats.tasksByPriority?.LOW || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-center">
                    <span className="text-xs text-sky-400">Medium</span>
                    <p className="text-xl font-bold text-sky-300 mt-1">
                      {stats.tasksByPriority?.MEDIUM || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-center">
                    <span className="text-xs text-amber-400">High</span>
                    <p className="text-xl font-bold text-amber-300 mt-1">
                      {stats.tasksByPriority?.HIGH || 0}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-center">
                    <span className="text-xs text-rose-400">Critical</span>
                    <p className="text-xl font-bold text-rose-300 mt-1">
                      {stats.tasksByPriority?.CRITICAL || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Real-Time Activity Feed */}
            <div className="lg:col-span-1">
              <ActivityFeed title="Global Activity Stream" maxItems={20} />
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PM DASHBOARD VIEW ----------------- */}
      {role === 'PROJECT_MANAGER' && stats && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="My Managed Projects"
              value={stats.totalProjects || 0}
              subtitle="Projects under your ownership"
              icon={<FolderKanban className="w-5 h-5 text-blue-400" />}
              accentColor="blue"
            />
            <StatCard
              title="Upcoming Due This Week"
              value={stats.upcomingDueThisWeek?.length || 0}
              subtitle="Deadlines within 7 days"
              icon={<Clock className="w-5 h-5 text-amber-400" />}
              accentColor="amber"
            />
            <StatCard
              title="Overdue Tasks"
              value={stats.overdueTasksCount || 0}
              subtitle="Missed deadlines in your projects"
              icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
              accentColor="rose"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Projects Summary & Upcoming Deadlines */}
            <div className="lg:col-span-2 space-y-6">
              {/* Projects Summary */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">My Projects Summary</h3>
                  <Link to="/projects" className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                    Manage Projects <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.projectsSummary?.map((p) => (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      className="p-4 rounded-xl border border-slate-800 bg-slate-800/40 hover:bg-slate-800/80 hover:border-slate-700 transition block group"
                    >
                      <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wide">
                        {p.client?.name}
                      </span>
                      <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 mt-1">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                      <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        <span>{p._count?.tasks || 0} total tasks</span>
                        <span className="text-blue-400 group-hover:translate-x-0.5 transition">
                          View details →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Upcoming Deadlines This Week */}
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  Upcoming Due Dates This Week
                </h3>

                {(!stats.upcomingDueThisWeek || stats.upcomingDueThisWeek.length === 0) ? (
                  <p className="text-xs text-slate-400">No urgent deadlines due this week.</p>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {stats.upcomingDueThisWeek.map((t) => (
                      <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold text-white">{t.title}</p>
                          <p className="text-[11px] text-slate-400">
                            {t.project?.title} • Assignee: {t.assignedDeveloper?.name || 'Unassigned'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-amber-400">
                            Due {format(new Date(t.dueDate), 'MMM d')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* PM Activity Stream */}
            <div className="lg:col-span-1">
              <ActivityFeed title="Team Activity Feed" maxItems={20} />
            </div>
          </div>
        </div>
      )}

      {/* ----------------- DEVELOPER DASHBOARD VIEW ----------------- */}
      {role === 'DEVELOPER' && stats && (
        <div className="space-y-8">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="My Assigned Tasks"
              value={stats.totalAssignedTasks || 0}
              subtitle="Active assignments"
              icon={<ListTodo className="w-5 h-5 text-blue-400" />}
              accentColor="blue"
            />
            <StatCard
              title="Completed"
              value={stats.tasksByStatus?.DONE || 0}
              subtitle="Delivered & approved"
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              accentColor="emerald"
            />
            <StatCard
              title="Overdue Tasks"
              value={stats.overdueCount || 0}
              subtitle="Past due deadline"
              icon={<AlertCircle className="w-5 h-5 text-rose-400" />}
              accentColor="rose"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assigned Tasks List (Sorted by Priority & Due Date) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Your Assigned Tasks</h3>
                  <p className="text-xs text-slate-400">Sorted by Priority, then Due Date</p>
                </div>
                <Link
                  to="/my-tasks"
                  className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                >
                  Filtered View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {(!stats.assignedTasks || stats.assignedTasks.length === 0) ? (
                <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending tasks currently assigned to you.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {stats.assignedTasks.map((t) => (
                    <TaskCard key={t.id} task={t} showProject={true} />
                  ))}
                </div>
              )}
            </div>

            {/* Developer Activity Feed */}
            <div className="lg:col-span-1">
              <ActivityFeed title="Your Task Activity" maxItems={20} />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProjectModal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} />
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
